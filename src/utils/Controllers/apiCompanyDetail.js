import { $api } from "../api/axios";
import { BASE_URL } from "../api/axios";
class apiCompanyDetail {
    static Update = async (data, id) => {
        const response = await $api.put(`${BASE_URL}/api/company-details/${id}`, data, { showSuccessToast: `Company successfully updated` })
        return response;
    }
    static Add = async (data) => {
        const response = await $api.post(`${BASE_URL}/api/company-details`, data, { showSuccessToast: `Company successfully updated` })
        return response;
    }
}

export { apiCompanyDetail };