import { $api } from "../api/axios";
import { BASE_URL } from "../api/axios";
class apiOptions {
    static getAll = async () => {
        const response = await $api.get(`${BASE_URL}/api/options`)
        return response;
    }
    static getLocalOptions = async (id) => {
        const response = await $api.get(`${BASE_URL}/api/location-options/all/${id}`)
        return response;
    }
    // static getFactoriesByCategory = async (id, page, searchText) => {
    //     const response = await $api.get(`${BASE_URL}/api/location-location-categories/category/page?category_id=${id}&name=${searchText}&page=${page}`)
    //     return response;
    // }
    static addLocalOption = async (data) => {
        const response = await $api.post(`${BASE_URL}/api/location-options`, data, { showSuccessToast: "Option successfully activated" })
        return response;
    }
    // static Update = async (data, id) => {
    //     const response = await $api.put(`${BASE_URL}/api/location-categories/${id}`, data, { showSuccessToast: "Category successfully updated" })
    //     return response;
    // }
    static Delete = async (id) => {
        const response = await $api.delete(`${BASE_URL}/api/location-options/${id}`, { showSuccessToast: "Option successfully deleted" })
        return response;
    }
}

export { apiOptions };