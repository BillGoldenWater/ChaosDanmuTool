/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::time::Duration;

use log::error;
use static_object::StaticObject;
use tokio::{
  sync::mpsc::{error::TryRecvError, unbounded_channel, UnboundedReceiver, UnboundedSender},
  time::{sleep, Instant},
};

use crate::libs::config::config_manager::ConfigManager;
use crate::libs::network::command_broadcast_server::CommandBroadcastServer;
use crate::libs::network::danmu_receiver::danmu_receiver::DanmuReceiver;

type Sender = UnboundedSender<()>;
type Receiver = UnboundedReceiver<()>;

static LOOP_MIN_INTERVAL_SECS: f64 = 1.0 / 20.0;

#[derive(StaticObject)]
pub struct AppLoop {
  stop_tx: Sender,
  stop_rx: Receiver,
  ret_tx: Sender,
  ret_rx: Receiver,
}

impl AppLoop {
  fn new() -> Self {
    let (stop_tx, stop_rx) = unbounded_channel();
    let (ret_tx, ret_rx) = unbounded_channel();
    Self {
      stop_tx,
      stop_rx,
      ret_tx,
      ret_rx,
    }
  }

  pub fn start(&'static mut self) {
    tokio::task::spawn(self.run_loop());
  }

  pub async fn stop(&mut self) {
    // send stop signal
    let send_result = self.stop_tx.send(());
    if let Err(err) = send_result {
      error!("failed to send stop loop signal \n{err:?}");
      return;
    }

    // wait for stopped signal
    self.ret_rx.recv().await;
  }

  async fn run_loop(&mut self) {
    loop {
      // detect stop signal
      let recv = self.stop_rx.try_recv();
      if recv.is_ok() || recv.unwrap_err() == TryRecvError::Disconnected {
        break;
      }

      // run and measure time cost
      let start = Instant::now();
      self.each_iter().await;
      let elapsed = start.elapsed().as_secs_f64();

      // calc and sleep time for reach min interval
      let need_sleep = LOOP_MIN_INTERVAL_SECS - elapsed;
      if need_sleep > 0.0 {
        sleep(Duration::from_secs_f64(need_sleep)).await;
      }
    }

    // send stopped signal
    let result = self.ret_tx.send(());
    if let Err(err) = result {
      error!("unable to send loop stopped signal \n{err:?}")
    }
  }

  async fn each_iter(&self) {
    DanmuReceiver::i().tick().await;
    CommandBroadcastServer::i().tick().await;
    ConfigManager::i().tick().await;
  }
}
