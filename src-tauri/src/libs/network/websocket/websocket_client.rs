/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::borrow::BorrowMut;

use futures_util::{SinkExt, StreamExt};
use futures_util::stream::{SplitSink, SplitStream};
use tauri::async_runtime::block_on;
use tokio::{net::TcpStream, sync::mpsc::{unbounded_channel, UnboundedReceiver, UnboundedSender}};
use tokio_tungstenite::{connect_async, MaybeTlsStream, tungstenite::Message, WebSocketStream};
use tokio_tungstenite::tungstenite::protocol::CloseFrame;

pub struct CallbackFn(Box<dyn (FnMut(Message))>);

unsafe impl Send for CallbackFn {}

unsafe impl Sync for CallbackFn {}

type WebSocket = WebSocketStream<MaybeTlsStream<TcpStream>>;
type WebSocketWriter = SplitSink<WebSocket, Message>;

pub struct WebSocketClient {
  connected: bool,
  message_handler: CallbackFn,

  write: Option<WebSocketWriter>,
  rx: Option<UnboundedReceiver<Message>>,
}

impl WebSocketClient {
  pub fn new<F: FnMut(Message) + 'static>(message_handler: F) -> WebSocketClient {
    return WebSocketClient {
      connected: false,
      message_handler: CallbackFn(Box::new(message_handler)),

      write: None,
      rx: None,
    };
  }

  pub fn connect(&mut self, url: &str) -> bool {
    let connect_result =
      block_on(connect_async(url));

    if connect_result.is_err() {
      println!("[WebSocketClient.connect] Failed to connect: {}", url);
      println!("{:?}", connect_result.err());
      return false;
    }

    let socket_stream = connect_result.unwrap().0;

    let (write, read) = socket_stream.split();
    self.write = Some(write);

    let (tx, rx) = unbounded_channel();
    self.rx = Some(rx);

    WebSocketClient::recv_loop(read, tx);

    self.connected = true;
    println!("[WebSocketClient.connect] connected");
    true
  }

  pub fn disconnect(&mut self, close_frame: Option<CloseFrame<'static>>) {
    if let Some(write) = self.write.borrow_mut() {
      block_on(async move {
        let _ = write.send(Message::Close(close_frame)).await;
        let _ = write.close().await;
      });
    }
  }

  pub fn send(&mut self, message: Message) {
    if let Some(write) = self.write.borrow_mut() {
      let _ = block_on(write.send(message));
    }
  }

  pub fn tick(&mut self) {
    if !self.connected { return; }

    if let Some(rx) = self.rx.borrow_mut() {
      let rx_result = rx.try_recv(); // try_recv
      if let Ok(msg) = rx_result { // when message
        (self.message_handler.0)(msg);
      } else if let Err(err) = rx_result { // when failed recv
        match err {
          tokio::sync::mpsc::error::TryRecvError::Disconnected => { // when disconnected
            self.on_disconnect();
          }
          _ => {}
        }
      }
    }
  }

  pub fn is_connected(&self) -> bool {
    self.connected
  }

  fn on_disconnect(&mut self) {
    self.connected = false;
    self.write = None;
    self.rx = None;
    println!("[WebSocketClient.on_disconnect] disconnected");
  }

  fn recv_loop(read: SplitStream<WebSocketStream<MaybeTlsStream<TcpStream>>>, tx: UnboundedSender<Message>) {
    tauri::async_runtime::spawn(async move {
      read.for_each(move |item| { // reading
        let tx = tx.clone();
        async move { // each message
          if item.is_err() {
            println!("[WebSocketClient.recv_loop] had an error item.")
          } else { // forward to main_thread
            let message = item.unwrap();

            let send_result = tx.clone().send(message);
            if let Err(_) = send_result {
              println!("[WebSocketClient.recv_loop] failed send to main thread.")
            }
          }
        }
      }).await
    });
  }
}