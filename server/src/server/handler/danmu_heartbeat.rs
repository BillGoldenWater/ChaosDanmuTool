use axum::extract::State;
use share::server_api::{
    danmu::heartbeat::{ReqHeartbeat, ResHeartbeat},
    Response,
};
use tracing::instrument;

use crate::server::{signed_body::SignedBody, Server};

#[instrument(level = "debug", skip(s))]
pub async fn danmu_heartbeat(
    State(s): State<Server>,
    SignedBody { key_id, .. }: SignedBody<ReqHeartbeat>,
) -> Response<ResHeartbeat> {
    // Response::Ok(ResHeartbeat {})
    todo!()
}
