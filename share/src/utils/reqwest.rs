use std::time::Duration;

use anyhow::Context as _;
use reqwest::{Client, ClientBuilder};

pub fn client_builder() -> ClientBuilder {
    ClientBuilder::new()
        .connect_timeout(Duration::from_secs(2))
        .timeout(Duration::from_secs(4))
        .gzip(true)
        .brotli(true)
        .deflate(true)
}

pub fn client() -> anyhow::Result<Client> {
    client_builder()
        .build()
        .context("failed to build reqwest::Client")
}
