use std::fmt::Debug;

use ed25519_dalek::SigningKey;
use share::data_primitives::auth_key_id::AuthKeyId;

#[derive(typed_builder::TypedBuilder)]
pub struct ClientConfig {
    pub api_base: Box<str>,

    pub key_id: AuthKeyId,
    pub(super) key: SigningKey,
}

impl Debug for ClientConfig {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("ClientConfig")
            .field("api_base", &self.api_base)
            .field("key_id", &self.key_id)
            .field("key", &"***")
            .finish()
    }
}
