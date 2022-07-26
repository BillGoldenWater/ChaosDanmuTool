/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::convert::Infallible;
use std::net::{IpAddr, Ipv4Addr, SocketAddr};

use hyper::{Body, Method, Request as HyperRequest, Response, Server, StatusCode, Version};
use hyper::server::conn::AddrStream;
use hyper::service::{make_service_fn, service_fn};
use oneshot::Sender;
use tauri::{AssetResolver, Wry};
use tokio::sync::Mutex;
use tokio_tungstenite::{MaybeTlsStream, WebSocketStream};
use tokio_tungstenite::tungstenite::handshake::derive_accept_key;
use tokio_tungstenite::tungstenite::protocol::Role;

use crate::{elprintln, lprintln};
use crate::libs::network::command_broadcast_server::CommandBroadcastServer;

lazy_static! {
    pub static ref HTTP_SERVER_STATIC_INSTANCE: Mutex<HttpServer> =
        Mutex::new(HttpServer::new());
}

pub struct HttpServer {
  tx: Option<Option<Sender<()>>>,
  asset_resolver: Option<AssetResolver<Wry>>,
}

impl HttpServer {
  fn new() -> HttpServer {
    HttpServer {
      tx: None,
      asset_resolver: None,
    }
  }

  pub async fn start(asset_resolver: AssetResolver<Wry>, port: u16) {
    let this = &mut *HTTP_SERVER_STATIC_INSTANCE.lock().await;
    this.start_(asset_resolver, port)
  }

  fn start_(&mut self, asset_resolver: AssetResolver<Wry>, port: u16) {
    self.asset_resolver = Some(asset_resolver);

    let addr = SocketAddr::new(IpAddr::V4(Ipv4Addr::new(0, 0, 0, 0)), port);

    let make_service =
      make_service_fn(|_| {
        async { Ok::<_, Infallible>(service_fn(Self::on_request)) }
      });


    let server = Server::try_bind(&addr);
    let server = if let Err(err) = server {
      elprintln!("Failed to start server: {:?}",err);
      return;
    } else {
      server.unwrap().serve(make_service)
    };

    lprintln!("server start at: {:?}", server.local_addr());

    let (tx, rx) = oneshot::channel::<()>();
    self.tx = Some(Some(tx));

    let server = server.with_graceful_shutdown(async move {
      rx.await.ok();
      lprintln!("server stopped");
    });
    tauri::async_runtime::spawn(async move {
      if let Err(err) = server.await {
        elprintln!("server error: {}", err);
      }
    });
  }

  pub async fn stop() {
    let this = &mut *HTTP_SERVER_STATIC_INSTANCE.lock().await;
    this.stop_()
  }

  fn stop_(&mut self) {
    if let Some(tx) = self.tx.replace(None) {
      if let Some(tx) = tx {
        lprintln!("stopping server");
        let _ = tx.send(());
      }
    }
  }

  async fn on_request(mut req: HyperRequest<Body>) -> Result<Response<Body>, Infallible> {
    // region try websocket
    if let Some(res) = create_websocket_upgrade_response(&req) {
      tauri::async_runtime::spawn(async move {
        match hyper::upgrade::on(&mut req).await {
          Ok(upgraded) => {
            let upgraded_parts = upgraded.downcast::<AddrStream>();
            if upgraded_parts.is_err() {
              elprintln!("failed when convert 'Upgraded' to AddrStream")
            }

            let tcp_stream = upgraded_parts.unwrap().io.into_inner();

            let websocket_stream =
              WebSocketStream::from_raw_socket(
                MaybeTlsStream::Plain(tcp_stream),
                Role::Server,
                None,
              ).await;

            CommandBroadcastServer::accept(websocket_stream).await;
            lprintln!("upgraded");
          }
          Err(err) => {
            elprintln!("Upgrade error: {}", err);
          }
        }
      });

      return Ok(res);
    }
    // endregion

    // region try asset
    let this = &*HTTP_SERVER_STATIC_INSTANCE.lock().await;
    if let Some(asset_resolver) = &this.asset_resolver {
      if let Some(asset) = asset_resolver.get(req.uri().to_string()) {
        let mut res_builder = Response::builder()
          .header("Content-Type", asset.mime_type);

        if let Some(csp) = asset.csp_header.clone() {
          res_builder = res_builder.header("Content-Security-Policy", csp)
        }

        #[allow(unused_mut)]
          let mut data = asset.bytes;

        #[cfg(target_os = "linux")]
        if let Some(csp) = asset.csp_header.clone() {
          let html = String::from_utf8_lossy(&asset.bytes);
          let body = html.replacen(tauri::utils::html::CSP_TOKEN, csp.as_str(), 1);
          data = body.as_bytes().to_vec();
        }

        let res_result = res_builder.body(Body::from(data));

        return if let Err(err) = res_result {
          elprintln!("unable to build a response\n{:?}", err);
          Ok(create_empty_response(StatusCode::INTERNAL_SERVER_ERROR))
        } else {
          Ok(res_result.unwrap())
        };
      }
      #[cfg(debug_assertions)]{
        let target_uri = format!("http://localhost:3000{}", req.uri().to_string());
        lprintln!("redirecting to {}",target_uri);

        let res = Response::builder()
          .status(StatusCode::TEMPORARY_REDIRECT)
          .header("Location", target_uri)
          .body(Body::empty())
          .unwrap_or(
            Response::new(Body::from("failed when build redirect response"))
          );
        return Ok(res);
      }
    } else {
      elprintln!("unable to get asset_resolver");
    }
    // endregion

    Ok(create_empty_response(StatusCode::NOT_FOUND))
  }
}

fn create_websocket_upgrade_response(request: &HyperRequest<Body>) -> Option<Response<Body>> {
  if *request.method() != Method::GET { return None; } // method check

  if request.version() < Version::HTTP_11 { // version check
    return None;
  }

  if !request
    .headers()
    .get("Connection")
    .and_then(|h| h.to_str().ok())
    .map(|h| h.eq_ignore_ascii_case("Upgrade"))
    .unwrap_or(false) { // upgrade check
    return None;
  }

  if !request
    .headers()
    .get("Upgrade")
    .and_then(|h| h.to_str().ok())
    .map(|h| h.eq_ignore_ascii_case("websocket"))
    .unwrap_or(false) { // upgrade target check
    return None;
  }

  if !request.headers()
    .get("Sec-WebSocket-Version")
    .and_then(|value| value.to_str().ok())
    .map(|value| value.split(|c| c == ' ' || c == ',')
      .any(|value| value.eq_ignore_ascii_case("13")))
    .unwrap_or(false) { // websocket version check
    return None;
  }


  let req_key = request
    .headers()
    .get("Sec-WebSocket-Key");
  let res_key = if let Some(key) = req_key {
    derive_accept_key(key.as_bytes())
  } else {
    return None;
  };

  let builder = Response::builder()
    .status(StatusCode::SWITCHING_PROTOCOLS)
    .version(request.version())
    .header("Connection", "Upgrade")
    .header("Upgrade", "websocket")
    .header("Sec-WebSocket-Accept", res_key);

  let res = builder.body(Body::empty());
  if let Err(err) = res {
    elprintln!("failed when build response {:?}", err);
    return None;
  }

  Some(res.unwrap())
}

fn create_empty_response(code: StatusCode) -> Response<Body> {
  let mut res = Response::new(Body::empty());
  *res.status_mut() = code;
  res
}