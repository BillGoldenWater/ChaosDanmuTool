use crate::{
    bili_api::data_type::api::websocket_info::WebsocketInfo as BiliWebsocketInfo,
    data_primitives::{auth_body::AuthBody, wss_link::WssLink},
    define_data_type,
};

define_data_type!(
    struct WebsocketInfo {
        pub auth: AuthBody,
        pub endpoints: Vec<WssLink>,
    }
);

impl From<BiliWebsocketInfo> for WebsocketInfo {
    fn from(value: BiliWebsocketInfo) -> Self {
        Self {
            auth: value.auth_body,
            endpoints: value.wss_link,
        }
    }
}
