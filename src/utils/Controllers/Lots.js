import { $api } from "../api/axios";

class apiLots {
    static getAll = async (page) => {
        const params = {};
        if (page) params.page = page;
        const response = await $api.get(`/lots`, { params });
        return response;
    };
    static GetByParent = async (id) => {
        const response = await $api.get(`/lots/name?parent_id=${id}`);
        return response;
    };
    static GetLotsByParent = async (id, page = 1) => {
        const response = await $api.get(`/lots?parent_id=${id}&page=${page}`);
        return response;
    };

    static filter = async ({ type, category, searchName, page, address } = {}) => {
        const params = {};
        if (type) params.type = type;
        if (category) params.category = category;
        if (searchName) params.searchName = searchName;
        if (page) params.page = page;
        if (address) params.address = address;

        const response = await $api.get(`/lots/filter`, { params });
        return response;
    };

    static create = async (data) => {
        const response = await $api.post(`/lots`, data, { showSuccessToast: "Lot created" });
        return response;
    };
    static createExel = async (data) => {
        const response = await $api.post(`/lots/upload-excel`, data, { showSuccessToast: "Lot created" });
        return response;
    };

    static getById = async (id) => {
        const response = await $api.get(`/lots/${id}`);
        return response;
    };

    static update = async (id, data) => {
        const response = await $api.put(`/lots/${id}`, data, { showSuccessToast: "Lot updated" });
        return response;
    };

    static delete = async (id) => {
        const response = await $api.delete(`/lots/${id}`, { showSuccessToast: "Lot deleted" });
        return response;
    };
}

export { apiLots };

