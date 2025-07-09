"use client";

import { useState, useEffect } from "react";
import { useAppUser } from "@/hooks/useAppUser";
import { ArtistRepository } from "@/repositories/ArtistRepository";
import { SongRepository } from "@/repositories/SongRepository";
import { Artist, Song } from "@/models/MusicGenre";
import { UserRole } from "@/models/AppUser";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";

export default function ArtistDetailPage({ artistId }: { artistId: string }) {
    const { appUser, appUserLoading, userLoading } = useAppUser();
    const [artist, setArtist] = useState<Artist | null>(null);
    const [songs, setSongs] = useState<Song[]>([]);
    const [newSong, setNewSong] = useState({
        name: "",
        duration: 0,
        artistId: "",
        genreId: "",
        image: null as File | null,
        audio: null as File | null,
    });
    const [error, setError] = useState("");
    const [isAddSongDialogOpen, setIsAddSongDialogOpen] = useState(false);
    const [isEditArtistDialogOpen, setIsEditArtistDialogOpen] = useState(false);
    const [isEditSongDialogOpen, setIsEditSongDialogOpen] = useState(false);
    const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
    const [selectedSong, setSelectedSong] = useState<Song | null>(null);
    const artistRepo = new ArtistRepository();
    const songRepo = new SongRepository();
    const router = useRouter();
    const params = useParams();

    useEffect(() => {
        if (!appUserLoading && !userLoading && !appUser) {
            router.push("/login");
        } else if (artistId) {
            fetchArtist();
            fetchSongs();
        }
    }, [appUser, appUserLoading, userLoading, artistId]);

    const fetchArtist = async () => {
        try {
            const fetchedArtist = await artistRepo.getArtist(artistId);
            setArtist(fetchedArtist);
            setNewSong((prev) => ({
                ...prev,
                artistId,
                genreId: fetchedArtist?.genreId || "",
            }));
        } catch (err) {
            setError("Error al cargar artista.");
        }
    };

    const fetchSongs = async () => {
        try {
            const fetchedSongs = await songRepo.getSongsByArtist(artistId);
            setSongs(fetchedSongs);
        } catch (err) {
            setError("Error al cargar canciones.");
        }
    };

    const handleAddSong = async (e: React.FormEvent) => {
        e.preventDefault();
        if (appUser?.role !== UserRole.ADMIN_USER) return;
        try {
            const addedSong = await toast.promise(
                songRepo.addSong(
                    {
                        name: newSong.name,
                        duration: newSong.duration,
                        artistId,
                        genreId: newSong.genreId,
                        releaseDate: new Date(),
                    },
                    newSong.image,
                    newSong.audio,
                ),
                {
                    loading: "Agregando canción...",
                    success: "Canción agregada",
                    error: "Error al agregar canción",
                },
            );
            setSongs([...songs, addedSong]);
            setNewSong({
                name: "",
                duration: 0,
                artistId,
                genreId: newSong.genreId,
                image: null,
                audio: null,
            });
            setIsAddSongDialogOpen(false);
        } catch (err) {
            setError("Error al agregar canción.");
        }
    };

    const handleUpdateArtist = async (e: React.FormEvent) => {
        e.preventDefault();
        if (appUser?.role !== UserRole.ADMIN_USER || !selectedArtist) return;
        try {
            const updatedArtist = {
                name: newSong.name || selectedArtist.name,
                country: selectedArtist.country,
                bio: newSong.name || selectedArtist.bio,
            };
            await toast.promise(
                artistRepo.updateArtist(
                    selectedArtist.id!,
                    updatedArtist,
                    newSong.image,
                ),
                {
                    loading: "Actualizando artista...",
                    success: "Artista actualizado",
                    error: "Error al actualizar artista",
                },
            );
            setArtist({ ...selectedArtist, ...updatedArtist });
            setNewSong({
                name: "",
                duration: 0,
                artistId,
                genreId: newSong.genreId,
                image: null,
                audio: null,
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
            router.push(`/genres/${artist?.genreId}`);
        } catch (err) {
            setError("Error al eliminar artista.");
        }
    };

    const handleUpdateSong = async (e: React.FormEvent) => {
        e.preventDefault();
        if (appUser?.role !== UserRole.ADMIN_USER || !selectedSong) return;
        try {
            const updatedSong = {
                name: newSong.name || selectedSong.name,
                duration: newSong.duration || selectedSong.duration,
            };
            await toast.promise(
                songRepo.updateSong(
                    selectedSong.id!,
                    updatedSong,
                    newSong.image,
                    newSong.audio,
                ),
                {
                    loading: "Actualizando canción...",
                    success: "Canción actualizada",
                    error: "Error al actualizar canción",
                },
            );
            setSongs(
                songs.map((s) =>
                    s.id === selectedSong.id ? { ...s, ...updatedSong } : s,
                ),
            );
            setNewSong({
                name: "",
                duration: 0,
                artistId,
                genreId: newSong.genreId,
                image: null,
                audio: null,
            });
            setSelectedSong(null);
            setIsEditSongDialogOpen(false);
        } catch (err) {
            setError("Error al actualizar canción.");
        }
    };

    const handleDeleteSong = async (
        id: string,
        imageUrl?: string,
        audioUrl?: string,
    ) => {
        if (appUser?.role !== UserRole.ADMIN_USER) return;
        try {
            await toast.promise(songRepo.deleteSong(id, imageUrl, audioUrl), {
                loading: "Eliminando canción...",
                success: "Canción eliminada",
                error: "Error al eliminar canción",
            });
            setSongs(songs.filter((s) => s.id !== id));
        } catch (err) {
            setError("Error al eliminar canción.");
        }
    };

    if (!artist) {
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
                    {artist.name}
                </h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <div className="bg-gray-800 p-6 rounded-lg mb-8">
                    {artist.imageUrl && (
                        <img
                            src={artist.imageUrl}
                            alt={artist.name}
                            className="w-full max-w-xs h-48 object-cover rounded-md mb-4"
                        />
                    )}
                    <p className="text-gray-400">País: {artist.country}</p>
                    <p className="text-gray-400">{artist.bio}</p>
                    {appUser?.role === UserRole.ADMIN_USER && (
                        <div className="mt-4">
                            <button
                                onClick={() => {
                                    setSelectedArtist(artist);
                                    setNewSong({
                                        name: artist.name,
                                        duration: 0,
                                        artistId,
                                        genreId: artist.genreId || "",
                                        image: null,
                                        audio: null,
                                    });
                                    setIsEditArtistDialogOpen(true);
                                }}
                                className="text-green-400 hover:underline mr-2"
                            >
                                Editar Artista
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
                                Eliminar Artista
                            </button>
                        </div>
                    )}
                </div>

                <h3 className="text-2xl font-semibold text-green-400 mb-4">
                    Canciones
                </h3>
                {appUser?.role === UserRole.ADMIN_USER && (
                    <button
                        onClick={() => setIsAddSongDialogOpen(true)}
                        className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 mb-6"
                    >
                        Agregar Canción
                    </button>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {songs.map((song, index) => (
                        <div
                            key={`song-item-${index}`}
                            className="bg-gray-800 p-4 rounded-lg"
                        >
                            {song.imageUrl && (
                                <img
                                    src={song.imageUrl}
                                    alt={song.name}
                                    className="w-full h-40 object-cover rounded-md mb-4"
                                />
                            )}
                            <h4 className="text-lg font-semibold text-white">
                                {song.name}
                            </h4>
                            <p className="text-gray-400">
                                Duración: {song.duration} segundos
                            </p>
                            <p className="text-gray-500 text-sm">
                                Lanzamiento:{" "}
                                {new Date(
                                    song.releaseDate,
                                ).toLocaleDateString()}
                            </p>
                            {song.audioUrl && (
                                <audio controls className="w-full mt-2">
                                    <source
                                        src={song.audioUrl}
                                        type="audio/mp3"
                                    />
                                </audio>
                            )}
                            {appUser?.role === UserRole.ADMIN_USER && (
                                <div className="mt-2">
                                    <button
                                        onClick={() => {
                                            setSelectedSong(song);
                                            setNewSong({
                                                name: song.name,
                                                duration: song.duration,
                                                artistId,
                                                genreId: song.genreId,
                                                image: null,
                                                audio: null,
                                            });
                                            setIsEditSongDialogOpen(true);
                                        }}
                                        className="text-green-400 hover:underline mr-2"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleDeleteSong(
                                                song.id!,
                                                song.imageUrl,
                                                song.audioUrl,
                                            )
                                        }
                                        className="text-red-400 hover:underline"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {isAddSongDialogOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
                            <h3 className="text-xl font-bold text-white mb-4">
                                Agregar Canción
                            </h3>
                            <form
                                onSubmit={handleAddSong}
                                className="space-y-4"
                            >
                                <input
                                    type="text"
                                    placeholder="Nombre de la canción"
                                    value={newSong.name}
                                    onChange={(e) =>
                                        setNewSong({
                                            ...newSong,
                                            name: e.target.value,
                                        })
                                    }
                                    className="bg-gray-700 text-white border-gray-600 border rounded-md p-2 w-full"
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Duración (segundos)"
                                    value={newSong.duration}
                                    onChange={(e) =>
                                        setNewSong({
                                            ...newSong,
                                            duration: parseInt(e.target.value),
                                        })
                                    }
                                    className="bg-gray-700 text-white border-gray-600 border rounded-md p-2 w-full"
                                    required
                                />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setNewSong({
                                            ...newSong,
                                            image: e.target.files?.[0] || null,
                                        })
                                    }
                                    className="bg-gray-700 text-white border-gray-600 border rounded-md p-2 w-full"
                                />
                                <input
                                    type="file"
                                    accept="audio/mp3"
                                    onChange={(e) =>
                                        setNewSong({
                                            ...newSong,
                                            audio: e.target.files?.[0] || null,
                                        })
                                    }
                                    className="bg-gray-700 text-white border-gray-600 border rounded-md p-2 w-full"
                                />
                                <div className="flex justify-end space-x-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsAddSongDialogOpen(false)
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
                                    value={newSong.name}
                                    onChange={(e) =>
                                        setNewSong({
                                            ...newSong,
                                            name: e.target.value,
                                        })
                                    }
                                    className="bg-gray-700 text-white border-gray-600 border rounded-md p-2 w-full"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="País"
                                    value={newSong.name}
                                    onChange={(e) =>
                                        setNewSong({
                                            ...newSong,
                                            name: e.target.value,
                                        })
                                    }
                                    className="bg-gray-700 text-white border-gray-600 border rounded-md p-2 w-full"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Biografía"
                                    value={newSong.name}
                                    onChange={(e) =>
                                        setNewSong({
                                            ...newSong,
                                            name: e.target.value,
                                        })
                                    }
                                    className="bg-gray-700 text-white border-gray-600 border rounded-md p-2 w-full"
                                    required
                                />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setNewSong({
                                            ...newSong,
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

                {isEditSongDialogOpen && selectedSong && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
                            <h3 className="text-xl font-bold text-white mb-4">
                                Editar Canción
                            </h3>
                            <form
                                onSubmit={handleUpdateSong}
                                className="space-y-4"
                            >
                                <input
                                    type="text"
                                    placeholder="Nombre de la canción"
                                    value={newSong.name}
                                    onChange={(e) =>
                                        setNewSong({
                                            ...newSong,
                                            name: e.target.value,
                                        })
                                    }
                                    className="bg-gray-700 text-white border-gray-600 border rounded-md p-2 w-full"
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Duración (segundos)"
                                    value={newSong.duration}
                                    onChange={(e) =>
                                        setNewSong({
                                            ...newSong,
                                            duration: parseInt(e.target.value),
                                        })
                                    }
                                    className="bg-gray-700 text-white border-gray-600 border rounded-md p-2 w-full"
                                    required
                                />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setNewSong({
                                            ...newSong,
                                            image: e.target.files?.[0] || null,
                                        })
                                    }
                                    className="bg-gray-700 text-white border-gray-600 border rounded-md p-2 w-full"
                                />
                                <input
                                    type="file"
                                    accept="audio/mp3"
                                    onChange={(e) =>
                                        setNewSong({
                                            ...newSong,
                                            audio: e.target.files?.[0] || null,
                                        })
                                    }
                                    className="bg-gray-700 text-white border-gray-600 border rounded-md p-2 w-full"
                                />
                                <div className="flex justify-end space-x-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsEditSongDialogOpen(false)
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
