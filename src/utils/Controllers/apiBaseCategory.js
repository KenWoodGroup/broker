import { $api, BASE_URL } from "../api/axios";
 
class apiBaseCategory {

 
  static getPage = async ({ searchTerm = "", page = 1, limit = 100 } = {}) => {
    const response = await $api.get(`${BASE_URL}/api/categories/page`, {
      params: { searchTerm, page, limit },
    });
    return response;
  };
 
  static create = async (data) => {
    const response = await $api.post(`${BASE_URL}/api/categories`, data, {
      showSuccessToast: "Kategoriya qo'shildi",
    });
    return response;
  };
 
  static update = async (id, data) => {
    const response = await $api.put(`${BASE_URL}/api/categories/${id}`, data, {
      showSuccessToast: "Kategoriya yangilandi",
    });
    return response;
  };
 
  static delete = async (id) => {
    const response = await $api.delete(`${BASE_URL}/api/categories/${id}`, {
      showSuccessToast: "Kategoriya o'chirildi",
    });
    return response;
  };
 
  
 
  static getProducts = async ({
    searchTerm = "",
    category_id = "",
    page = 1,
    limit = 20,
  } = {}) => {
    const response = await $api.get(`${BASE_URL}/api/products/page`, {
      params: { searchTerm, category_id, page, limit },
    });
    return response;
  };
 
  static createProduct = async (data) => {
    const response = await $api.post(`${BASE_URL}/api/products`, data, {
      showSuccessToast: "Mahsulot qo'shildi",
    });
    return response;
  };
 
  static updateProduct = async (id, data) => {
    const response = await $api.put(`${BASE_URL}/api/products/${id}`, data, {
      showSuccessToast: "Mahsulot yangilandi",
    });
    return response;
  };
 
  static deleteProduct = async (id) => {
    const response = await $api.delete(`${BASE_URL}/api/products/${id}`, {
      showSuccessToast: "Mahsulot o'chirildi",
    });
    return response;
  };
}
 
export { apiBaseCategory };
 