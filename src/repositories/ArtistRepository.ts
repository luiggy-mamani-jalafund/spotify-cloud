// repositories/ArtistRepository.ts
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
import { Artist } from "@/models/MusicGenre";
import { MediaRepository } from "./MediaRepository";
import toast from "react-hot-toast";

export class ArtistRepository {
    collectionName = "artists";
    mediaRepo = new MediaRepository();

    async addArtist(artist: Artist, image: File | null): Promise<Artist> {
        try {
            let imageUrl: string | undefined;
            if (image) {
                imageUrl = await toast.promise(
                    this.mediaRepo.uploadFile(image, "artists"),
                    {
                        loading: "Subiendo imagen...",
                        success: "Imagen subida",
                        error: "Error al subir imagen",
                    },
                );
            }
            const docRef = await addDoc(
                collection(firebaseDb, this.collectionName),
                {
                    ...artist,
                    imageUrl,
                },
            );
            return { ...artist, id: docRef.id, imageUrl };
        } catch (e) {
            console.error("Error adding artist: ", e);
            throw e;
        }
    }

    async getArtist(id: string): Promise<Artist | null> {
        try {
            const docRef = doc(firebaseDb, this.collectionName, id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as Artist;
            }
            return null;
        } catch (e) {
            console.error("Error fetching artist: ", e);
            throw e;
        }
    }

    async getArtistsByGenre(genreId: string): Promise<Artist[]> {
        try {
            const q = query(
                collection(firebaseDb, this.collectionName),
                where("genreId", "==", genreId),
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(
                (doc) => ({ id: doc.id, ...doc.data() } as Artist),
            );
        } catch (e) {
            console.error("Error fetching artists: ", e);
            throw e;
        }
    }

    async updateArtist(
        id: string,
        artist: Partial<Artist>,
        image: File | null,
    ): Promise<void> {
        try {
            let imageUrl: string | undefined;
            if (image) {
                imageUrl = await toast.promise(
                    this.mediaRepo.uploadFile(image, "artists"),
                    {
                        loading: "Subiendo imagen...",
                        success: "Imagen subida",
                        error: "Error al subir imagen",
                    },
                );
                if (artist.imageUrl) {
                    await this.mediaRepo.deleteFile(artist.imageUrl);
                }
            }
            const docRef = doc(firebaseDb, this.collectionName, id);
            let toUpdate = artist;
            if (imageUrl) {
                toUpdate = {
                    ...toUpdate,
                    imageUrl: imageUrl,
                };
            }
            await updateDoc(docRef, toUpdate);
        } catch (e) {
            console.error("Error updating artist: ", e);
            throw e;
        }
    }

    async deleteArtist(id: string, imageUrl?: string): Promise<void> {
        try {
            if (imageUrl) {
                await toast.promise(this.mediaRepo.deleteFile(imageUrl), {
                    loading: "Eliminando imagen...",
                    success: "Imagen eliminada",
                    error: "Error al eliminar imagen",
                });
            }
            const docRef = doc(firebaseDb, this.collectionName, id);
            await deleteDoc(docRef);
        } catch (e) {
            console.error("Error deleting artist: ", e);
            throw e;
        }
    }
}
