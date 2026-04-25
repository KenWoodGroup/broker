import axios from "axios";
import { $api, BASE_URL } from "../api/axios";

class apiStock {
  static GetStock = async (data = {}) => {
    const params = new URLSearchParams({
      page: data?.page || 1,
      type: "product",
      name: data?.name || "",
      address: data?.address || "all",
    });
    // When factory (zavod) is selected we filter by its id.
    // Backend expects `location_id` query param for filtering.
    if (data?.location_id) {
      params.set("location_id", data.location_id);
    }
    return await $api.get(`${BASE_URL}/api/erp/search?${params.toString()}`);
  };
  static GetByLocationId = async (locationId, page) => {
    const response = await $api.get(
      `/erp/stock/location/${locationId}/page?page=${page}`,
    );
    return response;
  };
  static GetById = async (id) => {
    const response = await $api.get(`/erp/by-id/${id}`);
    return response;
  };

  static UpdateSalePrice = async (saleTypeId, stockId, data) => {
    const response = await $api.put(
      `/erp/stock-sale-type/${saleTypeId}/${stockId}`,
      data,
      {
        showSuccessToast: "Sotuv narxi yangilandi",
      },
    );
    return response;
  };
  static GetByAdress = async (data) => {
    const name = encodeURIComponent(data?.name ?? "");
    const page = data?.page ?? 1;
    const response = await $api.get(
      `/erp/stock/broker?name=${name}&page=${page}`,
    );
    return response;
  };
}

export { apiStock };
