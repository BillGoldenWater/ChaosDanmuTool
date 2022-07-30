/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::convert::Infallible;
use std::error::Error;
use std::net::{IpAddr, Ipv4Addr, SocketAddr};

use get_port::{Ops, tcp::TcpPort};
use hyper::{Body, Method, Request as HyperRequest, Response, Server, StatusCode, Version};
use hyper::server::conn::AddrStream;
use hyper::service::{make_service_fn, service_fn};
use netstat2::{get_sockets_info, ProtocolSocketInfo, TcpState};
use oneshot::Sender;
use sysinfo::{Pid, PidExt, ProcessExt, ProcessRefreshKind, RefreshKind, SystemExt};
use tauri::{AssetResolver, Wry};
use tauri::async_runtime::JoinHandle;
use tokio::sync::Mutex;
use tokio_tungstenite::{MaybeTlsStream, WebSocketStream};
use tokio_tungstenite::tungstenite::handshake::derive_accept_key;
use tokio_tungstenite::tungstenite::protocol::Role;

use crate::{error, info, location_info};
use crate::libs::config::config_manager::ConfigManager;
use crate::libs::network::command_broadcast_server::CommandBroadcastServer;

lazy_static! {
    pub static ref HTTP_SERVER_STATIC_INSTANCE: Mutex<HttpServer> =
        Mutex::new(HttpServer::new());
}

pub struct HttpServer {
  tx: Option<Option<Sender<()>>>,
  asset_resolver: Option<AssetResolver<Wry>>,
  server_join_handle: Option<JoinHandle<()>>,
}

impl HttpServer {
  fn new() -> HttpServer {
    HttpServer {
      tx: None,
      asset_resolver: None,
      server_join_handle: None,
    }
  }

  pub async fn start(asset_resolver: AssetResolver<Wry>, port: u16) {
    let this = &mut *HTTP_SERVER_STATIC_INSTANCE.lock().await;
    this.start_(asset_resolver, port).await
  }

  async fn start_(&mut self, asset_resolver: AssetResolver<Wry>, port: u16) {
    self.asset_resolver = Some(asset_resolver);

    self.listen(port).await;
  }

  #[async_recursion::async_recursion(? Send)]
  async fn listen(&mut self, port: u16) {
    // region init
    let addr = SocketAddr::new(
      IpAddr::V4(Ipv4Addr::new(0, 0, 0, 0)),
      port,
    );

    let make_service =
      make_service_fn(|_| {
        async { Ok::<_, Infallible>(service_fn(Self::on_request)) }
      });
    // endregion

    // region bind
    let server = Server::try_bind(&addr);
    let server = if let Err(err) = server {
      error!("failed to start server: {:?}",err);
      self.try_recover_from_listen_fail(err, port).await;
      return;
    } else {
      server.unwrap().serve(make_service)
    };

    info!("server start at: {:?}", server.local_addr());
    // endregion

    // region run
    let (tx, rx) = oneshot::channel::<()>();
    self.tx = Some(Some(tx));

    let server = server.with_graceful_shutdown(async move {
      rx.await.ok();
      info!("server stopped");
    });

    let join_handle = tauri::async_runtime::spawn(async move {
      if let Err(err) = server.await {
        error!("server error: {}", err);
      }
    });
    self.server_join_handle = Some(join_handle)
    // endregion
  }

  #[async_recursion::async_recursion(? Send)]
  async fn try_recover_from_listen_fail(&mut self, err: hyper::Error, port: u16) {
    if let Some(err) = err.source() {
      let is_addr_in_use = format!("{:?}", err).find("AddrInUse").is_some();
      if is_addr_in_use {
        self.try_recover_from_addr_in_use(port).await;
        return;
      }
    }
    rfd::MessageDialog::new()
      .set_title("错误")
      .set_level(rfd::MessageLevel::Error)
      .set_buttons(rfd::MessageButtons::OkCustom("确定".to_string()))
      .set_description(&format!("无法恢复的http服务器启动错误, 请检查日志或联系开发者.\n{}", location_info!()))
      .show();
  }

