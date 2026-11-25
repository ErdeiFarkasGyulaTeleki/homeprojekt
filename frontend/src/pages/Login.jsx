import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");

    const handleChange = (event) => {
        setForm({ ...form, [event.target.name]: event.target.value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        if (!form.email.trim() || !form.password) {
            setError("Email és jelszó megadása kötelező.");
            return;
        }

        try {
            await login(form.email.trim(), form.password);
            navigate("/profil");
        } catch (requestError) {
            setError(requestError.response?.data?.message || "A bejelentkezés nem sikerült.");
        }
    };

    return (
        <section className="auth-card">
            <h1>Bejelentkezés</h1>

            {error && (
                <div className="error" role="alert">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
                <label htmlFor="password">Jelszó</label>
                <input id="password" name="password" type="password" value={form.password} onChange={handleChange} />
                <button type="submit">Bejelentkezés</button>
            </form>
        </section>
    );
}
