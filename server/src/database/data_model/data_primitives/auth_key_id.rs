use bson::oid::ObjectId;
use share::define_data_primitive;

define_data_primitive!(AuthKeyId(ObjectId));

impl AuthKeyId {
    pub fn new() -> Self {
        Self(ObjectId::new())
    }

    pub fn admin() -> Self {
        Self(ObjectId::from_bytes(std::array::from_fn(|_| 0)))
    }
}
