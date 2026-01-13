import { Navigate } from "react-router";

const ClientRoute = ({ children }) => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!isLoggedIn || !user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== "client") {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default ClientRoute;
