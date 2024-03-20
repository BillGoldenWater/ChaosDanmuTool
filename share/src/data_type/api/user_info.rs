use crate::{
    data_primitives::{open_id::OpenId, user_face::UserFace, user_name::UserName},
    define_data_type,
};

define_data_type!(
    struct UserInfo {
        pub id: OpenId,
        pub name: UserName,
        pub face: UserFace,
    }
);
