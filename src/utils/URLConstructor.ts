export function constructURL(
  url: string,
  maxReconnectAttempt: number,
  viewerName: string
): string {
  const param: URLSearchParams = new URLSearchParams([
    ["maxReconnectAttemptNum", maxReconnectAttempt.toString(10)],
    ["name", viewerName],
  ]);
  return url + "?" + param;
}
