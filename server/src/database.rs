use std::{collections::HashMap, sync::Arc};

use anyhow::Context;
use itertools::Itertools;
use mongodb::{Client, ClientSession, Collection, Database as MongoDatabase, IndexModel};
use share::utils::functional::Functional;
use tracing::{debug, info, instrument, trace};

use self::data_model::{auth_key_info::AuthKeyInfo, session_info::SessionInfo, DataModel};

pub mod data_model;

#[derive(Debug, Clone)]
pub struct Database {
    inner: Arc<DatabaseInner>,
}

#[derive(Debug)]
struct DatabaseInner {
    client: Client,
    db: MongoDatabase,
}

impl Database {
    #[instrument(level = "debug", skip(uri))]
    pub async fn new(uri: &str, database: &str) -> anyhow::Result<Self> {
        info!("creating database client");
        let client = Client::with_uri_str(uri)
            .await
            .context("failed to create client")?;
        let db = client.database(database);
        let inner = DatabaseInner { client, db };
        let this = Self {
            inner: inner.into(),
        };

        this.into_ok()
    }

    pub fn coll<T: DataModel>(&self) -> Collection<T> {
        self.inner.db.collection(T::NAME)
    }

    pub async fn start_session(&self) -> anyhow::Result<ClientSession> {
        self.inner
            .client
            .start_session(None)
            .await
            .context("failed to start database session")
    }

    #[instrument(level = "debug", skip(self))]
    pub async fn shutdown(self) {
        info!("shutting down database client");

        self.inner.client.clone().shutdown().await;
    }

    #[instrument(level = "debug", skip(self))]
    pub async fn sync(&self) -> anyhow::Result<()> {
        info!("syncing database collections");

        async fn sync_coll<T: DataModel>(this: &Database) -> anyhow::Result<()> {
            this.sync_coll::<T>()
                .await
                .with_context(|| format!("failed to sync collection {}", T::NAME))
        }

        sync_coll::<AuthKeyInfo>(self).await?;
        sync_coll::<SessionInfo>(self).await?;

        Ok(())
    }

    #[instrument(level = "info", skip(self), fields(name = T::NAME))]
    async fn sync_coll<T: DataModel>(&self) -> anyhow::Result<()> {
        info!("syncing collection: {}", T::NAME);

        let db = &self.inner.db;

        let coll_exists = db
            .list_collection_names(None)
            .await?
            .into_iter()
            .any(|it| it.eq(T::NAME));

        if !coll_exists {
            info!("creating collection");
            db.create_collection(T::NAME, None).await?;
        }

        self.sync_coll_index::<T>().await?;
        Ok(())
    }

    #[instrument(level = "debug", skip(self))]
    async fn sync_coll_index<T: DataModel>(&self) -> Result<(), mongodb::error::Error> {
        debug!("syncing index");

        let coll = self.inner.db.collection::<T>(T::NAME);

        let exists_idx = coll
            .list_index_names()
            .await?
            .into_iter()
            .filter(|it| it.ne("_id_"))
            .collect_vec();
        trace!("exists indexes: {exists_idx:?}");

        // value: None for delete, Some(idx) for create
        let mut diff = exists_idx
            .into_iter()
            .map(|name| (name, None))
            .collect::<HashMap<_, Option<IndexModel>>>();
        let coll_idx = T::indexes_with_name();

        for (name, idx) in coll_idx {
            if diff.remove(&name).is_none() {
                diff.insert(name, Some(idx));
            }
        }

        for (name, create) in diff {
            if let Some(idx) = create {
                info!("creating index: {name}");
                coll.create_index(idx, None).await?;
            } else {
                info!("dropping index: {name}");
                coll.drop_index(name, None).await?;
            }
        }

        Ok(())
    }
}
