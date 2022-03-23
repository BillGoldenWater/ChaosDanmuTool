export function printError(e: Error) {
  console.log(`\n${e.name}\n${e.message}\n${e.stack}`);
}
