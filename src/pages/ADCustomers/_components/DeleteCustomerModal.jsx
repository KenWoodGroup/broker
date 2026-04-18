import { useState } from "react";
import { apiLotLocations } from "../../../utils/Controllers/LotLocations";
import ConfirmDelModal from "../../../components/common/ConfirmDelModal";

export default function DeleteCustomerModal({ isOpen, onClose, customer, onDeleted }) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!customer?.id) return;
        try {
            setLoading(true);
            await apiLotLocations.delete(customer.id);
            onDeleted?.();
            onClose?.();
        } finally {
            setLoading(false);
        }
    };

    return (
        <ConfirmDelModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={handleDelete}
            itemName={customer?.name ?? "—"}
            loading={loading}
            typeItem="buyurtmachi"
        />
    );
}
