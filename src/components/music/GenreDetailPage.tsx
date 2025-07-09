"use client";

import { useState, useEffect } from "react";
import { useAppUser } from "@/hooks/useAppUser";
import { MusicGenreRepository } from "@/repositories/MusicGenreRepository";
import { ArtistRepository } from "@/repositories/ArtistRepository";
import { MusicGenre, Artist } from "@/models/MusicGenre";
import { UserRole } from "@/models/AppUser";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
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
        } catch (err) {
            setError("Error al agregar artista.");
        }
    };

    const handleUpdateGenre = async (id: string, genre: MusicGenre) => {
        if (appUser?.role !== UserRole.ADMIN_USER) return;
        try {
            const newName = prompt("Nuevo nombre", genre.name) || genre.name;
            const newDescription =
                prompt("Nueva descripción", genre.description) ||
                genre.description;
            const newImage = newArtist.image; // Reusing the form's image input for simplicity
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
            setGenre({ ...genre, name: newName, description: newDescription });
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

    const handleUpdateArtist = async (id: string, artist: Artist) => {
        if (appUser?.role !== UserRole.ADMIN_USER) return;
        try {
            const newName = prompt("Nuevo nombre", artist.name) || artist.name;
            const newCountry =
                prompt("Nuevo país", artist.country) || artist.country;
            const newBio = prompt("Nueva biografía", artist.bio) || artist.bio;
            const newImage = newArtist.image; // Reusing the form's image input
            await toast.promise(
                artistRepo.updateArtist(
                    id,
                    { name: newName, country: newCountry, bio: newBio },
                    newImage,
                ),
                {
                    loading: "Actualizando artista...",
                    success: "Artista actualizado",
                    error: "Error al actualizar artista",
                },
            );
            setArtists(
                artists.map((a) =>
                    a.id === id
                        ? {
                              ...a,
                              name: newName,
                              country: newCountry,
                              bio: newBio,
                          }
                        : a,
                ),
            );
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
                                onClick={() =>
                                    handleUpdateGenre(genre.id!, genre)
                                }
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
                    <form onSubmit={handleAddArtist} className="mb-6 space-y-4">
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
                            className="bg-gray-800 text-white border-gray-700 border rounded-md p-2 w-full"
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
                            className="bg-gray-800 text-white border-gray-700 border rounded-md p-2 w-full"
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
                            className="bg-gray-800 text-white border-gray-700 border rounded-md p-2 w-full"
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
                            className="bg-gray-800 text-white border-gray-700 border rounded-md p-2 w-full"
                        />
                        <button
                            type="submit"
                            className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                        >
                            Agregar Artista
                        </button>
                    </form>
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
                                            onClick={() =>
                                                handleUpdateArtist(
                                                    artist.id!,
                                                    artist,
                                                )
                                            }
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
            </div>
        </div>
    );
}
