import { getMe } from './authService';

const API_URL = "http://localhost:3000/api/quotation/client";

// Get all quotations for the logged-in client
export const getClientQuotations = async () => {
    const user = getMe();
    const res = await fetch(`${API_URL}/${user.id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Failed to fetch quotations");
    }

    return data;
};

// Approve quotation
export const approveQuotation = async (quotationId) => {
    const res = await fetch(`http://localhost:3000/api/quotations/${quotationId}/approve`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        }
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Failed to approve quotation");
    }

    return data;
};

// Reject quotation
export const rejectQuotation = async (quotationId) => {
    const res = await fetch(`http://localhost:3000/api/quotations/${quotationId}/reject`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        }
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Failed to reject quotation");
    }

    return data;
};

// Get quotation detail for client
export const getClientQuotationDetail = async (quotationId) => {
    const user = getMe();
    const res = await fetch(`http://localhost:3000/api/quotation/client/${user.id}/${quotationId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Failed to fetch quotation detail");
    }

    return data;
};
