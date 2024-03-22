use md5::{digest::Output, Digest as _, Md5};

use super::hex;

pub fn hash_md5(bytes: &[u8]) -> Output<Md5> {
    let mut hasher = Md5::new();
    hasher.update(bytes);
    hasher.finalize()
}

pub fn hash_md5_str(bytes: &[u8]) -> String {
    hex::to_string(&hash_md5(bytes))
}
