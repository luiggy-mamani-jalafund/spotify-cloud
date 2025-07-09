import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    updateDoc,
} from "firebase/firestore";
import { firebaseDb } from "../firebase/FirebaseConfig";
import { Song } from "@/models/MusicGenre";
import { MediaRepository } from "./MediaRepository";
import toast from "react-hot-toast";

export class SongRepository {
    collectionName = "songs";
    mediaRepo = new MediaRepository();

    async addSong(
        song: Song,
        image: File | null,
        audio: File | null,
    ): Promise<Song> {
        try {
            let imageUrl: string | undefined;
            let audioUrl: string | undefined;
            if (image) {
                imageUrl = await toast.promise(
                    this.mediaRepo.uploadFile(image, "songs"),
                    {
                        loading: "Subiendo imagen...",
                        success: "Imagen subida",
                        error: "Error al subir imagen",
                    },
                );
            }
            if (audio) {
                audioUrl = await toast.promise(
                    this.mediaRepo.uploadFile(audio, "songs"),
                    {
                        loading: "Subiendo audio...",
                        success: "Audio subido",
                        error: "Error al subir audio",
                    },
                );
            }
            const docRef = await addDoc(
                collection(firebaseDb, this.collectionName),
                {
                    ...song,
                    releaseDate: new Date(),
                    imageUrl,
                    audioUrl,
                },
            );
            return { ...song, id: docRef.id, imageUrl, audioUrl };
        } catch (e) {
            console.error("Error adding song: ", e);
            throw e;
        }
    }

    async getSong(id: string): Promise<Song | null> {
        try {
            const docRef = doc(firebaseDb, this.collectionName, id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as Song;
            }
            return null;
        } catch (e) {
            console.error("Error fetching song: ", e);
            throw e;
        }
    }

    async getSongsByArtist(artistId: string): Promise<Song[]> {
        try {
            const q = query(
                collection(firebaseDb, this.collectionName),
                where("artistId", "==", artistId),
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(
                (doc) => ({ id: doc.id, ...doc.data() } as Song),
            );
        } catch (e) {
            console.error("Error fetching songs: ", e);
            throw e;
        }
    }

    async updateSong(
        id: string,
        song: Partial<Song>,
        image: File | null,
        audio: File | null,
    ): Promise<void> {
        try {
            let imageUrl: string | undefined;
            let audioUrl: string | undefined;
            if (image) {
                imageUrl = await toast.promise(
                    this.mediaRepo.uploadFile(image, "songs"),
                    {
                        loading: "Subiendo imagen...",
                        success: "Imagen subida",
                        error: "Error al subir imagen",
                    },
                );
                if (song.imageUrl) {
                    await this.mediaRepo.deleteFile(song.imageUrl);
                }
            }
            if (audio) {
                audioUrl = await toast.promise(
                    this.mediaRepo.uploadFile(audio, "songs"),
                    {
                        loading: "Subiendo audio...",
                        success: "Audio subido",
                        error: "Error al subir audio",
                    },
                );
                if (song.audioUrl) {
                    await this.mediaRepo.deleteFile(song.audioUrl);
                }
            }
            const docRef = doc(firebaseDb, this.collectionName, id);
            let toUpdate = song;
            if (imageUrl) {
                toUpdate = {
                    ...toUpdate,
                    imageUrl: imageUrl,
                };
            }
            if (audioUrl) {
                toUpdate = {
                    ...toUpdate,
                    audioUrl: audioUrl,
                };
            }
            await updateDoc(docRef, toUpdate);
        } catch (e) {
            console.error("Error updating song: ", e);
            throw e;
        }
    }

    async deleteSong(
        id: string,
        imageUrl?: string,
        audioUrl?: string,
    ): Promise<void> {
        try {
            if (imageUrl) {
                await toast.promise(this.mediaRepo.deleteFile(imageUrl), {
                    loading: "Eliminando imagen...",
                    success: "Imagen eliminada",
                    error: "Error al eliminar imagen",
                });
            }
            if (audioUrl) {
                await toast.promise(this.mediaRepo.deleteFile(audioUrl), {
                    loading: "Eliminando audio...",
                    success: "Audio eliminado",
                    error: "Error al eliminar audio",
                });
            }
            const docRef = doc(firebaseDb, this.collectionName, id);
            await deleteDoc(docRef);
        } catch (e) {
            console.error("Error deleting song: ", e);
            throw e;
        }
    }
}
