use share::{data_primitives::game_id::GameId, define_data_type};

use crate::bili_api::BiliRequest;

define_data_type!(
    struct ReqAppHeartbeat {
        pub game_id: GameId,
    }
);

impl BiliRequest for ReqAppHeartbeat {
    const ENDPOINT: &'static str = "/v2/app/heartbeat";

    type Response = ResAppHeartbeat;
}

define_data_type!(
    struct ResAppHeartbeat {}
);
