use bson::{doc, serde_helpers::chrono_datetime_as_bson_datetime};
use chrono::{DateTime, Utc};
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
        #[serde(with = "chrono_datetime_as_bson_datetime")]
        pub last_heartbeat: DateTime<Utc>,
    }
);

impl DataModel for SessionInfo {
    const NAME: &'static str = "session";

    fn indexes() -> Vec<IndexModel> {
        vec![
            IndexModel::builder()
                .keys(doc! {"key_id": 1})
                .options(IndexOptions::builder().unique(true).build())
                .build(),
            IndexModel::builder()
                .keys(doc! {"last_heartbeat": 1})
                .options(IndexOptions::builder().unique(false).build())
                .build(),
        ]
    }
}
