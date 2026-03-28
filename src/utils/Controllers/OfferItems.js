import { $api } from "../api/axios";
import { BASE_URL } from "../api/axios";
class apiOfferItems {
    static Post = async () => {
        const response = await $api.get(`${BASE_URL}/api/offer-items`)
        return response;
    }
}

export { apiOfferItems };