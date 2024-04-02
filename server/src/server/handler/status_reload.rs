use anyhow::Context;
use axum::extract::State;
use share::{
    server_api::{
        status::reload::{ReqReload, ResReload},
        Response, ResponseError,
    },
    utils::functional::Functional,
};
use tracing::instrument;

use crate::server::{signed_body::SignedBody, Server};

#[instrument(level = "debug", skip(s))]
pub async fn status_reload(
    State(s): State<Server>,
    SignedBody { user_type, .. }: SignedBody<ReqReload>,
) -> Result<Response<ResReload>, Response<()>> {
    if !user_type.is_admin() {
        return ResponseError::Auth.into_err().err_into();
    }

    s.inner
        .feat_cfg
        .write()
        .await
        .reload()
        .await
        .context("failed to reload feature config")?;

    Response::Ok(ResReload {}).into_ok()
}
