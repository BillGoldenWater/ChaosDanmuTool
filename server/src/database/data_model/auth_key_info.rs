use share::{
    data_primitives::{auth_key_id::AuthKeyId, auth_key_note::AuthKeyNote, public_key::PublicKey},
    define_data_type,
};

define_data_type!(
    struct AuthKeyInfo {
        pub id: AuthKeyId,
        pub public_key: PublicKey,
        pub note: AuthKeyNote,
    }
);
