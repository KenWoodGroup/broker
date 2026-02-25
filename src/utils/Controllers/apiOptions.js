import { $api } from "../api/axios";
import { BASE_URL } from "../api/axios";
class apiOptions {
    static getAll = async () => {
        const response = await $api.get(`${BASE_URL}/api/options`)
        return response;
    }
    // static getPage = async () => {
    //     const response = await $api.get(`${BASE_URL}/api/options`)
    //     return response;
    // }
    static getLocalOptions = async (id) => {
        const response = await $api.get(`${BASE_URL}/api/location-options/all/${id}`)
        return response;
    }
    static addLocalOption = async (data) => {
        const response = await $api.post(`${BASE_URL}/api/location-options`, data, { showSuccessToast: "Opsiya successfully activated" })
        return response;
    }
    static Add = async (data ) => {
        const response = await $api.post(`${BASE_URL}/api/options`, data, { showSuccessToast: "Opsiya successfully created" })
        return response;
    }
    static Update = async (data, id) => {
        const response = await $api.put(`${BASE_URL}/api/options/${id}`, data, { showSuccessToast: "Opsiya successfully updated" })
        return response;
    }
    static Delete = async (id) => {
        const response = await $api.delete(`${BASE_URL}/api/location-options/${id}`, { showSuccessToast: "Opsiya successfully deleted" })
        return response;
    }
    static DeleteOption = async (id) => {
        const response = await $api.delete(`${BASE_URL}/api/options/${id}`, { showSuccessToast: "Opsiya successfully deleted" })
        return response;
    }
}

export { apiOptions };