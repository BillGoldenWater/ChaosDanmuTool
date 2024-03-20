use ed25519_dalek::{SigningKey, SECRET_KEY_LENGTH};
use share::define_data_primitive;

define_data_primitive!(SecretKey(
    #[serde(with = "serde_bytes")]
    [u8; SECRET_KEY_LENGTH]
));

impl SecretKey {
    pub fn from_signing_key(signing_key: SigningKey) -> Self {
        Self(signing_key.to_bytes())
    }

    pub fn to_signing_key(&self) -> SigningKey {
        SigningKey::from_bytes(&self.0)
    }
}
