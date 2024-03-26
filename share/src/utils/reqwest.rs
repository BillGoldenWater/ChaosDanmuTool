use anyhow::Context as _;
use reqwest::{Client, ClientBuilder};

pub fn client_builder() -> ClientBuilder {
    ClientBuilder::new().gzip(true).brotli(true).deflate(true)
}

pub fn client() -> anyhow::Result<Client> {
    client_builder()
        .build()
        .context("failed to build reqwest::Client")
}
