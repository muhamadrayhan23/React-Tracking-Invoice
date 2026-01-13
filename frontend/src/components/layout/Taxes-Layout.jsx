import Sidebar from "../sidebar/Sidebar";

const TaxesLayout = ({ children }) => {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 bg-gray-50">
                {children}
            </main>
        </div>
    );
}
export default TaxesLayout;