import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    updateProfile,
    GoogleAuthProvider,
    type User,
    signOut,
    linkWithCredential,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { firebaseAuth } from "../firebase/FirebaseConfig";
import { EmailAuthProvider } from "firebase/auth/web-extension";
import { useRouter } from "next/navigation";

export const useFirebaseUser = () => {
    const router = useRouter();

    const [user, setUser] = useState<User | null | undefined>(null);
    const [userLoading, setUserLoading] = useState(true);

    const loginWithFirebase = async (email: string, password: string) => {
        try {
            const userCredential = await signInWithEmailAndPassword(
                firebaseAuth,
                email,
                password,
            );
            const user = userCredential.user;
            console.log("User signed in:", user);
            router.push("/music/genres");
        } catch (error: any) {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log("Error signing in:", errorCode, errorMessage);
        }
    };

    const registerWithFirebase = async (
        email: string,
        password: string,
        fullName: string,
    ) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(
                firebaseAuth,
                email,
                password,
            );
            const user = userCredential.user;
            await updateProfile(user, {
                displayName: fullName,
            });
            console.log("Profile updated successfully");
            router.push("/music/genres");
        } catch (error: any) {
            const errorCode = error.code ?? 500;
            const errorMessage = error.message;
            console.log("Error signing in:", errorCode, errorMessage);
        }
    };

    const loginWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(firebaseAuth, provider);
            GoogleAuthProvider.credentialFromResult(result);

            console.log("User signed in with Google:", result.user);
            router.push("/music/genres");
        } catch (error: any) {
            const errorCode = error.code ?? 500;
            const errorMessage =
                error.message ??
                "Something bad happened during the google authentication method";
            const email = error.customData.email;
            const credential = GoogleAuthProvider.credentialFromError(error);
            console.log("Error signing in with Google:", {
                errorCode,
                errorMessage,
                email,
                credential,
            });
        }
    };

    const logout = async () => {
        try {
            setUser(undefined);
            await signOut(firebaseAuth);
        } catch (error: any) {
            console.log("Error signing out:", error);
        }
    };

    const linkWithPassword = (email: string, password: string) => {
        if (!user) {
            return;
        }
        const credential = EmailAuthProvider.credential(email, password);
        linkWithCredential(user, credential)
            .then((usercred) => {
                const user = usercred.user;
                console.log("Account linking success", user);
            })
            .catch((error) => {
                console.log("Account linking error", error);
            });
    };

    useEffect(() => {
        if (user === undefined) {
            console.log("User signed out successfully");
            router.push("/login");
        }

        if (user) {
            return;
        }

        onAuthStateChanged(firebaseAuth, (loggedInUser) => {
            setUserLoading(false);
            if (loggedInUser) {
                setUser(loggedInUser);
            }
        });
    }, [user]);

    return {
        user,
        userLoading,
        loginWithFirebase,
        registerWithFirebase,
        loginWithGoogle,
        logout,
        linkWithPassword,
    };
};
