import { getMe } from './authService';

const API_URL = "http://localhost:3000/api/invoice/client";

// Get all invoices for the logged-in client
export const getClientInvoices = async () => {
    const user = getMe();
    const res = await fetch(`${API_URL}/${user.id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Failed to fetch invoices");
    }

    return data;
};

// Get invoice detail for client
export const getClientInvoiceDetail = async (invoiceId) => {
    const user = getMe();
    const res = await fetch(`http://localhost:3000/api/invoice/client/${user.id}/${invoiceId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Failed to fetch invoice detail");
    }

    return data;
};
