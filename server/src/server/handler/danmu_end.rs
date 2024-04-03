use anyhow::Context;
use axum::extract::State;
use bson::doc;
use share::{
    data_primitives::DataPrimitive,
    server_api::{
        danmu::end::{ReqEnd, ResEnd},
        Response, ResponseError,
    },
    utils::functional::Functional,
};
use tracing::{info, instrument};

use crate::{
    database::data_model::session_info::SessionInfo,
    server::{signed_body::SignedBody, Server},
};

#[instrument(level = "debug", skip(s))]
pub async fn danmu_end(
    State(s): State<Server>,
    SignedBody { key_id, .. }: SignedBody<ReqEnd>,
) -> Result<Response<ResEnd>, Response<()>> {
    let coll = s.db().coll::<SessionInfo>();

    info!(cmd = "on_session_end", "ending session for {key_id}");

    let id = key_id.to_bson()?;
    let session = coll
        .find_one_and_delete(doc! {"key_id": id}, None)
        .await
        .context("failed to remove session info")?;

    if let Some(session) = session {
        s.session_end(session)
            .await
            .context("failed to end session")?;
    } else {
        return ResponseError::SessionNotExists.into_err().err_into();
    }

    Response::Ok(ResEnd {}).into_ok()
}
