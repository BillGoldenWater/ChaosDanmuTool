use bson::Bson;

use crate::utils::functional::Functional as _;

pub mod auth_body;
pub mod auth_code;
pub mod auth_key_id;
pub mod auth_key_note;
pub mod auth_signature;
pub mod game_id;
pub mod open_id;
pub mod public_key;
pub mod room_id;
pub mod user_face;
pub mod user_name;
pub mod wss_link;

#[macro_export]
macro_rules! define_data_primitive {
    (
        $( @attr_ext_pre{$($attr_pre_tt:tt)*} )?
        $( @derive_ext($($derive_tt:tt)*) )?
        $( @attr_ext{$($attr_tt:tt)*} )?
        $name:ident ($($tt:tt)* )
    ) => {
        $( $($attr_pre_tt)* )?
        #[derive(Debug, Clone, PartialEq, Eq, Hash, PartialOrd, Ord,
        ::serde::Serialize, ::serde::Deserialize
            $(, $($derive_tt)* )?
        )]
        $( $($attr_tt)* )?
        pub struct $name($($tt)*);

        impl $crate::data_primitives::DataPrimitive for $name {}
    };
}

pub trait DataPrimitive: serde::Serialize {
    fn to_bson(&self) -> anyhow::Result<Bson> {
        bson::to_bson(self).err_into()
    }
}
