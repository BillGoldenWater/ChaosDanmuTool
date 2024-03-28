use anyhow::Context;
use axum::extract::State;
use bson::doc;
use share::{
    data_primitives::DataPrimitive,
    data_type::api::anchor_info::AnchorInfo,
    server_api::{
        danmu::start::{ReqStart, ResStart},
        Response, ResponseError,
    },
    utils::functional::Functional,
};
use tracing::instrument;

use crate::{
    database::data_model::session_info::SessionInfo,
    server::{signed_body::SignedBody, Server},
};

#[instrument(level = "debug", skip(s))]
pub async fn danmu_start(
    State(s): State<Server>,
    SignedBody {
        body: ReqStart { code, force },
        key_id,
        user_type,
    }: SignedBody<ReqStart>,
) -> Result<Response<ResStart>, Response<()>> {
    let coll = s.db().coll::<SessionInfo>();

    // NOTE: no transaction since single user shouldn't send multiple request at same time,
    // even it happens, there isn't any serious thing could happend

    if user_type.is_guest() {
        // TODO: guest
        todo!()
    }

    let id = key_id.to_bson()?;
    let exists_session = coll
        .find_one(doc! {"key_id": id.clone()}, None)
        .await
        .context("failed to fetch exists session")?;

    if let Some(exists_session) = exists_session {
        if !force {
            return Err(ResponseError::SessionExists).err_into();
        }

        s.session_end(exists_session)
            .await
            .context("failed to end previous session")?;
    }

    let res = s
        .bili()
        .app_start(code)
        .await
        .context("failed to start the game")?;

    coll.insert_one(
        SessionInfo {
            key_id: key_id.clone(),
            game_id: res.game_info.game_id.clone(),
        },
        None,
    )
    .await
    .context("failed to insert session info")?;

    Response::Ok(ResStart {
        ws_info: res.websocket_info.into(),
        user: AnchorInfo::from(res.anchor_info).user,
    })
    .into_ok()
}
