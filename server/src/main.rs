#![warn(missing_debug_implementations)]
#![cfg_attr(feature = "bench", feature(test))]

mod bili_api;
mod database;
mod key;
mod run;
mod server;

fn main() -> anyhow::Result<()> {
    let rt = tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()?;
    rt.block_on(run::run())
}
