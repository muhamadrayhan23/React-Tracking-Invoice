const API_URL = "http://localhost:3000/api/invoices";

// Pay invoice term
export const payInvoiceTerm = async (invoiceId, termNumber, nominal) => {
    const res = await fetch(`${API_URL}/${invoiceId}/pay-term`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            term_number: termNumber,
            nominal: nominal
        })
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Failed to pay term");
    }

    return data;
};
