use ed25519_dalek::{VerifyingKey, PUBLIC_KEY_LENGTH};

use crate::define_data_primitive;

define_data_primitive!(PublicKey(
    #[serde(with = "serde_bytes")]
    [u8; PUBLIC_KEY_LENGTH]
));

impl PublicKey {
    pub fn from_verifying_key(verifying_key: &VerifyingKey) -> Self {
        Self(verifying_key.to_bytes())
    }

    pub fn to_verifying_key(&self) -> Result<VerifyingKey, ed25519_dalek::SignatureError> {
        VerifyingKey::from_bytes(&self.0)
    }
}
