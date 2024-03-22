use base64ct::{Base64Unpadded, Encoding};

pub fn to_string(bytes: &[u8]) -> String {
    Base64Unpadded::encode_string(bytes)
}

pub fn from_str(string: &str) -> Result<Vec<u8>, base64ct::Error> {
    Base64Unpadded::decode_vec(string)
}
