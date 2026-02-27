import { $api } from "../api/axios";

class apiInvoices {
    static CreateInvoice = async (data) => {
        const response = await $api.post(`/invoices`, data)
        return response;
    }

    static UploadExel = async (id, data) => {
        const response = await $api.post(`/invoice-items/upload/${id}`, data,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            }
        )
        return response
    }
    static UploadExelMaterial = async (id, data) => {
        const response = await $api.post(`/invoice-items/upload/${id}`, data,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            }
        )
        return response;
    }

}
export { apiInvoices }