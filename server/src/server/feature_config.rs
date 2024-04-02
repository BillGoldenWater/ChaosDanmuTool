use anyhow::Context;
use share::{
    define_data_type,
    utils::{env, functional::Functional},
};
use tracing::{debug, info, instrument};

define_data_type!(
    struct FeatureConfig {
        limit_guest_num: u32,
    }
);

impl FeatureConfig {
    #[instrument(level = "info")]
    pub async fn load() -> anyhow::Result<Self> {
        info!("loading feature config");

        let path = env::read("CDT_FEATURE_CONFIG")?;
        debug!("path {path:?}");

        let config = tokio::fs::read_to_string(&path)
            .await
            .with_context(|| format!("failed to read feature config at {:?}", path))?;

        let config = toml::from_str::<Self>(&config).context("failed to parse feature config")?;

        config.into_ok()
    }

    #[instrument(level = "info")]
    pub async fn reload(&mut self) -> anyhow::Result<()> {
        *self = Self::load()
            .await
            .context("failed to reload feature config")?;
        Ok(())
    }
}
