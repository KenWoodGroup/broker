import { $api } from "../api/axios";
import { BASE_URL } from "../api/axios";
class apiLocations {
    static pageAll = async (page, searchText, locType) => {
        const response = await $api.get(`${BASE_URL}/api/locations/type/${locType}/${searchText}/page?page=${page}`)
        return response;
    }
    static getLocation = async (id)=> {
        const response = await $api.get(`${BASE_URL}/api/locations/${id}`);
        return response
    }
    static Add = async (data, locType) => {
        const response = await $api.post(`${BASE_URL}/api/locations`, data, { showSuccessToast: `${locType} successfully created` })
        return response;
    }
    static Update = async (data, id, locType) => {
        const response = await $api.put(`${BASE_URL}/api/locations/${id}`, data, { showSuccessToast: `${locType} successfully updated` })
        return response;
    }
    static Delete = async (id, locType) => {
        const response = await $api.delete(`${BASE_URL}/api/locations/${id}`, { showSuccessToast: `${locType} successfully deleted` })
        return response;
    }
}

export { apiLocations };