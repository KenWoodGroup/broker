import { $api } from "../api/axios";

class apiInvoices {
  static CreateInvoice = async (data) => {
    const response = await $api.post(`/erp/invoices`, data);
    return response;
  };

  static UploadExel = async (id, data) => {
    const response = await $api.post(`/erp/invoice-items/upload/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  };
  static UploadExelMaterial = async (id, data) => {
    const response = await $api.post(`/invoice-items/upload/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  };
  
  static UploadSalePriceExcel = async (warehouseId, data) => {
  const response = await $api.post(`/erp/stock-sale-type/upload-excel?warehouse_id=${warehouseId}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response;
};
}
export { apiInvoices };
