import type { Metadata } from "next";
import "@/styles/main.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
    title: "Spotify - Cloud",
    description: "Spotify - Cloud Project",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <Toaster position="top-right" reverseOrder={false} />
                {children}
            </body>
        </html>
    );
}
