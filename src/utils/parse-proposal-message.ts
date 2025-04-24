export function parseMessage(message: string): string {
  try {
    const partsOfMsg = message.split('.');
    const lastPart = partsOfMsg.pop();
    if (!lastPart) {
      return message;
    }
    const prefix = 'Msg';
    if (!lastPart.startsWith(prefix)) {
      return message;
    }
    return lastPart.slice(prefix.length).replace(/([a-z])([A-Z])/g, '$1 $2');
  } catch (e) {
    return message;
  }
}
