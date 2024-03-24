use bson::doc;
use mongodb::{options::IndexOptions, IndexModel};
use share::{
    data_primitives::{auth_key_id::AuthKeyId, game_id::GameId},
    define_data_type,
};

use super::DataModel;

define_data_type!(
    struct SessionInfo {
        pub key_id: AuthKeyId,
        pub game_id: GameId,
    }
);

impl DataModel for SessionInfo {
    const NAME: &'static str = "session";

    fn indexes() -> Vec<IndexModel> {
        vec![IndexModel::builder()
            .keys(doc! {"key_id": 1})
            .options(IndexOptions::builder().unique(true).build())
            .build()]
    }
}
