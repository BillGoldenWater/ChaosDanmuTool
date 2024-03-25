use tracing_subscriber::{fmt::format::FmtSpan, EnvFilter};

pub fn init() {
    dotenv::dotenv().ok();
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env())
        .with_span_events(FmtSpan::NEW | FmtSpan::CLOSE)
        .init();
}
