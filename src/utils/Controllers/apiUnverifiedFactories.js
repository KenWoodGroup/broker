import { $api } from "../api/axios";

const BASE = "/unverified-factories";

function idPath(id) {
    const enc = encodeURIComponent(String(id ?? "").trim());
    return `${BASE}/${enc}`;
}

/** API xabarini toast uchun bir xil matnga aylantiradi */
export function formatUnverifiedFactoriesError(err) {
    const d = err?.response?.data;
    const m = d?.message;
    if (Array.isArray(m)) return m.filter(Boolean).join(". ");
    if (typeof m === "string" && m.trim()) return m.trim();
    if (d?.errors && typeof d.errors === "object") {
        const parts = Object.values(d.errors)
            .flat()
            .filter((x) => x != null && String(x).trim() !== "");
        if (parts.length) return parts.join(". ");
    }
    return null;
}

export const apiUnverifiedFactories = {
    list: (params,role) => $api.get(BASE, { params }),

    create: (body) => $api.post(BASE, body),

    update: (id, body) => $api.patch(idPath(id), body),

    updateStatus: (id, body) => $api.patch(`${idPath(id)}/status`, body),

    reject: (id, body) => $api.patch(`${idPath(id)}/reject`, body),

    delete: (id) => $api.delete(idPath(id)),

    checkErp: (id) => $api.get(`${idPath(id)}/check-erp`),
};
