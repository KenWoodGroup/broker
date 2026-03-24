import { $api } from "../api/axios";
import { BASE_URL } from "../api/axios";
class apiLocationUsers {
    static getAll = async (id) => {
        const response = await $api.get(`${BASE_URL}/api/user/locationId/${id}`)
        return response;
    }
    static Add = async (data) => {
        const response = await $api.post(`${BASE_URL}/api/user`, data, { showSuccessToast: "Opsiya successfully created" })
        return response;
    }
    static Update = async (data, id) => {
        const response = await $api.put(`${BASE_URL}/api/user/${id}`, data, { showSuccessToast: "Opsiya successfully updated" })
        return response;
    }
    static Delete = async (id) => {
        const response = await $api.delete(`${BASE_URL}/api/user/${id}`, { showSuccessToast: "User successfully deleted" })
        return response;
    }
}

export { apiLocationUsers };