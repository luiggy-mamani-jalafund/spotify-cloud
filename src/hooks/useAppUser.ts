import { useState, useEffect } from "react";
import { useFirebaseUser } from "./useFirebaseUser";
import { AppUserRepository } from "@/repositories/UserProfileRepository";
import { AppUser } from "@/models/AppUser";

export const useAppUser = () => {
    const { user, userLoading, logout } = useFirebaseUser();
    const [appUser, setAppUser] = useState<AppUser | null>(null);
    const [appUserLoading, setAppUserLoading] = useState(true);
    const appUserRepo = new AppUserRepository();

    useEffect(() => {
        const fetchAppUser = async () => {
            if (user && !userLoading) {
                try {
                    const fetchedUser = await appUserRepo.getAppUser(user.uid);
                    setAppUser(fetchedUser);
                } catch (err) {
                    console.error("Error fetching app user:", err);
                } finally {
                    setAppUserLoading(false);
                }
            } else if (!user && !userLoading) {
                setAppUser(null);
                setAppUserLoading(false);
            }
        };

        fetchAppUser();
    }, [user, userLoading]);

    return { appUser, appUserLoading, user, userLoading, logout };
};
