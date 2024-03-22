use crate::{define_data_type, server_api::Request, server_api_route_danmu};

define_data_type!(
    struct ReqHeartbeat {}
);

impl Request for ReqHeartbeat {
    const ROUTE: &'static str = server_api_route_danmu!("/heartbeat");
    type Response = ResHeartbeat;
}

define_data_type!(
    struct ResHeartbeat {}
);
