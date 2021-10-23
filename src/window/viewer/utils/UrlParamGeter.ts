export function getParam(key: string): string {
  const paramStr: string = window.location.search.substring(1);
  const paramList: string[] = paramStr.split("&");

  for (const param in paramList) {
    const [name, value] = paramList[param].split("=");
    if (name == key) return value;
  }
}
