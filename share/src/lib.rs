#![warn(missing_debug_implementations)]

pub mod bili_api;
pub mod data_primitives;
pub mod utils;

#[macro_export]
macro_rules! define_data_type {
    (
        $( @derive_ext($($derive_tt:tt)*) )?
        $( @attr_ext{$($attr_tt:tt)*} )?
        $type:ident $name:ident $($content_tt:tt)*
    ) => {
        #[derive(Debug, Clone, PartialEq, Hash, ::serde::Serialize, ::serde::Deserialize
        $(, $($derive_tt)* )?
        )]
        $( $($attr_tt)* )?
        pub $type $name $($content_tt)*
    };
}
