import { $api } from "../api/axios";
import { BASE_URL } from "../api/axios";
class apiOfferItems {
    static Post = async () => {
        const response = await $api.get(`${BASE_URL}/api/offer-items`)
        return response;
    }
    static PostVariants = async (data) => {
        const response = await $api.post(`${BASE_URL}/api/offer-items/variants`, data)
        return response;
    }
    static getByUser = async (status, page, limit) => {
        const response = await $api.get(`${BASE_URL}/api/offer-items/supplier?status=${status}&page=${page}&limit=${limit}`)
        return response;
    }
    static getById = async (id) => {
        const response = await $api.get(`${BASE_URL}/api/offer-items/bu-id/${id}`)
        return response;
    }
    static updateStatus = async (id, data) => {
        const response = await $api.put(`${BASE_URL}/api/offer-items/status/${id}`, data)
        return response;
    }
}

export { apiOfferItems };