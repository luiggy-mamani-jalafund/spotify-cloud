"use client";

import { useAppUser } from "@/hooks/useAppUser";
import SpotifyWithIcon from "@/icons/SpotifyWithIcon";

const NavBar = () => {
    const { logout, appUser } = useAppUser();

    return (
        <nav className="p-20 flex items-center justify-between bg-gray-900 space-x-8">
            <SpotifyWithIcon />
            {appUser && (
                <div>
                    <div className="w-16 h-16 bg-purple-600 rounded-full"></div>
                    {/* has to be a modal the profile information*/}
                    <div>
                        <h4>{appUser.username}</h4>
                        <small>{appUser.role}</small>
                        <button type="button" onClick={logout}>
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default NavBar;
