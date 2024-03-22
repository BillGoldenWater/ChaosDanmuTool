use share::{
    data_primitives::{auth_body::AuthBody, wss_link::WssLink},
    data_type::api::websocket_info::WebsocketInfo as CdtWebsocketInfo,
    define_data_type,
};

define_data_type!(
    struct WebsocketInfo {
        pub auth_body: AuthBody,
        pub wss_link: Vec<WssLink>,
    }
);

impl From<WebsocketInfo> for CdtWebsocketInfo {
    fn from(value: WebsocketInfo) -> Self {
        Self {
            auth: value.auth_body,
            endpoints: value.wss_link,
        }
    }
}
