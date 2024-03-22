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
        pub force: bool,
    }
);

impl Request for ReqStart {
    const ROUTE: &'static str = server_api_route_danmu!("/start");
    type Response = ResStart;
}

define_data_type!(
    struct ResStart {
        pub ws_info: WebsocketInfo,
        pub user: UserInfo,
    }
);
