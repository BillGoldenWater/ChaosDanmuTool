use std::time::Duration;

use anyhow::{anyhow, Context};
use bson::doc;
use chrono::{TimeDelta, Utc};
use futures::{Future, TryStreamExt};
use mongodb::Collection;
use share::{
    data_primitives::DataPrimitive, server_api::danmu::heartbeat::ReqHeartbeat,
    utils::functional::Functional,
};
use tokio::{sync::mpsc::error::TryRecvError, time::sleep};
use tracing::{debug, error, info, instrument, warn};

use super::Server;
use crate::database::data_model::session_info::SessionInfo;

pub fn start_heartbeat_task(server: Server) -> impl Future<Output = anyhow::Result<()>> {
    const HEARTBEAT_INTERVAL: u64 = 20;
    const MAX_RETRY: u32 = 12;
    const BATCH_SIZE: usize = 200;

    let (tx, mut rx) = tokio::sync::mpsc::channel::<()>(1);

    let task = tokio::spawn(async move {
        'heartbeat: loop {
            // NOTE: stop logic
            match rx.try_recv() {
                Ok(_) => {
                    break 'heartbeat;
                }
                Err(TryRecvError::Disconnected) => {
                    error!("stop signal channel disconnected, exiting");
                    break 'heartbeat;
                }
                _ => {}
            }

            // NOTE: heartbeart logic
            #[instrument(level = "debug", skip(server, coll))]
            async fn do_heartbeat(
                server: &Server,
                coll: &Collection<SessionInfo>,
            ) -> anyhow::Result<usize> {
                // NOTE: handle heartbeat expired
                let heartbeat_interval =
                    TimeDelta::try_seconds(-(ReqHeartbeat::EXPIRE_SECS as i64))
                        .context("failed to construct time delta for heartbeat interval")?;
                let deadline = Utc::now()
                    .checked_add_signed(heartbeat_interval)
                    .ok_or(anyhow!("failed to calculate deadline for heartbeat"))?;
                let deadline = bson::DateTime::from_chrono(deadline);

                debug!("fetching expired sessions");
                let expired = coll
                    .find(doc! {"last_heartbeat": {"$lt": deadline}}, None)
                    .await
                    .context("failed to find heartbeat expired sessions")?
                    .try_collect::<Vec<_>>()
                    .await
                    .context("failed to recv heartbeat expired sessions")?;

                if !expired.is_empty() {
                    let key_ids = expired
                        .iter()
                        .map(|it| it.key_id.to_bson())
                        .collect::<Result<Vec<_>, _>>()
                        .context("failed to convert session ids into bson")?;
                    info!(
                        cmd="on_heartbeat_client_expired",
                        session_count=%expired.len(),
                        "deleting heatbeat expired sessions: {key_ids:?}",
                    );

                    coll.delete_many(doc! {"key_id": {"$in": key_ids}}, None)
                        .await
                        .context("failed to delete sessions")?;

                    for session in expired {
                        debug!("ending session {}", session.key_id);
                        server
                            .session_end(session)
                            .await
                            .context("failed to end session")?;
                    }
                }

                // NOTE: bili app heartbead
                debug!("fetching sessions for heartbeat");
                let sessions = coll
                    .find(doc! {}, None)
                    .await
                    .context("failed to fetch sessions for heartbeat")?
                    .try_collect::<Vec<_>>()
                    .await
                    .context("failed to recv sessions for heartbeat")?;

                let mut session_count = sessions.len();
                for chunk in sessions.chunks(BATCH_SIZE) {
                    debug!("sending heartbeat request");
                    let res = server
                        .bili()
                        .app_heartbeat_batched(chunk.iter().map(|it| it.game_id.clone()).collect())
                        .await
                        .context("failed to make heartbeat request")?;

                    if !res.failed_game_ids.is_empty() {
                        let failed_count = res.failed_game_ids.len();
                        session_count = session_count.saturating_sub(failed_count);
                        warn!(
                            cmd = "on_heartbeat_bili_failed",
                            session_count = %failed_count,
                            "failed game_ids: {:?}",
                            res.failed_game_ids
                        );

                        let failed_ids = bson::to_bson(&res.failed_game_ids)
                            .context("failed to serialize failed game_ids for deletion")?;
                        coll.delete_many(doc! {"game_id": {"$in": failed_ids}}, None)
                            .await
                            .context("failed to delete heartbeat failed sessions")?;
                    }
                }

                session_count.into_ok()
            }

            let coll = server.db().coll::<SessionInfo>();

            // NOTE: retry logic
            let mut retry_count = 0_u32;
            'retry: loop {
                let result = do_heartbeat(&server, &coll).await;
                match result {
                    Ok(count) => {
                        debug!(
                            cmd = "on_heartbeat_success",
                            session_count = %count,
                            "heartbeat success, session count: {count}"
                        );
                        break 'retry;
                    }
                    Err(err) => {
                        if retry_count < MAX_RETRY {
                            let backoff_time = 1.25_f64.powf(retry_count as f64).round() as u64;
                            retry_count += 1;
                            warn!(
                                cmd = "on_heartbeat_retry",
                                "retrying heartbeat, count: {}, backoff: {}s, err: {err:?}",
                                retry_count,
                                backoff_time,
                            );

                            tokio::select! {
                                _ = sleep(Duration::from_secs(backoff_time)) => {},
                                _ = rx.recv() => {
                                    break 'heartbeat;
                                }
                            }
                        } else {
                            error!(
                                cmd = "on_heartbeat_failed",
                                "failed to do heartbeat, retry limit reached"
                            );
                            break 'retry;
                        }
                    }
                }
            }

            tokio::select! {
                _ = sleep(Duration::from_secs(HEARTBEAT_INTERVAL)) => {},
                _ = rx.recv() => {
                    break 'heartbeat;
                }
            }
        }
    });

    async move {
        info!("shutting down heartbeat task");
        tx.send(())
            .await
            .context("failed to send stop signal to heartbeat task")?;
        info!("waitting heartbeat task to exit");
        task.await.context("failed to wait heatbeat task to exit")?;
        Ok(())
    }
}
