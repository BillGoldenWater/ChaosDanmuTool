use super::user_info::UserInfo;
use crate::{data_primitives::room_id::RoomId, define_data_type};

define_data_type!(
    struct AnchorInfo {
        pub user: UserInfo,
        pub room_id: RoomId,
    }
);
