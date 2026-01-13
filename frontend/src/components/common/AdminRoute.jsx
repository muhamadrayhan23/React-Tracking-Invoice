import { Navigate } from "react-router";

const AdminRoute = ({ children }) => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!isLoggedIn || !user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== "admin") {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default AdminRoute;
