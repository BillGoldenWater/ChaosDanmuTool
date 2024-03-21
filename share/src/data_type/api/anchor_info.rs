use super::user_info::UserInfo;
use crate::{
    bili_api::data_type::api::anchor_info::AnchorInfo as BiliAnchorInfo,
    data_primitives::room_id::RoomId, define_data_type,
};

define_data_type!(
    struct AnchorInfo {
        pub user: UserInfo,
        pub room_id: RoomId,
    }
);

impl From<BiliAnchorInfo> for AnchorInfo {
    fn from(value: BiliAnchorInfo) -> Self {
        Self {
            user: UserInfo {
                id: value.open_id,
                name: value.uname,
                face: value.uface,
            },
            room_id: value.room_id,
        }
    }
}
