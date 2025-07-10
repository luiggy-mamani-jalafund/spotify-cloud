"use client";
import { useState } from "react";
import { useFirebaseUser } from "@/hooks/useFirebaseUser";
import "@/styles/components/auth.css";
import Google from "@/icons/Google";
import Spotify from "@/icons/Spotify";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { loginWithFirebase, loginWithGoogle, userLoading } =
        useFirebaseUser();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            await loginWithFirebase(email, password);
        } catch (err) {
            setError("Wrong credentials, please check again");
        }
    };

    const handleGoogleLogin = async () => {
        setError("");
        try {
            await loginWithGoogle();
        } catch (err) {
            setError("Something bad happend, try again please");
        }
    };

    return (
        <div className="spotify-auth-wrapper">
            <div className="spotify-auth-container">
                <span className="icon icon-xxl">
                    <Spotify />
                </span>
                <h2 className="spotify-title">Login</h2>

                {error && <p className="auth-error">{error}</p>}

                <form onSubmit={handleLogin} className="spotify-form">
                    <input
                        id="email"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="spotify-input"
                        required
                    />

                    <input
                        id="password"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="spotify-input"
                        required
                    />

                    <button
                        type="submit"
                        className="spotify-btn spotify-btn-green form"
                        disabled={userLoading}
                    >
                        {userLoading ? "Cargando..." : "Iniciar Sesión"}
                    </button>
                </form>

                <button
                    onClick={handleGoogleLogin}
                    className="spotify-btn spotify-btn-google margin-top-50"
                    disabled={userLoading}
                >
                    <span className="icon spotify-btn-icon google-icon">
                        <Google />
                    </span>
                    Continue with Google
                </button>

                <p className="auth-footer">
                    Don't you have an account yet? <a href="/signup">Sign up</a>
                </p>
            </div>
        </div>
    );
}
