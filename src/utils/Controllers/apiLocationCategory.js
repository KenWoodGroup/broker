import { $api } from "../api/axios";
import { BASE_URL } from "../api/axios";
class apiLocationCategories {
    // static pageAll = async (page, searchText) => {
    //     const response = await $api.get(`${BASE_URL}/api/location-categories/name?name=${searchText}&page=${page}`)
    //     return response;
    // }
    // static getFactoriesByCategory = async (id, page, searchText) => {
    //     const response = await $api.get(`${BASE_URL}/api/location-location-categories/category/page?category_id=${id}&name=${searchText}&page=${page}`)
    //     return response;
    // }
    // static getNotFactoriesByCategory = async (id, page, searchText) => {
    //     const response = await $api.get(`${BASE_URL}/api/locations/category/page?category_id=${id}&name=${searchText}&page=${page}`)
    //     return response;
    // }
    static Add = async (data) => {
        const response = await $api.post(`${BASE_URL}/api/location-location-categories`, data, { showSuccessToast: "Successfully joined" })
        return response;
    }
    // static Update = async (data, id) => {
    //     const response = await $api.put(`${BASE_URL}/api/location-categories/${id}`, data, { showSuccessToast: "Category successfully updated" })
    //     return response;
    // }
    static Delete = async (id) => {
        const response = await $api.delete(`${BASE_URL}/api/location-location-categories/${id}`, { showSuccessToast: "Successfully removed"})
        return response;
    }
}

export { apiLocationCategories };