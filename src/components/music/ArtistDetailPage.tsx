"use client";

import { useState, useEffect } from "react";
import { useAppUser } from "@/hooks/useAppUser";
import { ArtistRepository } from "@/repositories/ArtistRepository";
import { SongRepository } from "@/repositories/SongRepository";
import { Artist, Song } from "@/models/MusicGenre";
import { UserRole } from "@/models/AppUser";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import PageLoader from "../navigation/PageLoader";
import "@/styles/modules/modal.css";
import "@/styles/components/songs.css";
import "@/styles/modules/form.css";

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

    if (!appUser || !artist) {
        return <PageLoader />;
    }

    return (
        <div className="artist-page">
            <div className="artist-header">
                {artist.imageUrl && (
                    <img
                        src={artist.imageUrl}
                        alt={artist.name}
                        className="artist-cover"
                    />
                )}
                <div className="artist-header-info">
                    <span className="playlist-type">Artista</span>
                    <h1 className="artist-title">{artist.name}</h1>
                    <p className="artist-description">{artist.bio}</p>
                    <span className="artist-country">
                        País: {artist.country}
                    </span>
                </div>
            </div>

            <div className="artist-actions-bar">
                <button className="btn-play">▶</button>
                <button className="btn-icon">❤</button>
                <button className="btn-icon">⋯</button>

                {appUser?.role === UserRole.ADMIN_USER && (
                    <div className="admin-actions">
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
                            className="btn-link"
                        >
                            Editar Artista
                        </button>
                        <button
                            onClick={() =>
                                handleDeleteArtist(artist.id!, artist.imageUrl)
                            }
                            className="btn-link delete"
                        >
                            Eliminar Artista
                        </button>
                    </div>
                )}
            </div>

            <div className="songs-table-header">
                <div>#</div>
                <div>Title</div>
                <div>Album</div>
                <div>Date</div>
                <div>Duration</div>
            </div>

            <div className="songs-list">
                {songs.map((song, index) => (
                    <div key={song.id} className="song-row">
                        <div>{index + 1}</div>
                        <div className="song-title">
                            {song.imageUrl && (
                                <img
                                    src={song.imageUrl}
                                    alt={song.name}
                                    className="song-thumbnail"
                                />
                            )}
                            <div>
                                <div className="song-name">{song.name}</div>
                                <div className="song-artist">{artist.name}</div>
                            </div>
                        </div>
                        <div className="song-album">Album {artist.name}</div>
                        <div className="song-date">
                            {new Date(song.releaseDate).toLocaleDateString()}
                        </div>
                        <div className="song-duration">
                            {Math.floor(song.duration / 60)}:
                            {(song.duration % 60).toString().padStart(2, "0")}
                        </div>

                        {appUser?.role === UserRole.ADMIN_USER && (
                            <div className="song-row-actions">
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
                                    className="btn-link"
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
                                    className="btn-link delete"
                                >
                                    Eliminar
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {appUser?.role === UserRole.ADMIN_USER && (
                <div className="add-song-wrapper">
                    <button
                        onClick={() => setIsAddSongDialogOpen(true)}
                        className="btn-add-song"
                    >
                        Agregar Canción
                    </button>
                </div>
            )}

            {isAddSongDialogOpen && (
                <div className="overall child-center">
                    <div className="form-container">
                        <h3 className="form-title">Agregar Canción</h3>
                        <form onSubmit={handleAddSong} className="form-body">
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
                                className="form-input"
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
                                className="form-input"
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
                                className="form-input"
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
                                className="form-input"
                            />
                            <div className="form-actions">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsAddSongDialogOpen(false)
                                    }
                                    className="btn-cancel"
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-submit">
                                    Agregar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isEditArtistDialogOpen && selectedArtist && (
                <div className="overall child-center">
                    <div className="form-container">
                        <h3 className="form-title">Editar Artista</h3>
                        <form
                            onSubmit={handleUpdateArtist}
                            className="form-body"
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
                                className="form-input"
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
                                className="form-input"
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
                                className="form-input"
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
                                className="form-input"
                            />
                            <div className="form-actions">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsEditArtistDialogOpen(false)
                                    }
                                    className="btn-cancel"
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-submit">
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isEditSongDialogOpen && selectedSong && (
                <div className="overall child-center">
                    <div className="form-container">
                        <h3 className="form-title">Editar Canción</h3>
                        <form onSubmit={handleUpdateSong} className="form-body">
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
                                className="form-input"
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
                                className="form-input"
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
                                className="form-input"
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
                                className="form-input"
                            />
                            <div className="form-actions">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsEditSongDialogOpen(false)
                                    }
                                    className="btn-cancel"
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-submit">
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
