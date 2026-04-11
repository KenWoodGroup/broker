import { $api } from "../api/axios";
import { BASE_URL } from "../api/axios";
class apiTaskPrice {
  static getAll = async (
    assignee,
    assignee_type,
    status,
    type,
    page,
    limit,
  ) => {
    const response = await $api.get(
      `${BASE_URL}/api/tasks/assignee/${assignee}?assignee_type=${assignee_type}&status=${status}&type=${type}&page=${page}&limit=${limit}`,
    );
    return response;
  };
  static getById = async (id) => {
    const response = await $api.get(`${BASE_URL}/api/tasks/${id}`);
    return response;
  };
  static updateStatus = async (id, data) => {
    const response = await $api.put(`${BASE_URL}/api/tasks/${id}/status`, data);
    return response;
  };

  // static Add = async (data) => {
  //     const response = await $api.post(`${BASE_URL}/api/user`, data, { showSuccessToast: "Opsiya successfully created" })
  //     return response;
  // }
  // static Update = async (data, id) => {
  //     const response = await $api.put(`${BASE_URL}/api/user/${id}`, data, { showSuccessToast: "Opsiya successfully updated" })
  //     return response;
  // }
  // static Delete = async (id) => {
  //     const response = await $api.delete(`${BASE_URL}/api/user/${id}`, { showSuccessToast: "User successfully deleted" })
  //     return response;
  // }
}

export { apiTaskPrice };
