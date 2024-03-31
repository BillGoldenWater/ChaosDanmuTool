use anyhow::Context;
use futures::Future;
use share::utils::env;
use tracing::info;
use tracing_subscriber::{
    fmt, layer::SubscriberExt, util::SubscriberInitExt, EnvFilter, Layer as _,
};

pub async fn init() -> anyhow::Result<impl Future<Output = anyhow::Result<()>>> {
    dotenv::dotenv().ok();

    let loki_name = env::read("CDT_LOKI_NAME")?;
    let loki_env = env::read("CDT_LOKI_ENV")?;
    let loki_url = env::read("CDT_LOKI_URL")?;

    let (loki_layer, loki_controller, loki_task) = tracing_loki::builder()
        .label("name", loki_name)
        .context("failed to add label name")?
        .label("env", loki_env)
        .context("failed to add label environment")?
        .build_controller_url(url::Url::parse(&loki_url).context("failed to parse loki url")?)
        .context("failed to build tracing to loki")?;

    tracing_subscriber::registry()
        .with(loki_layer.with_filter(EnvFilter::from_env("CDT_LOKI_FILTER")))
        .with(fmt::Layer::new().with_filter(EnvFilter::from_default_env()))
        .init();

    let loki_handle = tokio::spawn(loki_task);

    Ok(async move {
        info!("shutting down loki background task");
        loki_controller.shutdown().await;
        info!("watting loki background task to exit");
        loki_handle
            .await
            .context("failed to await loki background task to exit")?;

        Ok(())
    })
}
