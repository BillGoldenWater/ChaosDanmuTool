use bson::doc;
use mongodb::{options::IndexOptions, IndexModel};
use share::{
    data_primitives::{auth_key_id::AuthKeyId, auth_key_note::AuthKeyNote, public_key::PublicKey},
    define_data_type,
};

use super::DataModel;

define_data_type!(
    struct AuthKeyInfo {
        pub id: AuthKeyId,
        pub public_key: PublicKey,
        pub note: AuthKeyNote,
    }
);

impl DataModel for AuthKeyInfo {
    const NAME: &'static str = "auth_key";

    fn indexes() -> Vec<IndexModel> {
        vec![IndexModel::builder()
            .keys(doc! {"id": 1, "public_key": 1})
            .options(IndexOptions::builder().unique(true).build())
            .build()]
    }
}
