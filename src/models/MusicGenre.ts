export interface MusicGenre {
    id?: string;
    name: string;
    description: string;
    color?: string;
    createdAt: Date;
    imageUrl?: string;
}

export interface Artist {
    id?: string;
    name: string;
    country: string;
    bio: string;
    genreId: string;
    imageUrl?: string;
}

export interface Song {
    id?: string;
    name: string;
    duration: number;
    releaseDate: Date;
    artistId: string;
    genreId: string;
    imageUrl?: string;
    audioUrl?: string;
}
