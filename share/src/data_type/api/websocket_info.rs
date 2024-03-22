use crate::{
    data_primitives::{auth_body::AuthBody, wss_link::WssLink},
    define_data_type,
};

define_data_type!(
    struct WebsocketInfo {
        pub auth: AuthBody,
        pub endpoints: Vec<WssLink>,
    }
);
