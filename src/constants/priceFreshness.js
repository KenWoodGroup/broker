export const PRICE_UPDATE_RULES = {
    fast: { green: 2, yellow: 5 },
    medium: { green: 7, yellow: 14 },
    slow: { green: 20, yellow: 30 },
};

export function getLatestSalePriceUpdatedAt(salePriceTypes) {
    if (!Array.isArray(salePriceTypes) || salePriceTypes.length === 0) return null;
    let latestMs = 0;
    for (const row of salePriceTypes) {
        const raw = row?.updatedAt ?? row?.updated_at;
        if (!raw) continue;
        const ms = new Date(raw).getTime();
        if (!Number.isNaN(ms) && ms >= latestMs) latestMs = ms;
    }
    return latestMs > 0 ? new Date(latestMs).toISOString() : null;
}

/** Medium sariq chegara (14 kun) dan keyin — narx yangilash kerak */
export function isPriceUpdatePastMediumYellow(isoDate) {
    if (!isoDate) return false;
    const t = new Date(isoDate).getTime();
    if (Number.isNaN(t)) return false;
    return Date.now() - t > PRICE_UPDATE_RULES.medium.yellow * 86400000;
}