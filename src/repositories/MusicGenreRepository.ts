import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    updateDoc,
} from "firebase/firestore";
import { firebaseDb } from "../firebase/FirebaseConfig";
import { MusicGenre } from "@/models/MusicGenre";
import { MediaRepository } from "./MediaRepository";
import toast from "react-hot-toast";

export class MusicGenreRepository {
    collectionName = "music-genres";
    mediaRepo = new MediaRepository();

    async addGenre(genre: MusicGenre, image: File | null): Promise<MusicGenre> {
        try {
            let imageUrl: string | undefined;
            if (image) {
                imageUrl = await toast.promise(
                    this.mediaRepo.uploadFile(image),
                    {
                        loading: "Uploading image...",
                        success: "Image uploaded",
                        error: "Error uploading image",
                    },
                );
            }
            const docRef = await addDoc(
                collection(firebaseDb, this.collectionName),
                {
                    ...genre,
                    createdAt: new Date(),
                    imageUrl,
                },
            );
            return { ...genre, id: docRef.id, imageUrl };
        } catch (e) {
            console.error("Error adding genre: ", e);
            throw e;
        }
    }

    async getGenre(id: string): Promise<MusicGenre | null> {
        try {
            const docRef = doc(firebaseDb, this.collectionName, id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as MusicGenre;
            }
            return null;
        } catch (e) {
            console.error("Error fetching genre: ", e);
            throw e;
        }
    }

    async getAllGenres(): Promise<MusicGenre[]> {
        try {
            const querySnapshot = await getDocs(
                collection(firebaseDb, this.collectionName),
            );
            return querySnapshot.docs.map(
                (doc) => ({ id: doc.id, ...doc.data() } as MusicGenre),
            );
        } catch (e) {
            console.error("Error fetching genres: ", e);
            throw e;
        }
    }

    async updateGenre(
        id: string,
        genre: Partial<MusicGenre>,
        image: File | null,
    ): Promise<void> {
        try {
            let imageUrl: string | undefined;
            if (image) {
                imageUrl = await toast.promise(
                    this.mediaRepo.uploadFile(image),
                    {
                        loading: "Uploading image...",
                        success: "Image uploaded",
                        error: "Error uploading image",
                    },
                );
                if (genre.imageUrl) {
                    await this.mediaRepo.deleteFile(genre.imageUrl);
                }
            }
            const docRef = doc(firebaseDb, this.collectionName, id);
            let toUpdate = genre;
            if (imageUrl) {
                toUpdate = {
                    ...toUpdate,
                    imageUrl: imageUrl,
                };
            }
            await updateDoc(docRef, toUpdate);
        } catch (e) {
            console.error("Error updating genre: ", e);
            throw e;
        }
    }

    async deleteGenre(id: string, imageUrl?: string): Promise<void> {
        try {
            if (imageUrl) {
                await toast.promise(this.mediaRepo.deleteFile(imageUrl), {
                    loading: "Deleting image...",
                    success: "Image deleted",
                    error: "Error deleting image",
                });
            }
            const docRef = doc(firebaseDb, this.collectionName, id);
            await deleteDoc(docRef);
        } catch (e) {
            console.error("Error deleting genre: ", e);
            throw e;
        }
    }
}
