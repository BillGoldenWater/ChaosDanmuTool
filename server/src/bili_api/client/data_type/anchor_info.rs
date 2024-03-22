use share::{
    data_primitives::{open_id::OpenId, room_id::RoomId, user_face::UserFace, user_name::UserName},
    data_type::api::{anchor_info::AnchorInfo as CdtAnchorInfo, user_info::UserInfo},
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

impl From<AnchorInfo> for CdtAnchorInfo {
    fn from(value: AnchorInfo) -> Self {
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
