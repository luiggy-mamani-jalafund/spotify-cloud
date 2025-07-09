import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_NAME,
    api_key: process.env.NEXT_PUBLIC_API_KEY,
    api_secret: process.env.NEXT_PUBLIC_SECRET_KEY,
});

export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();
        const url: string | undefined = body.url;

        if (!url) {
            return NextResponse.json(
                { error: "Missing the file url" },
                { status: 400 },
            );
        }

        const publicId = url.match(/\/(genres|artists|songs)\/(.+)\.\w+$/)?.[2];
        if (publicId) {
            await cloudinary.uploader.destroy(`${publicId}`, {
                resource_type: url.includes(".mp3") ? "video" : "image",
            });
        }

        return NextResponse.json({ message: "Deleted", url }, { status: 200 });
    } catch (err) {
        console.error("Error /api/delete-file:", err);
        return NextResponse.json(
            { error: "Error processing the request" },
            { status: 500 },
        );
    }
}
