"use client";

import { useAppUser } from "@/hooks/useAppUser";
import SpotifyWithIcon from "@/icons/SpotifyWithIcon";
import { UserRole } from "@/models/AppUser";
import "@/styles/components/side_bar.css";
import { useEffect, useRef, useState } from "react";

const NavBar = () => {
    const { logout, appUser } = useAppUser();
    const [isOpen, setOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                profileRef.current &&
                !profileRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <nav className="side-nav">
            <SpotifyWithIcon />
            {appUser && (
                <div className="side-nav-profile-wrapper" ref={profileRef}>
                    <h4 className="notes-lv1">{appUser.username}</h4>
                    <div
                        className="side-nav-profile-photo"
                        onClick={() => setOpen(true)}
                    ></div>

                    {isOpen && (
                        <div className="side-nav-profile-info">
                            <h4 className="notes-lv2">{appUser.username}</h4>
                            <small className="font notes-lv2 | placeholder">
                                {appUser.role === UserRole.ADMIN_USER
                                    ? "Administrador"
                                    : "Usuario"}
                            </small>
                            <button
                                type="button"
                                className="logout-button margin-top-25 notes-lv2"
                                onClick={logout}
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default NavBar;
