use axum::extract::State;
use share::server_api::{
    danmu::end::{ReqEnd, ResEnd},
    Response,
};
use tracing::instrument;

use crate::server::{signed_body::SignedBody, Server};

#[instrument(level = "debug", skip(s))]
pub async fn danmu_end(
    State(s): State<Server>,
    SignedBody {
        body,
        key_id,
        user_type,
    }: SignedBody<ReqEnd>,
) -> Response<ResEnd> {
    // Response::Ok(ResEnd{})
    todo!()
}
