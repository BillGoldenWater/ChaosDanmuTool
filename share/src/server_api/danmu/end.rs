use crate::{define_data_type, server_api::Request, server_api_route_danmu};

define_data_type!(
    struct ReqEnd {}
);

impl Request for ReqEnd {
    const ROUTE: &'static str = server_api_route_danmu!("/end");
    type Response = ResEnd;
}

define_data_type!(
    struct ResEnd {}
);
