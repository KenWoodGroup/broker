import { $api } from "../api/axios";
import { BASE_URL } from "../api/axios";
class apiRequests {
    static getPage = async (page, name, address) => {
        const response = await $api.get(`${BASE_URL}/api/requests/page?page=${page}&name=${name}${address ? `&address=${address}` : ''}`)
        return response;
    }
    // static Add = async (data) => {
    //     const response = await $api.post(`${BASE_URL}/api/user`, data, {showSuccessToast:"Manager successfully created"})
    //     return response;
    // }
    // static Update = async (data, id) => {
    //     const response = await $api.put(`${BASE_URL}/api/user/${id}`, data, {showSuccessToast:"Manager successfully updated"})
    //     return response;
    // }
    // static Delete = async (id) => {
    //     const response = await $api.delete(`${BASE_URL}/api/user/${id}`, {showSuccessToast:"Manager successfully deleted"})
    //     return response;
    // }
}

export { apiRequests};