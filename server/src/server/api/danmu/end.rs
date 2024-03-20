use share::define_data_type;

use crate::{server::api::Request, server_api_route_danmu};

define_data_type!(
    struct ReqEnd {}
);

impl Request for ReqEnd {
    const ROUTE: &'static str = server_api_route_danmu!("/end");
}

define_data_type!(
    struct ResEnd {}
);
