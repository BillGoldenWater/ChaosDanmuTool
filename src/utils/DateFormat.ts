export function DateFormat(): string {
  const date = new Date();
  return (
    "[" +
    date.getHours() +
    ":" +
    date.getMinutes() +
    ":" +
    date.getSeconds() +
    "." +
    date.getMilliseconds() +
    "]"
  );
}
