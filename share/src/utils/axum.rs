use tower::{
    layer::util::{Identity, Stack},
    ServiceBuilder,
};
use tower_http::{
    compression::{predicate::SizeAbove, CompressionLayer},
    CompressionLevel,
};

pub fn compression_layer() -> ServiceBuilder<Stack<CompressionLayer<SizeAbove>, Identity>> {
    ServiceBuilder::new().layer(
        CompressionLayer::new()
            .quality(CompressionLevel::Best)
            .compress_when(SizeAbove::new(64)),
    )
}
