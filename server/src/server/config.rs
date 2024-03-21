use ed25519_dalek::VerifyingKey;

#[derive(Debug, typed_builder::TypedBuilder)]
pub struct ServerConfig {
    pub host: Box<str>,
    pub admin_pub_key: VerifyingKey,
}
