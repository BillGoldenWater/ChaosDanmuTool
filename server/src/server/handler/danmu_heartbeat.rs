use anyhow::Context;
use axum::extract::State;
use bson::doc;
use share::{
    data_primitives::DataPrimitive,
    server_api::{
        danmu::heartbeat::{ReqHeartbeat, ResHeartbeat},
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
pub async fn danmu_heartbeat(
    State(s): State<Server>,
    SignedBody { key_id, .. }: SignedBody<ReqHeartbeat>,
) -> Result<Response<ResHeartbeat>, Response<()>> {
    let coll = s.db().coll::<SessionInfo>();

    info!(
        cmd = "on_session_heartbeat",
        "updating heartbeat info for {key_id}"
    );

    let id = key_id.to_bson()?;
    let result = coll
        .update_one(
            doc! {"key_id": id},
            doc! {"$currentDate": {"last_heartbeat": true}},
            None,
        )
        .await
        .context("failed to update heartbeat info")?;

    if result.modified_count == 0 {
        return ResponseError::SessionNotExists.into_err().err_into();
    }

    Response::Ok(ResHeartbeat {}).into_ok()
}
