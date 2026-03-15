import { $api, BASE_URL } from "../api/axios";

class apiStatistics {
    static GetSystemData = async () => {
        const response = await $api.get(`/statistics/admin`)
        return response;
    }
}

export { apiStatistics };