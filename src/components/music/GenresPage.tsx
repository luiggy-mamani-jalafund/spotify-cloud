"use client";

import { useState, useEffect } from "react";
import { useAppUser } from "@/hooks/useAppUser";
import { MusicGenreRepository } from "@/repositories/MusicGenreRepository";
import { MusicGenre } from "@/models/MusicGenre";
import { UserRole } from "@/models/AppUser";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import "@/styles/components/genres.css";
import "@/styles/modules/modal.css";
import "@/styles/modules/form.css";
import Plus from "@/icons/Plus";
import Pen from "@/icons/Pen";
import Trash from "@/icons/Trash";
import PageLoader from "../navigation/PageLoader";
import Spotify from "@/icons/Spotify";

export default function GenresPage() {
    const { appUser, appUserLoading, userLoading } = useAppUser();
    const [genres, setGenres] = useState<MusicGenre[] | undefined>(undefined);
    const [newGenre, setNewGenre] = useState({
        name: "",
        description: "",
        color: "",
        image: null as File | null,
    });
    const [error, setError] = useState("");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedGenre, setSelectedGenre] = useState<MusicGenre | null>(null);
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
        if (appUser?.role !== UserRole.ADMIN_USER || !genres) return;
        try {
            const addedGenre = await toast.promise(
                genreRepo.addGenre(
                    {
                        name: newGenre.name,
                        description: newGenre.description,
                        color: newGenre.color || "#121212",
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
            setNewGenre({ name: "", description: "", color: "", image: null });
            setIsAddDialogOpen(false);
        } catch (err) {
            setError("Error al agregar género.");
        }
    };

    const handleUpdateGenre = async (e: React.FormEvent) => {
        e.preventDefault();
        if (appUser?.role !== UserRole.ADMIN_USER || !selectedGenre || !genres)
            return;
        try {
            const updatedGenre: Partial<MusicGenre> = {
                name: newGenre.name || selectedGenre.name,
                description: newGenre.description || selectedGenre.description,
                color: newGenre.color || selectedGenre.color || "#121212",
            };

            await toast.promise(
                genreRepo.updateGenre(
                    selectedGenre.id!,
                    updatedGenre,
                    newGenre.image,
                ),
                {
                    loading: "Actualizando género...",
                    success: "Género actualizado",
                    error: "Error al actualizar género",
                },
            );
            setGenres(
                genres.map((g) =>
                    g.id === selectedGenre.id ? { ...g, ...updatedGenre } : g,
                ),
            );
            setNewGenre({ name: "", description: "", color: "", image: null });
            setSelectedGenre(null);
            setIsEditDialogOpen(false);
        } catch (err) {
            setError("Error al actualizar género.");
        }
    };

    const handleDeleteGenre = async (id: string, imageUrl?: string) => {
        if (appUser?.role !== UserRole.ADMIN_USER || !genres) return;
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

    if (!appUser || !genres) {
        return <PageLoader />;
    }

    return (
        <div className="genre-wrapper">
            <div className="max-w-7xl mx-auto">
                {appUser?.role === UserRole.ADMIN_USER && (
                    <button
                        onClick={() => setIsAddDialogOpen(true)}
                        className="icon-button | margin-bottom-25"
                    >
                        <span className="icon | icon-sm icon-placeholder-color">
                            <Plus />
                        </span>
                        <span className="font notes-lv1 placeholder">
                            create
                        </span>
                    </button>
                )}

                <div className="genres-wrapper">
                    {genres.map((genre) => (
                        <div
                            key={genre.id}
                            className="genre-item"
                            style={{
                                backgroundColor: genre.color || "#121212",
                            }}
                        >
                            {genre.imageUrl && (
                                <img
                                    src={genre.imageUrl}
                                    alt={genre.name}
                                    className="genre-item-img"
                                />
                            )}
                            <h4 className="genre-item-title">{genre.name}</h4>
                            <Link
                                href={`/music/genres/${genre.id}`}
                                className="notes-lv2 genre-item-title-more"
                            >
                                <span className="icon | icon-lg icon-text-color">
                                    <Spotify />
                                </span>
                            </Link>
                            {appUser?.role === UserRole.ADMIN_USER && (
                                <div className="genre-options">
                                    <button
                                        onClick={() => {
                                            setSelectedGenre(genre);
                                            setNewGenre({
                                                name: genre.name,
                                                description: genre.description,
                                                color: genre.color || "",
                                                image: null,
                                            });
                                            setIsEditDialogOpen(true);
                                        }}
                                        className="option-button notes-lv2"
                                    >
                                        <span className="icon | icon-sm icon-hover icon-text-color">
                                            <Pen />
                                        </span>
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleDeleteGenre(
                                                genre.id!,
                                                genre.imageUrl,
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
                        </div>
                    ))}
                </div>

                {isAddDialogOpen && (
                    <div className="overall | child-center">
                        <div className="form-container">
                            <h3 className="form-title">Create new genre</h3>
                            <form
                                onSubmit={handleAddGenre}
                                className="form-body"
                            >
                                <input
                                    type="text"
                                    placeholder="Enter the name of the genre"
                                    value={newGenre.name}
                                    onChange={(e) =>
                                        setNewGenre({
                                            ...newGenre,
                                            name: e.target.value,
                                        })
                                    }
                                    className="form-input"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Enter the description of the genre"
                                    value={newGenre.description}
                                    onChange={(e) =>
                                        setNewGenre({
                                            ...newGenre,
                                            description: e.target.value,
                                        })
                                    }
                                    className="form-input"
                                    required
                                />
                                <input
                                    type="color"
                                    value={newGenre.color}
                                    onChange={(e) =>
                                        setNewGenre({
                                            ...newGenre,
                                            color: e.target.value,
                                        })
                                    }
                                    className="form-color"
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
                                    className="form-input"
                                />
                                <div className="form-actions">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsAddDialogOpen(false)
                                        }
                                        className="btn-cancel"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-submit"
                                    >
                                        Create
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {isEditDialogOpen && selectedGenre && (
                    <div className="overall | child-center">
                        <div className="form-container">
                            <h3 className="form-title">Editar Género</h3>
                            <form
                                onSubmit={handleUpdateGenre}
                                className="form-body"
                            >
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
                                    className="form-input"
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
                                    className="form-input"
                                />
                                <input
                                    type="color"
                                    value={newGenre.color}
                                    onChange={(e) =>
                                        setNewGenre({
                                            ...newGenre,
                                            color: e.target.value,
                                        })
                                    }
                                    className="form-color"
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
                                    className="form-input"
                                />
                                <div className="form-actions">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsEditDialogOpen(false)
                                        }
                                        className="btn-cancel"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-submit"
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
