#[derive(Debug, typed_builder::TypedBuilder)]
pub struct ServerConfig {
    pub host: Box<str>,
}
