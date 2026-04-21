import axios from "axios";
import { $api, BASE_URL } from "../api/axios";

class apiStock {
  static GetStock = async (data) => {
    let url = `/erp/stock/broker?address=1&name=${data?.name}&page=${data?.page}`;

    if (data?.location_id) {
      url += `&location_id=${data.location_id}`;
    }

    const response = await $api.get(url);
    return response;
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
