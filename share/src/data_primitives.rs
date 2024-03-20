pub mod auth_body;
pub mod auth_code;
pub mod game_id;
pub mod open_id;
pub mod room_id;
pub mod user_face;
pub mod user_name;
pub mod wss_link;

#[macro_export]
macro_rules! define_data_primitive {
    ($name:ident ($($tt:tt)* )) => {
        #[derive(Debug, Clone, PartialEq, Eq, Hash, PartialOrd, Ord,
        serde::Serialize, serde::Deserialize)]
        pub struct $name($($tt)*);
    };
}
