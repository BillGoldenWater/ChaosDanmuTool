pub fn to_string_hex(bytes: &[u8]) -> String {
    let mut buf = vec![0_u8; base16ct::encoded_len(&bytes)];
    base16ct::lower::encode(&bytes, &mut buf).expect("expect correct dst len");
    String::from_utf8(buf).expect("valid utf8")
}
