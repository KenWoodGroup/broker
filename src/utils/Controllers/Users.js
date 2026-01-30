import { $api } from "../api/axios";
import { BASE_URL } from "../api/axios";
class apiUsers {
    static All = async () => {
        const response = await $api.get(`${BASE_URL}/api/user`)
        return response;
    }
    static getBrokers = async ()=> {
        const response = await $api.get(`${BASE_URL}/api/user/broker`);
        return response;
    }
    static Add = async (data) => {
        const response = await $api.post(`${BASE_URL}/api/user`, data, { showSuccessToast: "User successfully created" })
        return response;
    }
    static Update = async (data, id) => {
        const response = await $api.put(`${BASE_URL}/api/user/${id}`, data, { showSuccessToast: "User successfully updated" })
        return response;
    }
    static Delete = async (id) => {
        const response = await $api.delete(`${BASE_URL}/api/user/${id}`, { showSuccessToast: "User successfully deleted" })
        return response;
    }
    static ResetPassword = async (id, data) => {
        const response = await $api.post(`${BASE_URL}/api/user/reset-password/${id}`, data, { showSuccessToast: "Password successfully changed" });
        return response
    }
}

export { apiUsers };