use std::fmt::Display;

use axum::{
    body::Body,
    http::StatusCode,
    response::{IntoResponse, Response as AxumResponse},
};
use serde::{de::DeserializeOwned, Serialize};
use tracing::error;

use crate::define_data_type;

pub mod admin;
pub mod danmu;
pub mod request_signed;
pub mod status;

pub trait Request: Serialize {
    const ROUTE: &'static str;
    type Response: DeserializeOwned;
}

define_data_type!(
    @derive_ext(thiserror::Error)
    enum ResponseError {
        #[error("invalid request param")]
        Param,
        #[error("unknown internal server error")]
        Unknown,

        #[error("authentication failed")]
        Auth,
        #[error("invalid auth code")]
        BiliAuthCode,
        #[error("already has session opened")]
        SessionExists,
        #[error("invalid session id")]
        SessionNotExists,
    }
);

define_data_type!(
    enum Response<T> {
        Ok(T),
        Err(ResponseError),
    }
);

impl<T> Response<T> {
    pub fn from_unknown_err(err: impl Display) -> Self {
        error!("unexpected error: {err}");
        Self::Err(ResponseError::Unknown)
    }
}

impl<T> From<ResponseError> for Response<T> {
    fn from(value: ResponseError) -> Self {
        Self::Err(value)
    }
}

impl<T: Serialize> IntoResponse for Response<T> {
    fn into_response(self) -> AxumResponse {
        let data = match bson::to_vec(&self) {
            Ok(data) => data,
            Err(err) => {
                error!("failed to serialize response into bson: {err}");
                match bson::to_vec(&Response::<()>::Err(ResponseError::Unknown)) {
                    Ok(res) => res,
                    Err(err) => {
                        error!("failed to serialize backup response into bson: {err}");
                        return AxumResponse::builder()
                            .status(StatusCode::INTERNAL_SERVER_ERROR)
                            .body(Body::empty())
                            .expect("shouldn't fail");
                    }
                }
            }
        };
        data.into_response()
    }
}
