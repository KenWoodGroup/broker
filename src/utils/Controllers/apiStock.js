import axios from "axios";
import { $api, BASE_URL } from "../api/axios";

class apiStock {
  static GetStock = async (data = {}) => {
    const params = new URLSearchParams({
      page: data?.page || 1,
      name: data?.name || "",
      address: data?.address || "all",
      ...(data?.locationId && {location_id: data?.locationId}),
      type: "product",
    });
   
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

  static GetByCategory = async (
    locationId,
    categoryId,
    productType = "product",
    page = 1,
  ) => {
    const safeType = productType || "product";
    try {
      // Some environments expose this endpoint without "stock" segment
      return await $api.get(
        `/erp/by-category/${locationId}/${categoryId}/${safeType}/page?page=${page}`,
      );
    } catch (e) {
      // Fallback for backends that expose it under /erp/stock/by-category/...
      if (e?.response?.status === 404) {
        return await $api.get(
          `/erp/stock/by-category/${locationId}/${categoryId}/${safeType}/page?page=${page}`,
        );
      }
      throw e;
    }
  };
}

export { apiStock };
