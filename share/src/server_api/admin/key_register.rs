use crate::{
    data_primitives::{auth_key_id::AuthKeyId, auth_key_note::AuthKeyNote, public_key::PublicKey},
    define_data_type,
    server_api::Request,
    server_api_route_admin,
};

define_data_type!(
    struct ReqKeyRegister {
        pub public_key: PublicKey,
        pub note: AuthKeyNote,
    }
);

impl Request for ReqKeyRegister {
    const ROUTE: &'static str = server_api_route_admin!("/keyRegister");
    type Response = ResKeyRegister;
}

define_data_type!(
    struct ResKeyRegister {
        pub key_id: AuthKeyId,
    }
);