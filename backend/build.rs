fn main() {
  // #[cfg(target_os = "windows")]
  // embed_resource::compile("manifest.rc");

  tauri_build::build()
}
