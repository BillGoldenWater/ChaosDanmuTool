use share::{data_primitives::game_id::GameId, define_data_type};

define_data_type!(
    struct ReqAppEnd {
        pub app_id: i64,
        pub game_id: GameId,
    }
);

define_data_type!(
    struct ResAppEnd {}
);
