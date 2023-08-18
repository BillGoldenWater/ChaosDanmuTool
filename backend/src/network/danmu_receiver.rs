/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

use std::sync::Arc;
use std::time::{Duration, Instant};

use log::{debug, error, info};
use static_object::StaticObject;
use tokio::sync::Mutex;
use tokio_tungstenite::tungstenite::protocol::frame::coding::CloseCode;

use chaos_danmu_tool_share::command_packet::app_command::receiver_status_update::{
  ReceiverStatus, ReceiverStatusUpdate,
};
use chaos_danmu_tool_share::config::backend_config::danmu_receiver_config::DanmuReceiverConfig;

use crate::app::config_manager::modify_cfg;
use crate::cache::user_info_cache::UserInfoCache;
use crate::get_cfg;
use crate::network::api_request::danmu_server_info_getter::{self, DanmuServerInfoGetter};
use crate::network::api_request::room_info_getter::{self, RoomInfoGetter};
use crate::network::command_broadcast_server::CommandBroadcastServer;
use crate::network::danmu_receiver::message_processor::MessageProcessor;
use crate::network::danmu_receiver::packet::{JoinPacketInfo, Packet};
use crate::network::websocket_connection::{WebSocketConnection, WebSocketConnectionError};
use crate::utils::immutable_utils::Immutable;
use crate::utils::mutex_utils::a_lock;
use crate::utils::ws_utils::close_frame;

pub mod data_type;
pub mod message_processor;
pub mod op_code;
pub mod packet;

#[derive(StaticObject)]
pub struct DanmuReceiver {
  status: Arc<Mutex<ReceiverStatusInner>>,
}

impl DanmuReceiver {
  fn new() -> Self {
    Self {
      status: Arc::new(Mutex::const_new(ReceiverStatusInner::Close)),
    }
  }

  pub async fn connect_to(&self, roomid: u32) -> DrResult<()> {
    info!("connecting to {roomid}");

    modify_cfg(
      |cfg| {
        if cfg.backend.danmu_receiver.roomid != roomid {
          cfg.backend.danmu_receiver.roomid = roomid;
        }
      },
      false,
    )
    .await;

    self.connect().await
  }

  pub async fn connect(&self) -> DrResult<()> {
    match &mut *a_lock(&self.status).await {
      status @ ReceiverStatusInner::Close => {
        status.set_status(ReceiverStatusInner::Connecting).await;
      }
      status => {
        return Err(DrError::IllegalState(status.to_public()));
      }
    }

    let connect_result = connect(&self.status).await;
    let mut status = a_lock(&self.status).await;
    match connect_result {
      Ok(connection) => {
        status
          .set_status(ReceiverStatusInner::new_connected(connection))
          .await;

        Ok(())
      }
      Err(err) => {
        status.set_status(ReceiverStatusInner::Close).await;
        Err(err)
      }
    }
  }

  pub async fn disconnect(&self) -> DrResult<()> {
    match &mut *a_lock(&self.status).await {
      status @ ReceiverStatusInner::Close => return Err(DrError::IllegalState(status.to_public())),
      status @ ReceiverStatusInner::Connecting => {
        status.set_status(ReceiverStatusInner::Interrupted).await;
      }
      status @ ReceiverStatusInner::Connected { .. } => {
        Self::disconnect_connected(status).await?;
      }
      status @ ReceiverStatusInner::Error => {
        status.set_status(ReceiverStatusInner::Close).await;
      }
      status @ ReceiverStatusInner::Reconnecting { .. } => {
        let reconnecting = if let ReceiverStatusInner::Reconnecting { reconnecting, .. } = status {
          reconnecting
        } else {
          unreachable!()
        };

        if *reconnecting {
          status.set_status(ReceiverStatusInner::Interrupted).await;
        } else {
          status.set_status(ReceiverStatusInner::Close).await;
        }
      }
      ReceiverStatusInner::Interrupted => {}
    }
    Ok(())
  }

  async fn disconnect_connected(status: &mut ReceiverStatusInner) -> DrResult<()> {
    debug!("disconnecting");
    let connection = if let ReceiverStatusInner::Connected { connection, .. } = status {
      connection
    } else {
      unreachable!();
    };

    connection
      .disconnect(close_frame(CloseCode::Normal, ""))
      .await?;

    status.set_status(ReceiverStatusInner::Close).await;
    debug!("disconnected");
    Ok(())
  }

  pub async fn tick(&self) {
    match &mut *a_lock(&self.status).await {
      ReceiverStatusInner::Close | ReceiverStatusInner::Connecting => {}
      status @ ReceiverStatusInner::Connected { .. } => {
        Self::tick_connected(status).await;
      }
      status @ ReceiverStatusInner::Error => {
        status
          .set_status(ReceiverStatusInner::reconnecting_default())
          .await;
      }
      status @ ReceiverStatusInner::Reconnecting { .. } => {
        self.tick_reconnect(status).await;
      }
      ReceiverStatusInner::Interrupted => {}
    }
  }

