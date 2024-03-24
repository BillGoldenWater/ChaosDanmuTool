use std::path::Path;

use anyhow::{anyhow, Context};
use ed25519_dalek::{SigningKey, SECRET_KEY_LENGTH};
use share::{
    data_primitives::auth_key_id::AuthKeyId,
    utils::{env, functional::Functional, hex},
};

pub fn read_or_gen(_data_dir: &Path) -> anyhow::Result<(AuthKeyId, SigningKey)> {
    // TODO: fallback to generated secret key, and only use admin key when set
    let sk = env::read("CDT_ADMIN_SK")?;

    let sk = hex::from_str(&sk).context("failed to decode secret key from hex")?;

    if sk.len() != SECRET_KEY_LENGTH {
        return anyhow!("invalid secret key length").into_err();
    }

    let sk = SigningKey::from_bytes(&sk.try_into().expect("expect into success"));

    (AuthKeyId::admin(), sk).into_ok()
}
