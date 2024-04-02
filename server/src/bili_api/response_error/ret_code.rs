use serde::{Deserialize, Serialize};

macro_rules! def_ret_code {
    ($name:ident { $( $num:literal : $variant:ident ),* $(,)? }) => {
        #[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
        #[serde(from = "i64", into = "i64")]
        pub enum $name {
            $( $variant, )*
            Unknown(i64),
        }

        impl From<i64> for $name {
            fn from(value: i64) -> Self {
                match value {
                    $( $num => Self::$variant, )*
                    num => Self::Unknown(num),
                }
            }
        }

        impl From<$name> for i64 {
            fn from(value: $name) -> i64 {
                match value {
                    $( $name::$variant => $num, )*
                    $name::Unknown(num) => num,
                }
            }
        }
    };
}

def_ret_code!(RetCode {
    -9223372036854775808: OkNoData,
    0: Ok,
    4000: InvalidParam,
    4001: InvalidAccessKeyId,
    4002: InvalidSign,
    4003: InvalidTs,
    4004: InvalidNonce,
    4005: InvalidSignMethod,
    4006: InvalidSignVer,
    4007: IpNotInWhiteList,
    4008: PermissionLimit,
    4009: AccessLimit,
    4010: ApiNotExists,
    4011: InvalidContentType,
    4012: InvalidContentHash,
    4013: InvalidAccept,
    5000: ServiceErr,
    5001: RequestTimeout,
    5002: InternalErr,
    5003: ConfigErr,
    5004: RoomNotInWhiteList,
    5005: RoomInBlackList,
    6000: InvalidCaptcha,
    6001: InvalidPhoneNumber,
    6002: CaptchaExpired,
    6003: CaptchaRateLimit,
    7000: NoGame,
    7001: GameInEnding,
    7002: GameAlreadyExists,
    7003: InvalidGameId,
    7004: BatchHeartbeatLimit,
    7005: BatchHeartbeatIdDup,
    7007: InvalidAuthCode,
    8002: InvalidAppId,
});