  async fn tick_connected(status: &mut ReceiverStatusInner) {
    // region destruct
    let (connection, heartbeat_received) = if let ReceiverStatusInner::Connected {
      connection,
      heartbeat_received,
      ..
    } = status
    {
      (connection, heartbeat_received)
    } else {
      unreachable!()
    };
    // endregion

    // region recv message
    let mut processor = MessageProcessor::default();
    processor.process(connection.tick());

    let result = UserInfoCache::i().update_many(processor.user_infos).await;
    if let Err(err) = result {
      error!("failed to update user_info: {err:?}");
    }

    if !processor.commands.is_empty() {
      CommandBroadcastServer::i()
        .broadcast_cmd_many(processor.commands)
        .await;
    }

    if let Some(abnormal) = processor.connection_closed {
      if abnormal {
        status.set_status(ReceiverStatusInner::Error).await;
      } else {
        status.set_status(ReceiverStatusInner::Close).await;
      }
      return;
    }

    *heartbeat_received |= processor.heartbeat_received;
    // endregion

    if !connection.is_connected() {
      error!("unknown disconnect");
      status.set_status(ReceiverStatusInner::Error).await;
      return;
    }
    Self::tick_heartbeat(status).await;
  }

  async fn tick_heartbeat(status: &mut ReceiverStatusInner) {
    // region destruct
    let (connection, last_heartbeat_ts, last_heartbeat_tick_ts, heartbeat_received) =
      if let ReceiverStatusInner::Connected {
        connection,
        last_heartbeat_ts,
        last_heartbeat_tick_ts,
        heartbeat_received,
      } = status
      {
        (
          connection,
          last_heartbeat_ts,
          last_heartbeat_tick_ts,
          heartbeat_received,
        )
      } else {
        unreachable!()
      };
    // endregion

    let tick_elapsed = last_heartbeat_tick_ts.elapsed().as_secs();
    let elapsed = last_heartbeat_ts.elapsed().as_secs();

    // region check timeout
    if !*heartbeat_received && (elapsed - tick_elapsed) > 10 {
      error!("heartbeat timeout");
      let _ = Self::disconnect_connected(status).await;
      status.set_status(ReceiverStatusInner::Error).await;
      return;
    }
    // endregion

    // region send when reach interval
    let cfg = fetch_config().await;
    if elapsed > cfg.heartbeat_interval as u64 {
      let result = connection.send(Packet::heartbeat().pack_to_message()).await;
      if let Err(err) = result {
        error!("failed to send heartbeat: {err:?}");
      } else {
        *last_heartbeat_ts = Instant::now();
        *heartbeat_received = false;
      }
    }
    // endregion

    *last_heartbeat_tick_ts = Instant::now();
  }

  async fn tick_reconnect(&self, status: &mut ReceiverStatusInner) {
    // region destruct
    let (reconnecting, reconnect_time, reconnect_count) =
      if let ReceiverStatusInner::Reconnecting {
        reconnecting,
        reconnect_time,
        reconnect_count,
      } = status
      {
        (reconnecting, reconnect_time, reconnect_count)
      } else {
        unreachable!();
      };
    // endregion

    if *reconnecting {
      return;
    }

    const RECONNECT_LIMIT: u32 = 5;
    const RECONNECT_INTERVAL: u32 = 2;
    if *reconnect_count >= RECONNECT_LIMIT {
      error!("reconnect count reached {RECONNECT_LIMIT}, exiting");
      status.set_status(ReceiverStatusInner::Close).await;
      return;
    }

    if reconnect_time.elapsed().as_secs() < RECONNECT_INTERVAL as u64 {
      return;
    }

    *reconnect_count += 1;
    debug!("reconnecting ({reconnect_count}/{RECONNECT_LIMIT})");
    *reconnecting = true;

    let status = Arc::clone(&self.status);
    tokio::task::spawn(async move {
      let connect_result = connect(&status).await;
      let mut status = a_lock(&status).await;

      match connect_result {
        Ok(connection) => {
          status
            .set_status(ReceiverStatusInner::new_connected(connection))
            .await;
        }
        Err(err) => {
          if let ReceiverStatusInner::Interrupted = *status {
            status.set_status(ReceiverStatusInner::Close).await;
          } else {
            error!("failed to reconnect: {err:?}");
            if let ReceiverStatusInner::Reconnecting {
              reconnecting,
              reconnect_time,
              ..
            } = &mut *status
            {
              *reconnecting = false;
              *reconnect_time = Instant::now();
            }
          }
        }
      }
    });
  }