  #[async_recursion::async_recursion(? Send)]
  async fn try_recover_from_addr_in_use(&mut self, port: u16) {
    // region init message
    let process_names = get_process_names_using(port);
    let process_names_message = if process_names.is_empty() {
      "获取失败".to_string()
    } else {
      process_names.join(",\n")
    };
    let message = format!(
      "无法启动http服务器, 请关闭以下进程后重启应用或更改一个新的端口:\n{}\n警告: 更改新端口将会导致所有外置弹幕查看器链接需要重新复制\n\n开发信息:\n{}",
      process_names_message,
      location_info!(),
    );
    // endregion

    // region show dialog
    let is_auto_select = rfd::MessageDialog::new()
      .set_title("错误")
      .set_level(rfd::MessageLevel::Error)
      .set_buttons(rfd::MessageButtons::OkCancelCustom(
        "更改".to_string(),
        "退出".to_string(),
      ))
      .set_description(&message)
      .show();
    // endregion

    // region process
    if !is_auto_select {
      std::process::exit(0);
    }

    let port_result = TcpPort::in_range(
      "0.0.0.0",
      get_port::Range { min: 25000, max: 25555 },
    );
    if let Some(port) = port_result {
      // start on new port
      self.listen(port).await;

      // save config
      info!("saving changed port config");
      let mut cfg = ConfigManager::get_config().await;
      cfg.backend.http_server.port = port;
      ConfigManager::set_config(cfg, false).await;

      rfd::MessageDialog::new()
        .set_title("成功")
        .set_level(rfd::MessageLevel::Info)
        .set_buttons(rfd::MessageButtons::OkCustom("确定".to_string()))
        .set_description(&format!("成功更改端口为: {}\n{}", port, location_info!()))
        .show();
    } else {
      rfd::MessageDialog::new()
        .set_title("错误")
        .set_level(rfd::MessageLevel::Error)
        .set_buttons(rfd::MessageButtons::OkCustom("确定".to_string()))
        .set_description(&format!("无法获取可用端口, 请联系开发者. \n{}", location_info!()))
        .show();
      std::process::exit(0);
    }
    // endregion
  }

  pub async fn stop() {
    let this = &mut *HTTP_SERVER_STATIC_INSTANCE.lock().await;
    this.stop_().await
  }

  async fn stop_(&mut self) {
    if let Some(tx) = self.tx.replace(None) {
      if let Some(tx) = tx {
        info!("stopping server");
        let send_result = tx.send(());
        if send_result.is_ok() {
          if let Some(join_handle) = &mut self.server_join_handle {
            info!("waiting server to stop");
            let _ = join_handle.await;
          }
        } else {
          error!("failed to send stop signal");
        }
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
              error!("failed when convert 'Upgraded' to AddrStream")
            }

            let tcp_stream = upgraded_parts.unwrap().io.into_inner();

            let websocket_stream =
              WebSocketStream::from_raw_socket(
                MaybeTlsStream::Plain(tcp_stream),
                Role::Server,
                None,
              ).await;

            CommandBroadcastServer::accept(websocket_stream).await;
            info!("upgraded");
          }
          Err(err) => {
            error!("Upgrade error: {}", err);
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
          error!("unable to build a response\n{:?}", err);
          Ok(create_empty_response(StatusCode::INTERNAL_SERVER_ERROR))
        } else {
          Ok(res_result.unwrap())
        };
      }
      #[cfg(debug_assertions)]{
        let target_uri = format!("http://localhost:3000{}", req.uri().to_string());
        info!("redirecting to {}",target_uri);

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
      error!("unable to get asset_resolver");
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
    error!("failed when build response {:?}", err);
    return None;
  }

  Some(res.unwrap())
}

fn create_empty_response(code: StatusCode) -> Response<Body> {
  let mut res = Response::new(Body::empty());
  *res.status_mut() = code;
  res
}

fn get_process_names_using(port: u16) -> Vec<String> {
  // region get pids
  let af_flags =
    netstat2::AddressFamilyFlags::IPV4 | netstat2::AddressFamilyFlags::IPV6;
  let proto_flags = netstat2::ProtocolFlags::TCP;
  let sockets_info_result = get_sockets_info(af_flags, proto_flags);

  let sockets_info =
    if let Ok(socket_info) = sockets_info_result {
      socket_info
    } else {
      return vec![];
    };

  let mut pids: Vec<u32> = vec![];

  for socket_info in sockets_info {
    match socket_info.protocol_socket_info {
      ProtocolSocketInfo::Tcp(tcp_info) => {
        if tcp_info.state == TcpState::Listen
          && tcp_info.local_addr == IpAddr::V4(Ipv4Addr::new(0, 0, 0, 0))
          && tcp_info.local_port == port
        {
          pids.append(&mut socket_info.associated_pids.clone())
        }
      }
      _ => {}
    }
  }
  // endregion

  let mut result: Vec<String> = vec![];

  // region get process name
  let mut sys = sysinfo::System::new_with_specifics(
    RefreshKind::new().with_processes(ProcessRefreshKind::new())
  );
  sys.refresh_processes();

  let processes = sys.processes();
  for pid in pids {
    let process = processes.get(&Pid::from_u32(pid));
    if let Some(process) = process {
      result.push(process.name().to_string());
    }
  }
  // endregion

  result
}
