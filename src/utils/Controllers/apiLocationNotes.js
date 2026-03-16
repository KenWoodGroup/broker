import { $api } from "../api/axios";
import { BASE_URL } from "../api/axios";
class apiLocationsNote {
    static Post = async (data) => {
        const response = await $api.post(`${BASE_URL}/api/location-notes`, data)
        return response;
    }
    static Get = async (data) => {
        const response = await $api.get(`${BASE_URL}/api/location-notes?location_id=${data.location_id}&page=${data.page}`)
        return response;
    }
}

export { apiLocationsNote };