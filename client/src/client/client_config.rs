use ed25519_dalek::SigningKey;
use share::data_primitives::auth_key_id::AuthKeyId;

#[derive(Debug, typed_builder::TypedBuilder)]
pub struct ClientConfig {
    pub api_base: Box<str>,

    pub key_id: AuthKeyId,
    pub(super) key: SigningKey,
}
