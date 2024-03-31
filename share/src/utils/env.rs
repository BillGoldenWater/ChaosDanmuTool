use anyhow::Context as _;

pub fn read(key: &str) -> anyhow::Result<String> {
    std::env::var(key).with_context(|| format!("failed to read {key}"))
}

pub fn load() {
    dotenv::dotenv().ok();
    dotenv::from_filename(".secrets.env").ok();
}
