export function isOlderThan3000(timestamp: number): boolean {
    const currentTime: number = Math.floor(Date.now() / 1000); // Convert milliseconds to seconds
    const difference: number = currentTime - timestamp;
    return difference > 3000;
}