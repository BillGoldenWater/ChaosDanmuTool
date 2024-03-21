use ed25519_dalek::{Signature, SIGNATURE_LENGTH};

use crate::define_data_primitive;

define_data_primitive!(AuthSignature(
    #[serde(with = "serde_bytes")]
    [u8; SIGNATURE_LENGTH]
));

impl AuthSignature {
    pub fn from_signature(signature: &Signature) -> Self {
        Self(signature.to_bytes())
    }

    pub fn to_signature(&self) -> Signature {
        Signature::from_bytes(&self.0)
    }

    pub fn zero() -> Self {
        Self(std::array::from_fn(|_| 0))
    }
}
