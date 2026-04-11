import { $api, BASE_URL } from "../api/axios";

class apiTasks {
    static create = async (data) => {
        const response = await $api.post(`${BASE_URL}/api/tasks`, data);
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
