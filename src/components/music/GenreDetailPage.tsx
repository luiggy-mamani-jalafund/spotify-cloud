"use client";

import { useState, useEffect } from "react";
import { useAppUser } from "@/hooks/useAppUser";
import { MusicGenreRepository } from "@/repositories/MusicGenreRepository";
import { ArtistRepository } from "@/repositories/ArtistRepository";
import { MusicGenre, Artist } from "@/models/MusicGenre";
import { UserRole } from "@/models/AppUser";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";

export default function GenreDetailPage({ genreId }: { genreId: string }) {
    const { appUser, appUserLoading, userLoading } = useAppUser();
    const [genre, setGenre] = useState<MusicGenre | null>(null);
    const [artists, setArtists] = useState<Artist[]>([]);
    const [newArtist, setNewArtist] = useState({
        name: "",
        country: "",
        bio: "",
        image: null as File | null,
    });
    const [error, setError] = useState("");
    const [isAddArtistDialogOpen, setIsAddArtistDialogOpen] = useState(false);
    const [isEditGenreDialogOpen, setIsEditGenreDialogOpen] = useState(false);
    const [isEditArtistDialogOpen, setIsEditArtistDialogOpen] = useState(false);
    const [selectedGenre, setSelectedGenre] = useState<MusicGenre | null>(null);
    const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
    const genreRepo = new MusicGenreRepository();
    const artistRepo = new ArtistRepository();
    const router = useRouter();

    useEffect(() => {
        if (!appUserLoading && !userLoading && !appUser) {
            router.push("/login");
        } else if (genreId) {
            fetchGenre();
            fetchArtists();
        }
    }, [appUser, appUserLoading, userLoading, genreId]);

    const fetchGenre = async () => {
        try {
            const fetchedGenre = await genreRepo.getGenre(genreId);
            setGenre(fetchedGenre);
        } catch (err) {
            setError("Error al cargar género.");
        }
    };

    const fetchArtists = async () => {
        try {
            const fetchedArtists = await artistRepo.getArtistsByGenre(genreId);
            setArtists(fetchedArtists);
        } catch (err) {
            setError("Error al cargar artistas.");
        }
    };

    const handleAddArtist = async (e: React.FormEvent) => {
        e.preventDefault();
        if (appUser?.role !== UserRole.ADMIN_USER) return;
        try {
            const artist: Artist = {
                bio: newArtist.bio,
                country: newArtist.country,
                genreId: genreId,
                name: newArtist.name,
            };
            const addedArtist = await toast.promise(
                artistRepo.addArtist(artist, newArtist.image),
                {
                    loading: "Agregando artista...",
                    success: "Artista agregado",
                    error: "Error al agregar artista",
                },
            );
            setArtists([...artists, addedArtist]);
            setNewArtist({
                name: "",
                country: "",
                bio: "",
                image: null as File | null,
            });
            setIsAddArtistDialogOpen(false);
        } catch (err) {
            setError("Error al agregar artista.");
        }
    };

    const handleUpdateGenre = async (e: React.FormEvent) => {
        e.preventDefault();
        if (appUser?.role !== UserRole.ADMIN_USER || !selectedGenre) return;
        try {
            const updatedGenre = {
                name: newArtist.name || selectedGenre.name,
                description: newArtist.bio || selectedGenre.description,
            };
            await toast.promise(
                genreRepo.updateGenre(
                    selectedGenre.id!,
                    updatedGenre,
                    newArtist.image,
                ),
                {
                    loading: "Actualizando género...",
                    success: "Género actualizado",
                    error: "Error al actualizar género",
                },
            );
            setGenre({ ...selectedGenre, ...updatedGenre });
            setNewArtist({
                name: "",
                country: "",
                bio: "",
                image: null as File | null,
            });
            setSelectedGenre(null);
            setIsEditGenreDialogOpen(false);
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
            router.push("/genres");
        } catch (err) {
            setError("Error al eliminar género.");
        }
    };

    const handleUpdateArtist = async (e: React.FormEvent) => {
        e.preventDefault();
        if (appUser?.role !== UserRole.ADMIN_USER || !selectedArtist) return;
        try {
            const updatedArtist = {
                name: newArtist.name || selectedArtist.name,
                country: newArtist.country || selectedArtist.country,
                bio: newArtist.bio || selectedArtist.bio,
            };
            await toast.promise(
                artistRepo.updateArtist(
                    selectedArtist.id!,
                    updatedArtist,
                    newArtist.image,
                ),
                {
                    loading: "Actualizando artista...",
                    success: "Artista actualizado",
                    error: "Error al actualizar artista",
                },
            );
            setArtists(
                artists.map((a) =>
                    a.id === selectedArtist.id ? { ...a, ...updatedArtist } : a,
                ),
            );
            setNewArtist({
                name: "",
                country: "",
                bio: "",
                image: null as File | null,
            });
            setSelectedArtist(null);
            setIsEditArtistDialogOpen(false);
        } catch (err) {
            setError("Error al actualizar artista.");
        }
    };

    const handleDeleteArtist = async (id: string, imageUrl?: string) => {
        if (appUser?.role !== UserRole.ADMIN_USER) return;
        try {
            await toast.promise(artistRepo.deleteArtist(id, imageUrl), {
                loading: "Eliminando artista...",
                success: "Artista eliminado",
                error: "Error al eliminar artista",
            });
            setArtists(artists.filter((a) => a.id !== id));
        } catch (err) {
            setError("Error al eliminar artista.");
        }
    };

    if (!genre) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center text-green-400">
                Cargando...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold text-green-400 mb-8">
                    {genre.name}
                </h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <div className="bg-gray-800 p-6 rounded-lg mb-8">
                    {genre.imageUrl && (
                        <img
                            src={genre.imageUrl}
                            alt={genre.name}
                            className="w-full max-w-xs h-48 object-cover rounded-md mb-4"
                        />
                    )}
                    <p className="text-gray-400">{genre.description}</p>
                    <p className="text-gray-500 text-sm">
                        Creado: {new Date(genre.createdAt).toLocaleDateString()}
                    </p>
                    {appUser?.role === UserRole.ADMIN_USER && (
                        <div className="mt-4">
                            <button
                                onClick={() => {
                                    setSelectedGenre(genre);
                                    setNewArtist({
                                        name: genre.name,
                                        country: "",
                                        bio: genre.description || "",
                                        image: null as File | null,
                                    });
                                    setIsEditGenreDialogOpen(true);
                                }}
                                className="text-green-400 hover:underline mr-2"
                            >
                                Editar Género
                            </button>
                            <button
                                onClick={() =>
                                    handleDeleteGenre(genre.id!, genre.imageUrl)
                                }
                                className="text-red-400 hover:underline"
                            >
                                Eliminar Género
                            </button>
                        </div>
                    )}
                </div>

                <h3 className="text-2xl font-semibold text-green-400 mb-4">
                    Artistas
                </h3>
                {appUser?.role === UserRole.ADMIN_USER && (
                    <button
                        onClick={() => setIsAddArtistDialogOpen(true)}
                        className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 mb-6"
                    >
                        Agregar Artista
                    </button>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {artists.map((artist, index) => (
                        <div
                            key={`artist-item-${index}`}
                            className="bg-gray-800 p-4 rounded-lg"
                        >
                            {artist.imageUrl && (
                                <img
                                    src={artist.imageUrl}
                                    alt={artist.name}
                                    className="w-full h-40 object-cover rounded-md mb-4"
                                />
                            )}
                            <h4 className="text-lg font-semibold text-white">
                                {artist.name}
                            </h4>
                            <p className="text-gray-400">
                                País: {artist.country}
                            </p>
                            <p className="text-gray-400">{artist.bio}</p>
                            <div className="mt-2">
                                <Link
                                    href={`/music/genres/${genreId}/${artist.id}`}
                                    className="text-green-400 hover:underline mr-2"
                                >
                                    Ver Canciones
                                </Link>
                                {appUser?.role === UserRole.ADMIN_USER && (
                                    <>
                                        <button
                                            onClick={() => {
                                                setSelectedArtist(artist);
                                                setNewArtist({
                                                    name: artist.name,
                                                    country: artist.country,
                                                    bio: artist.bio,
                                                    image: null as File | null,
                                                });
                                                setIsEditArtistDialogOpen(true);
                                            }}
                                            className="text-green-400 hover:underline mr-2"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDeleteArtist(
                                                    artist.id!,
                                                    artist.imageUrl,
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

                {isAddArtistDialogOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
                            <h3 className="text-xl font-bold text-white mb-4">
                                Agregar Artista
                            </h3>
                            <form
                                onSubmit={handleAddArtist}
                                className="space-y-4"
                            >
                                <input
                                    type="text"
                                    placeholder="Nombre del artista"
                                    value={newArtist.name}
                                    onChange={(e) =>
                                        setNewArtist({
                                            ...newArtist,
                                            name: e.target.value,
                                        })
                                    }
                                    className="bg-gray-700 text-white border-gray-600 border rounded-md p-2 w-full"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="País"
                                    value={newArtist.country}
                                    onChange={(e) =>
                                        setNewArtist({
                                            ...newArtist,
                                            country: e.target.value,
                                        })
                                    }
                                    className="bg-gray-700 text-white border-gray-600 border rounded-md p-2 w-full"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Biografía"
                                    value={newArtist.bio}
                                    onChange={(e) =>
                                        setNewArtist({
                                            ...newArtist,
                                            bio: e.target.value,
                                        })
                                    }
                                    className="bg-gray-700 text-white border-gray-600 border rounded-md p-2 w-full"
                                    required
                                />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setNewArtist({
                                            ...newArtist,
                                            image: e.target.files?.[0] || null,
                                        })
                                    }
                                    className="bg-gray-700 text-white border-gray-600 border rounded-md p-2 w-full"
                                />
                                <div className="flex justify-end space-x-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsAddArtistDialogOpen(false)
                                        }
                                        className="bg-gray-600 text-white py-2 px-4 rounded-md"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
                                    >
                                        Agregar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {isEditGenreDialogOpen && selectedGenre && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
                            <h3 className="text-xl font-bold text-white mb-4">
                                Editar Género
                            </h3>
                            <form
                                onSubmit={handleUpdateGenre}
                                className="space-y-4"
                            >
                                <input
                                    type="text"
                                    placeholder="Nombre del género"
                                    value={newArtist.name}
                                    onChange={(e) =>
                                        setNewArtist({
                                            ...newArtist,
                                            name: e.target.value,
                                        })
                                    }
                                    className="bg-gray-700 text-white border-gray-600 border rounded-md p-2 w-full"
                                />
                                <input
                                    type="text"
                                    placeholder="Descripción"
                                    value={newArtist.bio}
                                    onChange={(e) =>
                                        setNewArtist({
                                            ...newArtist,
                                            bio: e.target.value,
                                        })
                                    }
                                    className="bg-gray-700 text-white border-gray-600 border rounded-md p-2 w-full"
                                />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setNewArtist({
                                            ...newArtist,
                                            image: e.target.files?.[0] || null,
                                        })
                                    }
                                    className="bg-gray-700 text-white border-gray-600 border rounded-md p-2 w-full"
                                />
                                <div className="flex justify-end space-x-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsEditGenreDialogOpen(false)
                                        }
                                        className="bg-gray-600 text-white py-2 px-4 rounded-md"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
                                    >
                                        Guardar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {isEditArtistDialogOpen && selectedArtist && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
                            <h3 className="text-xl font-bold text-white mb-4">
                                Editar Artista
                            </h3>
                            <form
                                onSubmit={handleUpdateArtist}
                                className="space-y-4"
                            >
                                <input
                                    type="text"
                                    placeholder="Nombre del artista"
                                    value={newArtist.name}
                                    onChange={(e) =>
                                        setNewArtist({
                                            ...newArtist,
                                            name: e.target.value,
                                        })
                                    }
                                    className="bg-gray-700 text-white border-gray-600 border rounded-md p-2 w-full"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="País"
                                    value={newArtist.country}
                                    onChange={(e) =>
                                        setNewArtist({
                                            ...newArtist,
                                            country: e.target.value,
                                        })
                                    }
                                    className="bg-gray-700 text-white border-gray-600 border rounded-md p-2 w-full"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Biografía"
                                    value={newArtist.bio}
                                    onChange={(e) =>
                                        setNewArtist({
                                            ...newArtist,
                                            bio: e.target.value,
                                        })
                                    }
                                    className="bg-gray-700 text-white border-gray-600 border rounded-md p-2 w-full"
                                    required
                                />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setNewArtist({
                                            ...newArtist,
                                            image: e.target.files?.[0] || null,
                                        })
                                    }
                                    className="bg-gray-700 text-white border-gray-600 border rounded-md p-2 w-full"
                                />
                                <div className="flex justify-end space-x-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsEditArtistDialogOpen(false)
                                        }
                                        className="bg-gray-600 text-white py-2 px-4 rounded-md"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
                                    >
                                        Guardar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
