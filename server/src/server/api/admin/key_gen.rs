use share::define_data_type;

use crate::{
    database::data_model::data_primitives::{
        auth_key_id::AuthKeyId, auth_key_note::AuthKeyNote, secret_key::SecretKey,
    },
    server::api::Request,
    server_api_route_admin,
};

define_data_type!(
    struct ReqKeyGen {
        pub note: AuthKeyNote,
    }
);

impl Request for ReqKeyGen {
    const ROUTE: &'static str = server_api_route_admin!("/keyGen");
}

define_data_type!(
    struct ResKeyGen {
        pub key_id: AuthKeyId,
        pub secret_key: SecretKey,
    }
);
