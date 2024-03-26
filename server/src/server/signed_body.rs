use ::core::{future::Future, pin::Pin};
use anyhow::Context;
use axum::{
    body::Bytes,
    extract::{FromRef, FromRequest, Request},
    RequestExt,
};
use serde::de::DeserializeOwned;
use share::{
    define_data_type,
    server_api::{request_signed::RequestSigned, Response, ResponseError},
    utils::functional::Functional,
};
use tracing::debug;

use self::user_type::UserType;
use crate::server::Server;

pub mod user_type;

define_data_type!(
    struct SignedBody<T> {
        pub body: T,
        pub user_type: UserType,
    }
);

impl<T> SignedBody<T>
where
    T: DeserializeOwned,
{
    async fn from_request_inner<S>(req: Request, state: &S) -> Result<Self, Response<()>>
    where
        S: Send + Sync,
        Server: FromRef<S>,
    {
        let server = Server::from_ref(state);
        let auth_err = Response::<()>::from(ResponseError::Auth);

        let body = req
            .extract::<Bytes, _>()
            .await
            .context("failed to read request body")
            .map_err(Response::<()>::from_unknown_err)?;

        let req_signed = bson::from_slice::<RequestSigned>(&body).map_err(|err| {
            debug!("failed to decode request: {err}");
            Response::<()>::from(ResponseError::Param)
        })?;

        let pub_key = server
            .get_pub_key(req_signed.key_id())
            .await
            .map_err(Response::from_unknown_err)?;

        let user_type = if let Some(pub_key) = pub_key {
            req_signed.verify(&pub_key).map_err(|err| {
                debug!("auth failed: invalid signature, err: {err}");
                auth_err
            })?;

            if req_signed.key_id().is_admin_key() {
                UserType::Admin
            } else {
                UserType::Registered
            }
        } else {
            UserType::Guest
        };

        let body = bson::from_slice(&req_signed.into_body()).map_err(|err| {
            debug!("failed to decode body: {err}");
            Response::<()>::from(ResponseError::Param)
        })?;

        Self { body, user_type }.into_ok()
    }
}

impl<S, T> FromRequest<S> for SignedBody<T>
where
    S: Send + Sync,
    T: DeserializeOwned,
    Server: FromRef<S>,
{
    type Rejection = Response<()>;

    fn from_request<'state, 'fut>(
        req: Request,
        state: &'state S,
    ) -> Pin<Box<dyn Future<Output = Result<Self, Self::Rejection>> + Send + 'fut>>
    where
        'state: 'fut,
        Self: 'fut,
    {
        Box::pin(Self::from_request_inner(req, state))
    }
}
