use anyhow::Context as _;
use axum::extract::State;
use bson::doc;
use share::{
    data_primitives::{auth_key_id::AuthKeyId, DataPrimitive as _},
    server_api::{
        admin::key_register::{ReqKeyRegister, ResKeyRegister},
        Response, ResponseError,
    },
    utils::functional::Functional,
};
use tracing::instrument;

use crate::{
    database::data_model::auth_key_info::AuthKeyInfo,
    server::{signed_body::SignedBody, Server},
};

#[instrument(level = "debug", skip(server, body))]
pub async fn admin_key_register(
    State(server): State<Server>,
    SignedBody {
        body, user_type, ..
    }: SignedBody<ReqKeyRegister>,
) -> Result<Response<ResKeyRegister>, Response<()>> {
    if !user_type.is_admin() {
        return Response::Err(ResponseError::Auth).into_err();
    }

    let coll = server.inner.db.coll::<AuthKeyInfo>();
    let mut session = server.inner.db.start_session().await?;

    let key_info = AuthKeyInfo {
        id: AuthKeyId::new(),
        public_key: body.public_key,
        note: body.note,
    };

    // TODO: optimize err with mongo's custom err
    let already_exists = session
        .with_transaction(
            (&coll, &key_info),
            |session, (coll, key_info)| {
                Box::pin(async {
                    let key = key_info.public_key.to_bson_raw_err()?;
                    let exists = coll
                        .find_one_with_session(doc! {"public_key": key}, None, session)
                        .await?;

                    if exists.is_some() {
                        return Ok(true);
                    }

                    coll.insert_one_with_session(*key_info, None, session)
                        .await?;

                    Ok(false)
                })
            },
            None,
        )
        .await
        .context("failed to do check and insert")?;

    if already_exists {
        Response::Err(ResponseError::AuthKeyExists).into_err()
    } else {
        Response::Ok(ResKeyRegister {
            key_id: key_info.id,
        })
        .into_ok()
    }
}
