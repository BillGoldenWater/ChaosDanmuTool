use share::define_data_type;

use crate::{server::api::Request, server_api_route_danmu};

define_data_type!(
    struct ReqHeartbeat {}
);

impl Request for ReqHeartbeat {
    const ROUTE: &'static str = server_api_route_danmu!("/heartbeat");
}

define_data_type!(
    struct ResHeartbeat {}
);
