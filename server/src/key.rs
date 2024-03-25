use std::env::VarError;

use anyhow::{anyhow, Context};
use ed25519_dalek::{SigningKey, VerifyingKey, PUBLIC_KEY_LENGTH};
use rand::rngs::OsRng;
use share::utils::{env, functional::Functional as _, hex};
use tracing::error;

pub fn read_admin_pk() -> anyhow::Result<VerifyingKey> {
    let pk = match env::read("CDT_ADMIN_PK") {
        Ok(data) => data,
        Err(err) => match err.downcast_ref::<VarError>() {
            Some(VarError::NotPresent) => {
                error!("CDT_ADMIN_PK isn't found in environment variable, generating one");
                let sk = SigningKey::generate(&mut OsRng);
                let pk = sk.verifying_key();
                let sk = hex::to_string(sk.as_bytes());
                let pk = hex::to_string(pk.as_bytes());
                error!("CDT_ADMIN_SK={sk}\nCDT_ADMIN_PK={pk}");
                std::process::exit(0);
            }
            _ => return err.into_err().context("failed to read admin pub key"),
        },
    };

    let pk = hex::from_str(&pk).context("failed to decode pub key from hex")?;

    if pk.len() != PUBLIC_KEY_LENGTH {
        return anyhow!("invalid pub key length").into_err();
    }

    VerifyingKey::from_bytes(&pk.try_into().expect("expect into success"))
        .context("invalid pub key")
}
