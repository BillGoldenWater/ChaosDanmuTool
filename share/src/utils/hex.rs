use super::functional::Functional;
use crate::define_data_type;

pub fn to_string(bytes: &[u8]) -> String {
    let mut buf = vec![0_u8; base16ct::encoded_len(bytes)];
    base16ct::lower::encode(bytes, &mut buf).expect("expect correct dst len");
    String::from_utf8(buf).expect("hex should be valid utf8")
}

pub fn from_str(string: &str) -> Result<Vec<u8>, DecodeError> {
    let target_len = match base16ct::decoded_len(string.as_bytes()) {
        Ok(len) => len,
        Err(base16ct::Error::InvalidLength) => return DecodeError::Length.into_err(),
        Err(err) => unreachable!("unexpected error: {err:?}"),
    };

    let mut buf = vec![0_u8; target_len];

    match base16ct::mixed::decode(string, &mut buf) {
        Ok(_) => buf.into_ok(),
        Err(base16ct::Error::InvalidEncoding) => DecodeError::Encoding.into_err(),
        Err(err) => unreachable!("unexpected error: {err:?}"),
    }
}

define_data_type!(@derive_ext(thiserror::Error) enum DecodeError {
    #[error("invalid encoding")]
    Encoding,
    #[error("invalid length")]
    Length
});
