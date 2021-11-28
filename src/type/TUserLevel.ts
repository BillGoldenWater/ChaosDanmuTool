export type TUserLevel = (number | string)[];

export function getUserUL(userLevel: TUserLevel): number {
  if (userLevel) {
    return <number>userLevel[0];
  }
  return null;
}
