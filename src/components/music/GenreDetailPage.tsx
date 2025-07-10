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
import PageLoader from "../navigation/PageLoader";
import "@/styles/modules/modal.css";
import "@/styles/components/artists.css";
import "@/styles/modules/form.css";
import Plus from "@/icons/Plus";
import Pen from "@/icons/Pen";
import Trash from "@/icons/Trash";
import Spotify from "@/icons/Spotify";
import { useAnalytics } from "@/hooks/useAnalytics";

export default function GenreDetailPage({ genreId }: { genreId: string }) {
    const { appUser, appUserLoading, userLoading } = useAppUser();
    const [genre, setGenre] = useState<MusicGenre | null>(null);
    const [artists, setArtists] = useState<Artist[] | undefined>(undefined);
    const [newArtist, setNewArtist] = useState({
        name: "",
        country: "",
        bio: "",
        image: null as File | null,
    });
    const [isAddArtistDialogOpen, setIsAddArtistDialogOpen] = useState(false);
    const [isEditGenreDialogOpen, setIsEditGenreDialogOpen] = useState(false);
    const [isEditArtistDialogOpen, setIsEditArtistDialogOpen] = useState(false);
    const [selectedGenre, setSelectedGenre] = useState<MusicGenre | null>(null);
    const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
    const genreRepo = new MusicGenreRepository();
    const artistRepo = new ArtistRepository();
    const router = useRouter();
    const { logPageView } = useAnalytics();

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
            logPageView(
                `/music/genres/${genreId}`,
                `${fetchedGenre?.name} Genre Page`,
            );
            setGenre(fetchedGenre);
        } catch (err) {
            toast.error("Error loading genre");
        }
    };

    const fetchArtists = async () => {
        try {
            const fetchedArtists = await artistRepo.getArtistsByGenre(genreId);
            setArtists(fetchedArtists);
        } catch (err) {
            toast.error("Error loading");
        }
    };

    const handleAddArtist = async (e: React.FormEvent) => {
        e.preventDefault();
        if (appUser?.role !== UserRole.ADMIN_USER || !artists) return;
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
                    loading: "Creating artist...",
                    success: "Created",
                    error: "Error during the creation",
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
            toast.error("Error");
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
                    loading: "Updating genre...",
                    success: "Updated",
                    error: "Error updating",
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
            toast.error("Error updating.");
        }
    };

    const handleUpdateArtist = async (e: React.FormEvent) => {
        e.preventDefault();
        if (
            appUser?.role !== UserRole.ADMIN_USER ||
            !selectedArtist ||
            !artists
        )
            return;
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
                    loading: "Updaing artist...",
                    success: "Updated",
                    error: "Error updating",
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
            toast.error("Error updating.");
        }
    };

    const handleDeleteArtist = async (id: string, imageUrl?: string) => {
        if (appUser?.role !== UserRole.ADMIN_USER || !artists) return;
        try {
            await toast.promise(artistRepo.deleteArtist(id, imageUrl), {
                loading: "Deleting artist...",
                success: "Deleted",
                error: "Error deleting",
            });
            setArtists(artists.filter((a) => a.id !== id));
        } catch (err) {
            toast.error("Error deleting");
        }
    };

    if (!appUser || !genre || !artists) {
        return <PageLoader />;
    }

    return (
        <div className="artist-wrappper">
            <div className="">
                <div className="artist-genrer-wrappper">
                    {genre.imageUrl && (
                        <img
                            src={genre.imageUrl}
                            alt={genre.name}
                            className="artist-genrer-img"
                        />
                    )}
                    <div className="artist-genrer-wrappper-info">
                        <h2 className="font-h1">{genre.name}</h2>

                        <p className="paragraph">{genre.description}</p>
                        <p className="font notes-lv1 | placeholder">
                            {genre.createdAt.toDate().toLocaleDateString()}
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
                                    className="btn-link"
                                >
                                    Edit Artist
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="separator | margin-top-15 margin-bottom-15"></div>
                <div className="separator-wrapper">
                    {appUser?.role === UserRole.ADMIN_USER && (
                        <button
                            onClick={() => setIsAddArtistDialogOpen(true)}
                            className="icon-button"
                        >
                            <span className="icon | icon-placeholder-color">
                                <Plus />
                            </span>
                        </button>
                    )}
                </div>

                <div className="artists-wrapper">
                    {artists.map((artist, index) => (
                        <div
                            key={`artist-item-${index}`}
                            className="artists-single-item"
                        >
                            {artist.imageUrl && (
                                <img
                                    src={artist.imageUrl}
                                    alt={artist.name}
                                    className="artists-item-img"
                                />
                            )}
                            <Link
                                href={`/music/genres/${genreId}/${artist.id}`}
                                className="artists-item-foote-songs"
                            >
                                <span className="icon icon-md icon-text-color">
                                    <Spotify />
                                </span>
                            </Link>
                            {appUser?.role === UserRole.ADMIN_USER && (
                                <div className="artists-item-options">
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
                                        className="option-button notes-lv2"
                                    >
                                        <span className="icon | icon-sm icon-hover icon-text-color">
                                            <Pen />
                                        </span>
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleDeleteArtist(
                                                artist.id!,
                                                artist.imageUrl,
                                            )
                                        }
                                        className="option-button notes-lv2"
                                    >
                                        <span className="icon | icon-sm icon-hover icon-text-color">
                                            <Trash />
                                        </span>
                                    </button>
                                </div>
                            )}
                            <div className="artist-item-main-footer">
                                <h4 className="font-h3 artist-item-title">
                                    {artist.name}
                                </h4>
                            </div>
                        </div>
                    ))}
                </div>

                {isAddArtistDialogOpen && (
                    <div className="overall child-center">
                        <div className="form-container">
                            <h3 className="form-title">Add Artist</h3>
                            <form
                                onSubmit={handleAddArtist}
                                className="form-body"
                            >
                                <input
                                    type="text"
                                    placeholder="Enter the name of the artist"
                                    value={newArtist.name}
                                    onChange={(e) =>
                                        setNewArtist({
                                            ...newArtist,
                                            name: e.target.value,
                                        })
                                    }
                                    className="form-input"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Enter the country"
                                    value={newArtist.country}
                                    onChange={(e) =>
                                        setNewArtist({
                                            ...newArtist,
                                            country: e.target.value,
                                        })
                                    }
                                    className="form-input"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Enter the bio"
                                    value={newArtist.bio}
                                    onChange={(e) =>
                                        setNewArtist({
                                            ...newArtist,
                                            bio: e.target.value,
                                        })
                                    }
                                    className="form-input"
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
                                    className="form-input"
                                />
                                <div className="form-actions">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsAddArtistDialogOpen(false)
                                        }
                                        className="btn-cancel"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-submit"
                                    >
                                        Add
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {isEditGenreDialogOpen && selectedGenre && (
                    <div className="overall child-center">
                        <div className="form-container">
                            <h3 className="form-title">Edit Genre</h3>
                            <form
                                onSubmit={handleUpdateGenre}
                                className="form-body"
                            >
                                <input
                                    type="text"
                                    placeholder="Name of the genre"
                                    value={newArtist.name}
                                    onChange={(e) =>
                                        setNewArtist({
                                            ...newArtist,
                                            name: e.target.value,
                                        })
                                    }
                                    className="form-input"
                                />
                                <input
                                    type="text"
                                    placeholder="Description"
                                    value={newArtist.bio}
                                    onChange={(e) =>
                                        setNewArtist({
                                            ...newArtist,
                                            bio: e.target.value,
                                        })
                                    }
                                    className="form-input"
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
                                    className="form-input"
                                />
                                <div className="form-actions">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsEditGenreDialogOpen(false)
                                        }
                                        className="btn-cancel"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-submit"
                                    >
                                        Save
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {isEditArtistDialogOpen && selectedArtist && (
                    <div className="overall child-center">
                        <div className="form-container">
                            <h3 className="form-title">Edit Artist</h3>
                            <form
                                onSubmit={handleUpdateArtist}
                                className="form-body"
                            >
                                <input
                                    type="text"
                                    placeholder="Enter the name of the artist"
                                    value={newArtist.name}
                                    onChange={(e) =>
                                        setNewArtist({
                                            ...newArtist,
                                            name: e.target.value,
                                        })
                                    }
                                    className="form-input"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Enter the country"
                                    value={newArtist.country}
                                    onChange={(e) =>
                                        setNewArtist({
                                            ...newArtist,
                                            country: e.target.value,
                                        })
                                    }
                                    className="form-input"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Bio"
                                    value={newArtist.bio}
                                    onChange={(e) =>
                                        setNewArtist({
                                            ...newArtist,
                                            bio: e.target.value,
                                        })
                                    }
                                    className="form-input"
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
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-submit"
                                    >
                                        Save
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
