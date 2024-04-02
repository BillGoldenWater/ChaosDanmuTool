use std::fmt::Display;

use bson::oid::ObjectId;

use crate::define_data_primitive;

define_data_primitive!(AuthKeyId(ObjectId));

impl AuthKeyId {
    pub fn new() -> Self {
        Self(ObjectId::new())
    }

    pub fn admin() -> Self {
        Self(ObjectId::from_bytes(std::array::from_fn(|_| 0)))
    }

    pub fn is_admin_key(&self) -> bool {
        self.0.bytes().iter().all(|&it| it == 0)
    }
}

impl From<AuthKeyId> for ObjectId {
    fn from(value: AuthKeyId) -> Self {
        value.0
    }
}

impl Display for AuthKeyId {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0.to_hex())
    }
}
