use ::core::{future::Future, pin::Pin};
use axum::{
    body::Bytes,
    extract::{FromRef, FromRequest, Request},
    RequestExt,
};
use serde::de::DeserializeOwned;
use share::{
    define_data_type,
    server_api::{
        request_signature::{RequestSignature, SIGNATURE_HEADER_NAME},
        Response, ResponseError,
    },
    utils::{functional::Functional, hex},
};
use tracing::debug;

use crate::server::Server;

define_data_type!(
    struct SignedBody<T> {
        pub body: T,
        pub is_admin: bool,
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
        let s = Server::from_ref(state);
        let auth_err = Response::<()>::from(ResponseError::Auth);

        let sign = req
            .headers()
            .get(SIGNATURE_HEADER_NAME)
            .ok_or_else(|| {
                debug!("auth failed: missing header {SIGNATURE_HEADER_NAME}");
                auth_err.clone()
            })?
            .then(|header_value| header_value.to_str())
            .map_err(|err| {
                debug!("auth failed: invalid header value, err: {err}");
                auth_err.clone()
            })?
            .then(hex::from_str)
            .map_err(|err| {
                debug!("auth failed: invalid hex, err: {err}");
                auth_err.clone()
            })?
            .then(|bytes| bson::from_slice::<RequestSignature>(&bytes))
            .map_err(|err| {
                debug!("auth failed: invalid hex, err: {err}");
                auth_err.clone()
            })?;

        let pub_key = s.get_pub_key(sign.key_id()).ok_or_else(|| {
            debug!("auth failed: invalid key id");
            auth_err.clone()
        })?;

        let body = req
            .extract::<Bytes, _>()
            .await
            .map_err(Response::<()>::from_unknown_err)?;

        sign.verify(&body, pub_key).map_err(|err| {
            debug!("auth failed: invalid signature, err: {err}");
            auth_err
        })?;

        let body = bson::from_slice(&body).map_err(|err| {
            debug!("failed to decode body: {err}");
            Response::<()>::from(ResponseError::Param)
        })?;

        Self {
            body,
            is_admin: sign.key_id().is_admin_key(),
        }
        .into_ok()
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
