export function constructURL(
  url: string,
  port: number,
  maxReconnectAttempt: number,
  viewerName: string
): string {
  const param: URLSearchParams = new URLSearchParams([
    ["port", port.toString()],
    ["maxReconnectAttemptNum", maxReconnectAttempt.toString(10)],
    ["name", viewerName],
  ]);
  return url + "?" + param;
}
