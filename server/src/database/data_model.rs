use itertools::Itertools;
use mongodb::IndexModel;
use serde::{de::DeserializeOwned, Serialize};

pub mod auth_key_info;
pub mod session_info;

pub trait DataModel: Serialize + DeserializeOwned + Send + Sync {
    const NAME: &'static str;

    fn indexes() -> Vec<IndexModel>;

    fn indexes_with_name() -> Vec<(String, IndexModel)> {
        Self::indexes()
            .iter()
            .map(
                |idx| match idx.options.as_ref().and_then(|it| it.name.as_ref()) {
                    Some(name) => name.clone(),
                    None => idx
                        .keys
                        .iter()
                        .map(|(k, v)| format!("{k}_{v}"))
                        .collect::<Vec<_>>()
                        .join("_"),
                },
            )
            .zip_eq(Self::indexes())
            .collect()
    }
}
