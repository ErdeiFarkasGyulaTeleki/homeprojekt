import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function PublicOnlyRoute() {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="status">Betöltés...</div>;
    }

    return user ? <Navigate to="/profil" replace /> : <Outlet />;
}
