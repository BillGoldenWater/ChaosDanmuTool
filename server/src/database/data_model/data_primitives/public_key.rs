use ed25519_dalek::{VerifyingKey, PUBLIC_KEY_LENGTH};
use share::define_data_primitive;

define_data_primitive!(PublicKey(
    #[serde(with = "serde_bytes")]
    [u8; PUBLIC_KEY_LENGTH]
));

impl PublicKey {
    pub fn from_verifying_key(verifying_key: &VerifyingKey) -> Self {
        Self(verifying_key.to_bytes())
    }

    pub fn to_verifying_key(&self) -> anyhow::Result<VerifyingKey> {
        VerifyingKey::from_bytes(&self.0).map_err(Into::into)
    }
}
