use std::str::FromStr;

use tracing::error;

mod api_client;
mod run;
mod secret_key;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let rt = tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()
        .expect("failed to build async runtime");

    tauri::async_runtime::set(rt.handle().clone());

    if let Err(err) = rt.block_on(run::main()) {
        let mut msg = String::from_str("error occurs while running the app:").unwrap();

        for err in err.chain() {
            msg.push_str(&format!("\n{err}"));
        }

        error!("{msg}");
    }
}
