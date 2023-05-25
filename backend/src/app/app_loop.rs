/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::time::Duration;

use log::{error, warn};
use static_object::StaticObject;
use tokio::{
  sync::mpsc::{error::TryRecvError, unbounded_channel, UnboundedReceiver, UnboundedSender},
  time::{sleep, Instant},
};

use crate::app::config_manager::ConfigManager;
use crate::network::command_broadcast_server::CommandBroadcastServer;
use crate::network::danmu_receiver::DanmuReceiver;

type Sender = UnboundedSender<()>;
type Receiver = UnboundedReceiver<()>;

const LOOP_MIN_INTERVAL_SECS: f64 = 1.0 / 20.0;
const LOOP_COST_WARN_HARD_LIMIT_SECS: f64 = 1.0;

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
    #[cfg(target_os = "macos")]
    crate::utils::process_utils::macos::set_nap(
      false,
      "communicating with bilibili server and danmu viewer clients",
    );

    let mut loop_cost_average = 0.0;
    #[allow(unused_mut)]
    let mut soft_warn_limit = LOOP_MIN_INTERVAL_SECS;

    loop {
      // detect stop signal
      let recv = self.stop_rx.try_recv();
      if recv.is_ok() || recv.unwrap_err() == TryRecvError::Disconnected {
        break;
      }

      // run and measure time cost
      let start = Instant::now();
      let loop_cost = self.each_iter().await;
      let elapsed = start.elapsed().as_secs_f64();

      // sleep for reach min interval
      let need_sleep = LOOP_MIN_INTERVAL_SECS - elapsed;
      if need_sleep > 0.0 {
        sleep(Duration::from_secs_f64(need_sleep)).await;
      }

      // warn for long run time
      loop_cost_average += elapsed;
      loop_cost_average /= 2.0;

      if elapsed > LOOP_COST_WARN_HARD_LIMIT_SECS {
        warn!("last tick takes {elapsed:.3}s, it's more than should({LOOP_MIN_INTERVAL_SECS:.3}) detail(millis): {loop_cost:?}")
      } else if loop_cost_average > soft_warn_limit {
        warn!("last tick takes {elapsed:.3}s, it's more than expected({LOOP_MIN_INTERVAL_SECS:.3}) detail(millis): {loop_cost:?}");
        #[cfg(debug_assertions)]
        {
          soft_warn_limit = (loop_cost_average * 1.1).min(LOOP_COST_WARN_HARD_LIMIT_SECS);
        }
      }
    }

    #[cfg(target_os = "macos")]
    crate::utils::process_utils::macos::set_nap(true, "");

    // send stopped signal
    let result = self.ret_tx.send(());
    if let Err(err) = result {
      error!("unable to send loop stopped signal \n{err:?}")
    }
  }

  async fn each_iter(&self) -> LoopCost {
    let start = Instant::now();

    DanmuReceiver::i().tick().await;
    let danmu_receiver = start.elapsed().as_millis();

    CommandBroadcastServer::i().tick().await;
    let command_broadcast_server = start.elapsed().as_millis();

    ConfigManager::i().tick().await;
    let config_manager = start.elapsed().as_millis();

    LoopCost {
      danmu_receiver,
      command_broadcast_server: command_broadcast_server - danmu_receiver,
      config_manager: config_manager - command_broadcast_server,
    }
  }
}

#[derive(Debug)]
pub struct LoopCost {
  pub danmu_receiver: u128,
  pub command_broadcast_server: u128,
  pub config_manager: u128,
}
