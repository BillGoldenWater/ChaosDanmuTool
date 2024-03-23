use share::{data_primitives::auth_code::AuthCode, define_data_type};

use super::data_type::{
    anchor_info::AnchorInfo, game_info::GameInfo, websocket_info::WebsocketInfo,
};
use crate::bili_api::BiliRequest;

define_data_type!(
    struct ReqAppStart {
        pub app_id: i64,
        pub code: AuthCode,
    }
);

impl BiliRequest for ReqAppStart {
    const ENDPOINT: &'static str = "/v2/app/start";

    type Response = ResAppStart;
}

define_data_type!(
    struct ResAppStart {
        pub game_info: GameInfo,
        pub websocket_info: WebsocketInfo,
        pub anchor_info: AnchorInfo,
    }
);
