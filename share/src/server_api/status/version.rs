use crate::{
    data_primitives::version::Version, define_data_type, server_api::Request,
    server_api_route_status,
};

define_data_type!(
    struct ReqVersion {}
);

impl Request for ReqVersion {
    const ROUTE: &'static str = server_api_route_status!("/version");
    type Response = ResVersion;
}

define_data_type!(
    struct ResVersion {
        pub minimum_version: Version,
    }
);
