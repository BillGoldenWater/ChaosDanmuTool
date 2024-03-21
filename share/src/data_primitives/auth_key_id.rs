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
