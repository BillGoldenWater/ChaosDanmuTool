use share::{data_primitives::auth_code::AuthCode, define_data_type};

use super::data_type::{
    anchor_info::AnchorInfo, game_info::GameInfo, websocket_info::WebsocketInfo,
};

define_data_type!(
    struct ReqAppStart {
        pub app_id: i64,
        pub code: AuthCode,
    }
);

define_data_type!(
    struct ResAppStart {
        pub game_info: GameInfo,
        pub websocket_info: WebsocketInfo,
        pub anchor_info: AnchorInfo,
    }
);
