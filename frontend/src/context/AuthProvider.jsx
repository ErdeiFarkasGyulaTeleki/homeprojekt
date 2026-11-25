import { useEffect, useState } from "react";
import { setAccessToken } from "../api/api";
import { fetchProfile, loginUser, logoutUser, refreshSession, registerUser } from "../api/authService";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [accessToken, updateAccessToken] = useState(null);
    const [loading, setLoading] = useState(true);

    const storeAccessToken = (token) => {
        updateAccessToken(token);
        setAccessToken(token);
    };

    useEffect(() => {
        const clearSession = () => {
            setUser(null);
            storeAccessToken(null);
        };

        window.addEventListener("auth:unauthorized", clearSession);

        const checkSession = async () => {
            try {
                const session = await refreshSession();
                storeAccessToken(session.accessToken);
                const profile = await fetchProfile();
                setUser(profile);
            } catch {
                clearSession();
            } finally {
                setLoading(false);
            }
        };

        checkSession();

        return () => window.removeEventListener("auth:unauthorized", clearSession);
    }, []);

    const login = async (email, password) => {
        const data = await loginUser(email, password);
        storeAccessToken(data.accessToken);
        setUser(data.user);
    };

    const register = async (name, email, password) => {
        await registerUser(name, email, password);
    };

    const logout = async () => {
        try {
            await logoutUser();
        } finally {
            setUser(null);
            storeAccessToken(null);
        }
    };

    const value = { user, accessToken, loading, login, register, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
