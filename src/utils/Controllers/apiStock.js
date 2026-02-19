import axios from "axios";
import { BASE_URL } from "../api/axios";

class apiStock {
    static GetStock = async (data) => {
        let url = `${BASE_URL}/api/stock/by-name/product/${data?.name}?page=${data?.page}`;

        // Only add location_id if it exists
        if (data?.location_id) {
            url += `&location_id=${data.location_id}`;
        }

        const response = await axios.get(url);
        return response;
    }
}

export { apiStock };