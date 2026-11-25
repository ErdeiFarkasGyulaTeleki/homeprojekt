import { NavLink, Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function Layout() {
    const { user, logout, loading } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <div className="app-shell">
            <header className="navbar">
                <NavLink className="brand" to="/">
                    HOMEPROJEKT
                </NavLink>
                {!loading && (
                    <nav>
                        <NavLink to="/">Főoldal</NavLink>
                        {user ? (
                            <>
                                <NavLink to="/profil">Profil</NavLink>
                                <button className="nav-button" type="button" onClick={handleLogout}>
                                    Kijelentkezés
                                </button>
                            </>
                        ) : (
                            <>
                                <NavLink to="/reg">Regisztráció</NavLink>
                                <NavLink to="/login">Bejelentkezés</NavLink>
                            </>
                        )}
                    </nav>
                )}
            </header>
            <main className="main-content">
                <Outlet />
            </main>
            <footer>
                <span>HOMEPROJEKT!!!</span>
                <span>Erdei Farkas Gyula - {new Date().getFullYear()}</span>
            </footer>
        </div>
    );
}
