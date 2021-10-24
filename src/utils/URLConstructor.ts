export function constructURL(
  url: string,
  address: string,
  port: number,
  maxReconnectAttempt: number,
  viewerName: string
): string {
  const param = (
    "?address={{address}}" +
    "&port={{port}}" +
    "&maxReconnectAttemptNum={{maxReconnectAttemptNum}}" +
    "&name={{name}}"
  )
    .replace("{{address}}", address)
    .replace("{{port}}", port.toString())
    .replace("{{maxReconnectAttemptNum}}", maxReconnectAttempt.toString())
    .replace("{{name}}", viewerName);
  return url + param;
}
