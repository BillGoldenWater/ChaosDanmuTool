use crate::{
    data_primitives::auth_code::AuthCode,
    data_type::api::{user_info::UserInfo, websocket_info::WebsocketInfo},
    define_data_type,
    server_api::Request,
    server_api_route_danmu,
};

define_data_type!(
    struct ReqStart {
        pub code: AuthCode,
        // TODO: remove force, let client call /danmu/end when needed
        pub force: bool,
    }
);

impl Request for ReqStart {
    const ROUTE: &'static str = server_api_route_danmu!("/start");
    type Response = ResStart;
}

define_data_type!(
    struct ResStart {
        // TODO: add game_id, let client call heartbeat endpoint with game id
        // for check "is this session ended by another client and started a new one"
        pub ws_info: WebsocketInfo,
        pub user: UserInfo,
    }
);
