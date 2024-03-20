use share::define_data_type;

pub mod admin;
pub mod danmu;

pub trait Request {
    const ROUTE: &'static str;
}

#[macro_export]
macro_rules! server_api_route {
    ($( $route:tt )*) => {
        concat!("/v0", $( $route )*)
    };
}

define_data_type!(
    @derive_ext(thiserror::Error)
    enum ServerResponseError {
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
    enum ServerResponse<T> {
        Ok(T),
        Err(ServerResponseError),
    }
);
