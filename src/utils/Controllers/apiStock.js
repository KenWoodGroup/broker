import axios from "axios";
import { $api, BASE_URL } from "../api/axios";

class apiStock {
    static GetStock = async (data) => {
        let url = `/erp/stock/by-name?type=product&searchTerm=${data?.name}&page=${data?.page}`;

        if (data?.location_id) {
            url += `&location_id=${data.location_id}`;
        }

        const response = await $api.get(url);
        return response;
    }
    static GetByLocationId = async (locationId, page) => {
        const response = await $api.get(`/stock/location/${locationId}/page?page=${page}`)
        return response;
    }
}

export { apiStock };