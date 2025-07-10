import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_NAME,
    api_key: process.env.NEXT_PUBLIC_API_KEY,
    api_secret: process.env.NEXT_PUBLIC_SECRET_KEY,
});

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const folder = formData.get("folder") as string;

        if (!file || !folder) {
            return NextResponse.json(
                { error: "Missing file or folder" },
                { status: 400 },
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader
                .upload_stream(
                    {
                        folder,
                        public_id: `${folder}_${Date.now()}`,
                        resource_type: file.type.startsWith("audio/")
                            ? "video"
                            : "image",
                    },
                    (error: any, result: any) => {
                        if (error) return reject(error);
                        resolve(result);
                    },
                )
                .end(buffer);
        });

        return NextResponse.json({
            url: (uploadResult as any).secure_url,
        });
    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json(
            { error: "Failed to upload file" },
            { status: 500 },
        );
    }
}
