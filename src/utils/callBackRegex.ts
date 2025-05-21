export function createCallbackRegex(button: string): RegExp {
  return new RegExp(`^${button}_(\\d+)$`);
}
