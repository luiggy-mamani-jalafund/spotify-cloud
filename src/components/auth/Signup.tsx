"use client";
import { useState } from "react";
import { useFirebaseUser } from "@/hooks/useFirebaseUser";
import { AppUserRepository } from "@/repositories/UserProfileRepository";
import { firebaseAuth } from "@/firebase/FirebaseConfig";
import { UserRole } from "@/models/AppUser";

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
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Sign up</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                        <label
                            htmlFor="fullName"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Name
                        </label>
                        <input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={userLoading}
                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {userLoading ? "Cargando..." : "Registrarse"}
                    </button>
                </form>
                <div className="mt-4">
                    <button
                        onClick={handleGoogleSignup}
                        disabled={userLoading}
                        className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                        Sign up with Google
                    </button>
                </div>
                <p className="mt-4 text-center text-sm text-gray-600">
                    Do you already have an account?{" "}
                    <a
                        href="/login"
                        className="text-indigo-600 hover:underline"
                    >
                        Login
                    </a>
                </p>
            </div>
        </div>
    );
}
