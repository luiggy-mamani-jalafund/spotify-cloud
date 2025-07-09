"use client";

import { useAppUser } from "@/hooks/useAppUser";
import { UserRole } from "@/models/AppUser";
import { useRouter } from "next/navigation";

const UserProfile = () => {
    const { appUser, appUserLoading, user, userLoading, logout } = useAppUser();
    const router = useRouter();

    if (userLoading || appUserLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-green-400 text-lg">Cargando...</div>
            </div>
        );
    }

    if (!user || !appUser) {
        router.push("/login");
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-green-400 mb-6 text-center">
                    Perfil de Usuario
                </h2>
                <div className="space-y-4">
                    <div>
                        <span className="text-gray-400">Nombre:</span>
                        <p className="text-white text-lg">{appUser.username}</p>
                    </div>
                    <div>
                        <span className="text-gray-400">Email:</span>
                        <p className="text-white text-lg">{user.email}</p>
                    </div>
                    <div>
                        <span className="text-gray-400">Rol:</span>
                        <p className="text-white text-lg">
                            {appUser.role === UserRole.ADMIN_USER
                                ? "Administrador"
                                : "Usuario"}
                        </p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="mt-6 w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                >
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
};

export default UserProfile;
