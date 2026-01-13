import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 10,
        fontFamily: "Helvetica"
    },

    /* HEADER */
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20
    },
    title: {
        fontSize: 18,
        fontWeight: "bold"
    },
    invoiceNumber: {
        fontSize: 10,
        color: "#6b7280"
    },
    status: {
        fontSize: 14,
        fontWeight: "bold"
    },

    /* COMPANY & CLIENT */
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20
    },
    company: {
        width: "45%"
    },
    client: {
        width: "45%",
        textAlign: "right"
    },
    companyName: {
        fontWeight: "bold",
        color: "#2563eb",
        marginBottom: 4
    },

    /* DATES */
    dates: {
        marginBottom: 20
    },
    dateRow: {
        marginBottom: 4
    },

    /* TABLE */
    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#000",
        color: "#fff",
        padding: 6
    },
    row: {
        flexDirection: "row",
        padding: 6,
        borderBottom: "1 solid #e5e7eb"
    },
    colItem: { flex: 3 },
    colQty: { flex: 1, textAlign: "center" },
    colPrice: { flex: 1, textAlign: "right" },
    colTax: { flex: 1, textAlign: "center" },
    colTotal: { flex: 1, textAlign: "right" },

    /* SUMMARY */
    summary: {
        marginTop: 20,
        alignItems: "flex-end"
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: 200,
        marginBottom: 4
    },
    summaryBold: {
        fontWeight: "bold"
    }
});

const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
};

const formatCurrency = (value) =>
    `Rp ${Number(value).toLocaleString("id-ID")}`;

const getStatusStyle = (status) => {
    switch (status) {
        case 'Draft':
            return { color: '#6b7280' };
        case 'Issued':
            return { color: '#eab308' };
        case 'Partially Paid':
            return { color: '#3b82f6' };
        case 'Paid':
            return { color: '#22c55e' };
        case 'Overdue':
            return { color: '#ef4444' };
        default:
            return { color: '#6b7280' };
    }
};

const InvoicePDF = ({ invoice, items }) => (
    <Document>
        <Page size="A4" style={styles.page}>

            {/* HEADER */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Invoice</Text>
                    <Text style={styles.invoiceNumber}>
                        {invoice.invoice_number}
                    </Text>
                </View>
                <Text style={[styles.status, getStatusStyle(invoice.status)]}>{invoice.status}</Text>
            </View>

            {/* COMPANY & CLIENT */}
            <View style={styles.infoRow}>
                <View style={styles.company}>
                    <Text style={styles.companyName}>
                        PT Bandung Teknologi Semesta
                    </Text>
                    <Text>
                        Jl. Nata Kusumah VII, RT.01/RW.07,
                        Kabupaten Bandung, Jawa Barat 40225
                    </Text>
                </View>

                <View style={styles.client}>
                    <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
                        Invoice To
                    </Text>
                    <Text>{invoice.company_name}</Text>
                    <Text>{invoice.address}</Text>
                </View>
            </View>

            {/* DATES */}
            <View style={styles.dates}>
                <Text style={styles.dateRow}>
                    <Text style={{ fontWeight: "bold" }}>Project:</Text>{" "}
                    {invoice.project_title}
                </Text>
                <Text style={styles.dateRow}>
                    <Text style={{ fontWeight: "bold" }}>Invoice Date:</Text>{" "}
                    {formatDate(invoice.issue_date)}
                </Text>
                <Text style={styles.dateRow}>
                    <Text style={{ fontWeight: "bold" }}>Due Date:</Text>{" "}
                    {formatDate(invoice.due_date)}
                </Text>
            </View>

            {/* TABLE HEADER */}
            <View style={styles.tableHeader}>
                <Text style={styles.colItem}>Item Detail</Text>
                <Text style={styles.colQty}>Qty</Text>
                <Text style={styles.colPrice}>Price</Text>
                <Text style={styles.colTax}>Tax</Text>
                <Text style={styles.colTotal}>Total</Text>
            </View>

            {/* TABLE ROW */}
            {items.map((item, i) => {
                const baseTotal = Number(item.price) * Number(item.qty);
                const taxAmount =
                    baseTotal * (Number(item.tax_rate || 0) / 100);
                const grandTotal = baseTotal + taxAmount;

                return (
                    <View key={i} style={styles.row}>
                        <Text style={styles.colItem}>{item.description}</Text>
                        <Text style={styles.colQty}>{item.qty}</Text>
                        <Text style={styles.colPrice}>
                            {formatCurrency(item.price)}
                        </Text>
                        <Text style={styles.colTax}>
                            {item.tax_rate || 0}%
                        </Text>
                        <Text style={styles.colTotal}>
                            {formatCurrency(grandTotal)}
                        </Text>
                    </View>
                );
            })}

            {/* SUMMARY */}
            <View style={styles.summary}>
                <View style={styles.summaryRow}>
                    <Text>Subtotal</Text>
                    <Text>{formatCurrency(invoice.subtotal)}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text>Tax</Text>
                    <Text>- {formatCurrency(invoice.tax)}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text>Discount</Text>
                    <Text>- {formatCurrency(invoice.discount)}</Text>
                </View>
                <View style={[styles.summaryRow, styles.summaryBold]}>
                    <Text>Total</Text>
                    <Text>{formatCurrency(invoice.total)}</Text>
                </View>
            </View>

        </Page>
    </Document>
);

export default InvoicePDF;
