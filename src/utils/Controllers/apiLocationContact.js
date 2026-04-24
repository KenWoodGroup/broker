import { $api } from "../api/axios";
import { BASE_URL } from "../api/axios";
class apiLocationContact {
    static Create = async (data) => {
        const response = await $api.post(`${BASE_URL}/api/location-contacts`, data)
        return response;
    }
    static GetAll = async (id, page) => {
        const response = await $api.get(`${BASE_URL}/api/location-contacts?locationId=${id}&page=${page}&limit=20`)
        return response;
    }
    static Delete = async (id) => {
        const response = await $api.delete(`${BASE_URL}/api/location-contacts/${id}`)
        return response;
    }
    static Edit = async (id, data) => {
        const response = await $api.put(`${BASE_URL}/api/location-contacts/${id}`, data)
        return response;
    }

}

export { apiLocationContact };