  pub async fn is_connected(&self) -> bool {
    match &*a_lock(&self.status).await {
      ReceiverStatusInner::Connected { connection, .. } => connection.is_connected(),
      _ => false,
    }
  }

  pub async fn get_status(&self) -> ReceiverStatus {
    a_lock(&self.status).await.to_public()
  }
}

async fn connect(status: &Arc<Mutex<ReceiverStatusInner>>) -> DrResult<WebSocketConnection> {
  let roomid = get_actual_room_id().await?;
  check_interrupted(status).await?;
  let server_info = DanmuServerInfoGetter::get_token_and_url(roomid).await?;
  check_interrupted(status).await?;

  debug!("connecting {}", server_info.url);
  let mut connection = WebSocketConnection::new_connection(&server_info.url).await?;
  connection.set_send_timeout(Some(Duration::from_secs(5)));
  debug!("sending join packet");
  connection
    .send(
      Packet::join(JoinPacketInfo {
        roomid,
        key: server_info.token,
        ..Default::default()
      })
      .pack_to_message(),
    )
    .await?;

  Ok(connection)
}

async fn check_interrupted(status: &Arc<Mutex<ReceiverStatusInner>>) -> DrResult<()> {
  if matches!(
    *a_lock(status).await,
    ReceiverStatusInner::Interrupted
  ) {
    Err(DrError::ConnectionInterrupted)
  } else {
    Ok(())
  }
}

async fn get_actual_room_id() -> DrResult<u32> {
  let cfg = fetch_config().await;

  let roomid = cfg.roomid;

  if cfg.actual_roomid_cache.roomid == roomid {
    return Ok(cfg.actual_roomid_cache.cached);
  }

  let actual_roomid = RoomInfoGetter::get_actual_room_id(roomid).await?;
  modify_cfg(
    |cfg| {
      cfg.backend.danmu_receiver.actual_roomid_cache.roomid = roomid;
      cfg.backend.danmu_receiver.actual_roomid_cache.cached = actual_roomid;
    },
    true,
  )
  .await;

  Ok(actual_roomid)
}

async fn fetch_config() -> Immutable<DanmuReceiverConfig> {
  let cfg = get_cfg!().backend.danmu_receiver.clone();
  Immutable::new(cfg)
}

#[derive(Debug)]
enum ReceiverStatusInner {
  Close,
  Connecting,
  Connected {
    connection: WebSocketConnection,
    last_heartbeat_ts: Instant,
    last_heartbeat_tick_ts: Instant,
    heartbeat_received: bool,
  },

  Error,
  Reconnecting {
    reconnecting: bool,
    reconnect_count: u32,
    reconnect_time: Instant,
  },

  Interrupted,
}

impl ReceiverStatusInner {
  fn to_public(&self) -> ReceiverStatus {
    match self {
      ReceiverStatusInner::Close => ReceiverStatus::Close,
      ReceiverStatusInner::Connecting => ReceiverStatus::Connecting,
      ReceiverStatusInner::Connected { .. } => ReceiverStatus::Connected,
      ReceiverStatusInner::Error => ReceiverStatus::Error,
      ReceiverStatusInner::Reconnecting { .. } => ReceiverStatus::Reconnecting,
      ReceiverStatusInner::Interrupted => ReceiverStatus::Interrupted,
    }
  }

  fn new_connected(connection: WebSocketConnection) -> Self {
    Self::Connected {
      connection,
      last_heartbeat_ts: Instant::now(),
      last_heartbeat_tick_ts: Instant::now(),
      heartbeat_received: true,
    }
  }

  fn reconnecting_default() -> Self {
    Self::Reconnecting {
      reconnecting: false,
      reconnect_count: 0,
      reconnect_time: Instant::now(),
    }
  }

  async fn set_status(&mut self, status: ReceiverStatusInner) {
    *self = status;

    CommandBroadcastServer::i()
      .broadcast_cmd(ReceiverStatusUpdate::new(self.to_public()).into())
      .await;
  }
}

pub type DrResult<T> = Result<T, DrError>;

#[derive(thiserror::Error, Debug)]
pub enum DrError {
  #[error("failed to get actual roomid")]
  FailedToGetActualRoomid(#[from] room_info_getter::Error),
  #[error("failed to get server info")]
  FailedToGetServerInfo(#[from] danmu_server_info_getter::Error),
  #[error("connection interrupted")]
  ConnectionInterrupted,
  #[error("{0:?}")]
  WsError(#[from] WebSocketConnectionError),
  #[error("illegal state: {0:?}")]
  IllegalState(ReceiverStatus),
}
