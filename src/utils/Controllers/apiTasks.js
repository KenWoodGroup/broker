import { $api } from "../api/axios";

class apiTasks {
    static create = async (data) => {
        const response = await $api.post(`/tasks`, data);
        return response;
    };

    /**
     * GET /api/tasks — admin ro‘yxati (barcha vazifalar)
     */
    static getPage = async ({
        status = "all",
        type = "all",
        page = 1,
        limit = 20,
    } = {}) => {
        const response = await $api.get(`/tasks`, {
            params: { status, type, page, limit },
        });
        return response;
    };

    /**
     * PUT /api/tasks/{id}
     */
    static update = async (id, data) => {
        const safeId = encodeURIComponent(String(id).trim());
        const response = await $api.put(`/tasks/${safeId}`, data);
        return response;
    };

    /**
     * DELETE /api/tasks/{id}
     */
    static remove = async (id) => {
        const safeId = encodeURIComponent(String(id).trim());
        const response = await $api.delete(`/tasks/${safeId}`);
        return response;
    };

    /**
     * GET /api/tasks/created-by/{created_by}
     * Query: status, type, page, limit (use "all" where applicable)
     */
    static getByCreatedBy = async (
        createdBy,
        { status = "all", type = "all", page = 1, limit = 20 } = {}
    ) => {
        const id = encodeURIComponent(String(createdBy).trim());
        const response = await $api.get(`/tasks/created-by/${id}`, {
            params: { status, type, page, limit },
        });
        return response;
    };
}

export { apiTasks };
