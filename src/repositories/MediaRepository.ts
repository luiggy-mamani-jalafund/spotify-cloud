export class MediaRepository {
    async uploadFile(file: File, folder: string): Promise<string> {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const response = await fetch("/api/upload-image", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Failed to upload file");
        }

        const data = await response.json();
        return data.url;
    }

    async deleteFile(url: string): Promise<void> {
        const response = await fetch("/api/delete-file", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
        });

        if (!response.ok) {
            throw new Error("Failed to delete file");
        }
    }
}
