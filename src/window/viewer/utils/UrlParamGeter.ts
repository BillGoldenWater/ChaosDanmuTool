export function getParam(key: string): string {
  return new URLSearchParams(window.location.search).get(key);
}
