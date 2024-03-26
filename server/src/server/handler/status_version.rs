use axum::extract::State;
use share::server_api::{status::version::ResVersion, Response};
use tracing::instrument;

use crate::server::Server;

#[instrument(level = "debug", skip(s))]
pub async fn status_version(State(s): State<Server>) -> Response<ResVersion> {
    Response::Ok(ResVersion {
        minimum_version: s.inner.cfg.min_client_ver.clone().into(),
    })
}
