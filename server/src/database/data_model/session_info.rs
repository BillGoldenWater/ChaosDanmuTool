use share::{
    data_primitives::{auth_key_id::AuthKeyId, game_id::GameId},
    define_data_type,
};

define_data_type!(
    struct SessionInfo {
        pub key_id: AuthKeyId,
        pub game_id: GameId,
    }
);
