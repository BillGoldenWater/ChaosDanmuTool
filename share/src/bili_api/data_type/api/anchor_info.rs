use serde::{Deserialize, Serialize};

use crate::data_primitives::{
    open_id::OpenId, room_id::RoomId, user_face::UserFace, user_name::UserName,
};

#[derive(Debug, Clone, PartialEq, Hash, Serialize, Deserialize)]
pub struct AnchorInfo {
    room_id: RoomId,
    open_id: OpenId,
    uname: UserName,
    uface: UserFace,
}
