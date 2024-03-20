use crate::{
    data_primitives::{open_id::OpenId, room_id::RoomId, user_face::UserFace, user_name::UserName},
    define_data_type,
};

define_data_type!(
    struct AnchorInfo {
        pub room_id: RoomId,
        pub open_id: OpenId,
        pub uname: UserName,
        pub uface: UserFace,
    }
);
