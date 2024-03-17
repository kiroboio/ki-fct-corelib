export function getDate(days = 0) {
    const result = new Date();
    result.setDate(result.getDate() + days);
    return Number(result.getTime() / 1000).toFixed();
}
//# sourceMappingURL=misc.js.map