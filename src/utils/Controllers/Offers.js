import { $api } from "../api/axios";
import { BASE_URL } from "../api/axios";
class apiOffers {
    static getPage = async (page, status) => {
        const response = await $api.get(`${BASE_URL}/api/offers/page?status=${status}&page=${page}`)
        return response;
    }
    static getOffer = async (id) => {
        const response = await $api.get(`${BASE_URL}/api/offers/${id}`);
        return response
    }
    static getOffersByLocationId = async (data) => {
        const response = await $api.get(`${BASE_URL}/api/offers/location?location_id=${data?.location_id}&page=${data?.page}&limit=20`);
        return response
    }
    static CreateOffer = async (data) => {
        const response = await $api.post(`${BASE_URL}/api/offers`, data)
        return response;
    }
    // static Add = async (data) => {
    //     const response = await $api.post(`${BASE_URL}/api/user`, data, {showSuccessToast:"Manager successfully created"})
    //     return response;
    // }
    static UpdateStatus = async (data, id) => {
        const response = await $api.put(`${BASE_URL}/api/offers/status/${id}`, data, { showSuccessToast: "Offer in procces" })
        return response;
    }
    // static Delete = async (id) => {
    //     const response = await $api.delete(`${BASE_URL}/api/user/${id}`, {showSuccessToast:"Manager successfully deleted"})
    //     return response;
    // }
}

export { apiOffers };