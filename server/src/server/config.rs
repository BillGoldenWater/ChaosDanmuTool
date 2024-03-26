use ed25519_dalek::VerifyingKey;
use semver::Version;

#[derive(Debug, typed_builder::TypedBuilder)]
pub struct ServerConfig {
    pub host: Box<str>,
    pub admin_pub_key: VerifyingKey,
    pub min_client_ver: Version,
}
