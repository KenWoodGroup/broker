import { $api } from "../api/axios";
import { BASE_URL } from "../api/axios";
class apiUsers {
    static All = async () => {
        const response = await $api.get(`${BASE_URL}/api/erp/user`)
        return response;
    }
    static getFactoryUsers = async (facId) => {
        const response = await $api.get(`${BASE_URL}/api/erp/user/factory-user/${facId}`)
        return response;
    }
    static getBrokers = async () => {
        const response = await $api.get(`${BASE_URL}/api/user/broker`);
        return response;
    }
    static getOperator = async (page) => {
        const response = await $api.get(`${BASE_URL}/api/user/operator?page=${page}`);
        return response;
    }
    static getSuppliers = async (page)=> {
        const response = await $api.get(`${BASE_URL}/api/user/supplier?page=${page}`);
        return response;
    }
    static GetUserRole = async (role)=> {
        const response = await $api.get(`${BASE_URL}/api/user/all?role=${role}`);
        return response;
    }
    static getLotCreators = async (page) => {
        try {
            const response = await $api.get(`${BASE_URL}/api/user/lot-creator?page=${page}`);
            return response;
        } catch (error) {
            // some backends use dashed role names in routes
            if (error?.response?.status === 404) {
                const response = await $api.get(`${BASE_URL}/api/user/lot-creator?page=${page}`);
                return response;
            }
            throw error;
        }
    }
    static Add = async (data) => {
        const response = await $api.post(`${BASE_URL}/api/erp/user`, data, { showSuccessToast: "User successfully created" })
        return response;
    }
    static CreateOperator = async (data) => {
        const response = await $api.post(`${BASE_URL}/api/user`, data, { showSuccessToast: "User successfully created" })
        return response;
    }
    // static CreateSupplier = async (data) => {
    //     const response = await $api.post(`${BASE_URL}/api/user`, data, { showSuccessToast: "User successfully created" })
    //     return response;
    // }
    static Update = async (data, id) => {
        const response = await $api.put(`${BASE_URL}/api/erp/user/${id}`, data, { showSuccessToast: "User successfully updated" })
        return response;
    }
    static UpdateOperator = async (data, id) => {
        const response = await $api.put(`${BASE_URL}/api/user/${id}`, data, { showSuccessToast: "User successfully updated" })
        return response;
    }
    static Delete = async (id) => {
        const response = await $api.delete(`${BASE_URL}/api/erp/user/${id}`, { showSuccessToast: "User successfully deleted" })
        return response;
    }
    static ResetPassword = async (id, data) => {
        const response = await $api.post(`${BASE_URL}/api/user/reset-password/${id}`, data, { showSuccessToast: "Password successfully changed" });
        return response
    }
}

export { apiUsers };