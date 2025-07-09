"use client";
import { useState } from "react";
import { useFirebaseUser } from "@/hooks/useFirebaseUser";
import { AppUserRepository } from "@/repositories/UserProfileRepository";
import { firebaseAuth } from "@/firebase/FirebaseConfig";
import { UserRole } from "@/models/AppUser";
import "@/styles/components/auth.css";
import Google from "@/icons/Google";
import Spotify from "@/icons/Spotify";

export default function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [error, setError] = useState("");
    const { registerWithFirebase, loginWithGoogle, userLoading } =
        useFirebaseUser();
    const appUserRepo = new AppUserRepository();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            await registerWithFirebase(email, password, fullName);
            const user = await appUserRepo.getAppUser(
                firebaseAuth.currentUser?.uid || "",
            );
            if (!user) {
                await appUserRepo.addAppUser({
                    username: fullName,
                    userId: firebaseAuth.currentUser?.uid || "",
                    role: UserRole.USER,
                });
            }
        } catch (err) {
            setError("Error al registrarse. Intenta de nuevo.");
        }
    };

    const handleGoogleSignup = async () => {
        setError("");
        try {
            await loginWithGoogle();
            const user = await appUserRepo.getAppUser(
                firebaseAuth.currentUser?.uid || "",
            );
            if (!user) {
                await appUserRepo.addAppUser({
                    username:
                        firebaseAuth.currentUser?.displayName || "username",
                    userId: firebaseAuth.currentUser?.uid || "",
                    role: UserRole.USER,
                });
            }
        } catch (err) {
            setError("Error al registrarse con Google.");
        }
    };

    return (
        <div className="spotify-auth-wrapper">
            <div className="spotify-auth-container">
                <span className="icon icon-xxl">
                    <Spotify />
                </span>
                <h2 className="spotify-title margin-top-15">Sign up</h2>

                {error && <p className="auth-error">{error}</p>}

                <form onSubmit={handleSignup} className="spotify-form">
                    <input
                        id="fullName"
                        type="text"
                        placeholder="Full Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="spotify-input"
                        required
                    />

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
                        {userLoading ? "Cargando..." : "Registrarse"}
                    </button>
                </form>

                <button
                    onClick={handleGoogleSignup}
                    className="spotify-btn spotify-btn-google margin-top-50"
                    disabled={userLoading}
                >
                    <span className="icon spotify-btn-icon google-icon">
                        <Google />
                    </span>
                    Continue with Google
                </button>

                <p className="auth-footer">
                    Do you already have an account? <a href="/login">Login</a>
                </p>
            </div>
        </div>
    );
}
