use crate::{define_data_type, server_api::Request, server_api_route_status};

define_data_type!(
    struct ReqReload {}
);

impl Request for ReqReload {
    const ROUTE: &'static str = server_api_route_status!("/reload");
    type Response = ResReload;
}

define_data_type!(
    struct ResReload {}
);
