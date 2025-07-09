import { addDoc, collection, query, where, getDocs } from "firebase/firestore";
import { firebaseDb } from "../firebase/FirebaseConfig";
import { AppUser } from "@/models/AppUser";

export class AppUserRepository {
    collectionName = "spotify-users";

    async addAppUser(profile: AppUser): Promise<AppUser> {
        try {
            if (profile.id) {
                delete profile.id;
            }
            const docRef = await addDoc(
                collection(firebaseDb, this.collectionName),
                {
                    ...profile,
                },
            );
            return {
                ...profile,
                id: docRef.id,
            };
        } catch (e) {
            throw e;
        }
    }

    async getAppUser(userId: string): Promise<AppUser | null> {
        try {
            const q = query(
                collection(firebaseDb, this.collectionName),
                where("userId", "==", userId),
            );
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                return { id: doc.id, ...doc.data() } as AppUser;
            }
            return null;
        } catch (e) {
            console.error("Error fetching user profile: ", e);
            throw e;
        }
    }
}
