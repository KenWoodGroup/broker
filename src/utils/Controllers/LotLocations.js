import { $api } from "../api/axios";

class apiLotLocations {
  static searchByName = async (type, name) => {
    const safeName = (name || "").trim();
    const url = safeName
      ? `/locations/by-name/${type}/${encodeURIComponent(safeName)}`
      : `/locations/by-name/${type}`;
    const response = await $api.get(url);
    return response;
  };

  static createCustomer = async (data) => {
    const response = await $api.post(`/locations/customer`, data, {
      showSuccessToast: "Customer created",
    });
    return response;
  };

  static createCompany = async (data) => {
    const response = await $api.post(`/locations`, data, {
      showSuccessToast: "Company created",
    });
    return response;
  };

static pageByType = async ({ type, searchName = "", page = 1, region = "" } = {}) => {
    const t = type || "customer";
    const s = (searchName && searchName !== "all") ? searchName.trim() : "all";
    const a = region || "all"; 

    const url = `/locations/type/${t}/${encodeURIComponent(s)}/page`;

    const response = await $api.get(url, {
        params: {
            page,
            address: a,
        },
    });
    return response;
};
  static getById = async (id) => {
    const response = await $api.get(`/locations/${id}`);
    return response;
  };

  static update = async (id, data) => {
    const response = await $api.put(`/locations/${id}`, data, {
      showSuccessToast: "Updated",
    });
    return response;
  };

  static delete = async (id) => {
    const response = await $api.delete(`/locations/${id}`, {
      showSuccessToast: "Deleted",
    });
    return response;
  };
}

export { apiLotLocations };
