export enum UserRole {
    USER = "USER",
    ADMIN_USER = "ADMIN_USER",
}

export interface AppUser {
    id?: string;
    username: string;
    userId: string;
    role: UserRole;
}
