mod app;

use leptos::{mount_to_body, view};

use crate::app::App;

fn main() {
    mount_to_body(|| {
        view! {
            <App/>
        }
    })
}
