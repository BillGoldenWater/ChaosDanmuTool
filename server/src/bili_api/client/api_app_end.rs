use share::{data_primitives::game_id::GameId, define_data_type};

use crate::bili_api::BiliRequest;

define_data_type!(
    struct ReqAppEnd {
        pub app_id: i64,
        pub game_id: GameId,
    }
);

impl BiliRequest for ReqAppEnd {
    const ENDPOINT: &'static str = "/v2/app/end";

    type Response = ResAppEnd;
}

define_data_type!(
    struct ResAppEnd {}
);
