use share::server_api::{Response, ResponseError};

pub async fn fallback() -> Response<()> {
    ResponseError::NotFound.into()
}
