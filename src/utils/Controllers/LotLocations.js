import { $api } from "../api/axios";

class apiLotLocations {
    static searchByName = async (type, name) => {
        const safeName = (name || "").trim();
        // if name omitted, backend expects only type
        const url = safeName
            ? `/locations/by-name/${type}/${encodeURIComponent(safeName)}`
            : `/locations/by-name/${type}`;
        const response = await $api.get(url);
        return response;
    };

    static createCustomer = async (data) => {
        const response = await $api.post(`/locations/customer`, data, { showSuccessToast: "Customer created" });
        return response;
    };

    static pageByType = async ({ type, searchName = "all", page = 1 } = {}) => {
        const t = type || "customer";
        const s = (searchName ?? "all").toString().trim() || "all";
        const response = await $api.get(`/locations/type/${t}/${encodeURIComponent(s)}/page`, {
            params: { page },
        });
        return response;
    };

    static getById = async (id) => {
        const response = await $api.get(`/locations/${id}`);
        return response;
    };

    static update = async (id, data) => {
        const response = await $api.put(`/locations/${id}`, data, { showSuccessToast: "Updated" });
        return response;
    };

    static delete = async (id) => {
        const response = await $api.delete(`/locations/${id}`, { showSuccessToast: "Deleted" });
        return response;
    };
}

export { apiLotLocations };

