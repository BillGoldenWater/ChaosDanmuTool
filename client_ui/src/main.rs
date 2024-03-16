mod app;

use crate::app::App;
use leptos::{mount_to_body, view};

fn main() {
    mount_to_body(|| {
        view! {
            <App/>
        }
    })
}
