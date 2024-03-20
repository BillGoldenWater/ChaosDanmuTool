use share::{
    bili_api::data_type::api::websocket_info::WebsocketInfo, data_primitives::auth_code::AuthCode,
    data_type::api::user_info::UserInfo, define_data_type,
};

use crate::{server::api::Request, server_api_route_danmu};

define_data_type!(
    struct ReqStart {
        pub code: AuthCode,
        pub force: bool,
    }
);

impl Request for ReqStart {
    const ROUTE: &'static str = server_api_route_danmu!("/start");
}

define_data_type!(
    struct ResStart {
        pub ws_info: WebsocketInfo,
        pub user: UserInfo,
    }
);
