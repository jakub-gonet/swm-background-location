export const messages: string[] = [];
export function log(message: Record<string, unknown>) {
  messages.push(now() + ": " + JSON.stringify(message, null, 2));
}

function now() {
  return new Date().toISOString().split("T")[1];
}
