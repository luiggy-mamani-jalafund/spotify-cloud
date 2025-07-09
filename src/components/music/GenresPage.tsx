"use client";

import { useState, useEffect } from "react";
import { useAppUser } from "@/hooks/useAppUser";
import { MusicGenreRepository } from "@/repositories/MusicGenreRepository";
import { MusicGenre } from "@/models/MusicGenre";
import { UserRole } from "@/models/AppUser";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";

export default function GenresPage() {
    const { appUser, appUserLoading, userLoading } = useAppUser();
    const [genres, setGenres] = useState<MusicGenre[]>([]);
    const [newGenre, setNewGenre] = useState({
        name: "",
        description: "",
        image: null as File | null,
    });
    const [error, setError] = useState("");
    const genreRepo = new MusicGenreRepository();
    const router = useRouter();

    useEffect(() => {
        if (!appUserLoading && !userLoading && !appUser) {
            router.push("/login");
        } else {
            fetchGenres();
        }
    }, [appUser, appUserLoading, userLoading]);

    const fetchGenres = async () => {
        try {
            const fetchedGenres = await genreRepo.getAllGenres();
            setGenres(fetchedGenres);
        } catch (err) {
            setError("Error al cargar géneros.");
        }
    };

    const handleAddGenre = async (e: React.FormEvent) => {
        e.preventDefault();
        if (appUser?.role !== UserRole.ADMIN_USER) return;
        try {
            const addedGenre = await toast.promise(
                genreRepo.addGenre(
                    {
                        name: newGenre.name,
                        description: newGenre.description,
                        createdAt: new Date(),
                    },
                    newGenre.image,
                ),
                {
                    loading: "Agregando género...",
                    success: "Género agregado",
                    error: "Error al agregar género",
                },
            );
            setGenres([...genres, addedGenre]);
            setNewGenre({ name: "", description: "", image: null });
        } catch (err) {
            setError("Error al agregar género.");
        }
    };

    const handleUpdateGenre = async (id: string, genre: MusicGenre) => {
        if (appUser?.role !== UserRole.ADMIN_USER) return;
        try {
            const newName = prompt("Nuevo nombre", genre.name) || genre.name;
            const newDescription =
                prompt("Nueva descripción", genre.description) ||
                genre.description;
            const newImage = newGenre.image;
            await toast.promise(
                genreRepo.updateGenre(
                    id,
                    { name: newName, description: newDescription },
                    newImage,
                ),
                {
                    loading: "Actualizando género...",
                    success: "Género actualizado",
                    error: "Error al actualizar género",
                },
            );
            setGenres(
                genres.map((g) =>
                    g.id === id
                        ? { ...g, name: newName, description: newDescription }
                        : g,
                ),
            );
        } catch (err) {
            setError("Error al actualizar género.");
        }
    };

    const handleDeleteGenre = async (id: string, imageUrl?: string) => {
        if (appUser?.role !== UserRole.ADMIN_USER) return;
        try {
            await toast.promise(genreRepo.deleteGenre(id, imageUrl), {
                loading: "Eliminando género...",
                success: "Género eliminado",
                error: "Error al eliminar género",
            });
            setGenres(genres.filter((g) => g.id !== id));
        } catch (err) {
            setError("Error al eliminar género.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold text-green-400 mb-8">
                    Géneros Musicales
                </h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}

                {appUser?.role === UserRole.ADMIN_USER && (
                    <form onSubmit={handleAddGenre} className="mb-6 space-y-4">
                        <input
                            type="text"
                            placeholder="Nombre del género"
                            value={newGenre.name}
                            onChange={(e) =>
                                setNewGenre({
                                    ...newGenre,
                                    name: e.target.value,
                                })
                            }
                            className="bg-gray-800 text-white border-gray-700 border rounded-md p-2 w-full"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Descripción"
                            value={newGenre.description}
                            onChange={(e) =>
                                setNewGenre({
                                    ...newGenre,
                                    description: e.target.value,
                                })
                            }
                            className="bg-gray-800 text-white border-gray-700 border rounded-md p-2 w-full"
                            required
                        />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                setNewGenre({
                                    ...newGenre,
                                    image: e.target.files?.[0] || null,
                                })
                            }
                            className="bg-gray-800 text-white border-gray-700 border rounded-md p-2 w-full"
                        />
                        <button
                            type="submit"
                            className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                        >
                            Agregar Género
                        </button>
                    </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {genres.map((genre, index) => (
                        <div
                            key={`genre-item-${index}`}
                            className="bg-gray-800 p-4 rounded-lg"
                        >
                            {genre.imageUrl && (
                                <img
                                    src={genre.imageUrl}
                                    alt={genre.name}
                                    className="w-full h-40 object-cover rounded-md mb-4"
                                />
                            )}
                            <h4 className="text-lg font-semibold text-white">
                                {genre.name}
                            </h4>
                            <p className="text-gray-400">{genre.description}</p>
                            <p className="text-gray-500 text-sm">
                                Creado:{" "}
                                {new Date(genre.createdAt).toLocaleDateString()}
                            </p>
                            <div className="mt-2">
                                <Link
                                    href={`/music/genres/${genre.id}`}
                                    className="text-green-400 hover:underline mr-2"
                                >
                                    Ver Detalles
                                </Link>
                                {appUser?.role === UserRole.ADMIN_USER && (
                                    <>
                                        <button
                                            onClick={() =>
                                                handleUpdateGenre(
                                                    genre.id!,
                                                    genre,
                                                )
                                            }
                                            className="text-green-400 hover:underline mr-2"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDeleteGenre(
                                                    genre.id!,
                                                    genre.imageUrl,
                                                )
                                            }
                                            className="text-red-400 hover:underline"
                                        >
                                            Eliminar
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
