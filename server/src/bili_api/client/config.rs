use std::{fmt::Debug, sync::Arc};

#[derive(typed_builder::TypedBuilder)]
pub struct BiliApiClientConfig {
    pub api_base: Arc<str>,

    pub app_id: i64,
    pub access_key_id: Arc<str>,
    pub(super) access_key_secret: Arc<str>,
}

impl Debug for BiliApiClientConfig {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("BiliApiClientConfig")
            .field("api_base", &self.api_base)
            .field("app_id", &self.app_id)
            .field("access_key_id", &self.access_key_id)
            .field("access_key_secret", &"***")
            .finish()
    }
}
