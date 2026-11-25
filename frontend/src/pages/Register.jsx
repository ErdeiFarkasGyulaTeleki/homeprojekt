import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
    const [error, setError] = useState("");

    const handleChange = (event) => {
        setForm({ ...form, [event.target.name]: event.target.value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (!form.name.trim() || !form.email.trim() || !form.password) {
            setError("Minden mező kitöltése kötelező.");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            setError("Adj meg érvényes email címet.");
            return;
        }
        if (form.password.length < 8) {
            setError("A jelszónak legalább 8 karakter hosszúnak kell lennie.");
            return;
        }
        if (form.password !== form.confirmPassword) {
            setError("A két jelszó nem egyezik.");
            return;
        }

        try {
            await register(form.name.trim(), form.email.trim(), form.password);
            navigate("/login");
        } catch (requestError) {
            setError(requestError.response?.data?.message || "A regisztráció nem sikerült.");
        }
    };

    return (
        <section className="auth-card">
            <h1>Regisztráció</h1>
            {error && (
                <div className="error" role="alert">
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <label htmlFor="name">Név</label>
                <input id="name" name="name" value={form.name} onChange={handleChange} />
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
                <label htmlFor="password">Jelszó</label>
                <input id="password" name="password" type="password" value={form.password} onChange={handleChange} />
                <label htmlFor="confirmPassword">Jelszó újra</label>
                <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                />
                <button type="submit">Regisztráció</button>
            </form>
        </section>
    );
}
