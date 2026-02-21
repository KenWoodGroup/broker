import { $api } from "../api/axios";
import { BASE_URL } from "../api/axios";
class apiLocations {
    static pageAll = async (page, searchText, locType) => {
        const response = await $api.get(`${BASE_URL}/api/locations/type/${locType}/${searchText}/page?page=${page}`)
        return response;
    }
    static GetBySearchForOperator = async (page, searchText) => {
        const response = await $api.get(`${BASE_URL}/api/locations/operator/${searchText}/page?page=${page}`)
        return response;
    }
    static getLocation = async (id) => {
        const response = await $api.get(`${BASE_URL}/api/locations/${id}`);
        return response
    }
    static Add = async (data, locType) => {
        const response = await $api.post(`${BASE_URL}/api/locations`, data, { showSuccessToast: `${locType} successfully created` })
        return response;
    }
    static CreateByExcell = async (file, locType) => {
        const response = await $api.post(`${BASE_URL}/api/locations/upload-building/${locType}`, file, { showSuccessToast: `${locType} successfully created` })
        return response;
    }
    static AddWeb = async (data) => {
        const response = await $api.post(`${BASE_URL}/api/locations/web`, data, { showSuccessToast: `successfully created` })
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
    static SearchByName = async (name) => {
        const response = await $api.get(`${BASE_URL}/api/locations/by-name/factory/${name}`,)
        return response;
    }


}

export { apiLocations };