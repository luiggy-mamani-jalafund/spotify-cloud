import { firebaseDb } from "@/firebase/FirebaseConfig";
import { Post } from "@/pages/models/Post";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    where,
} from "firebase/firestore";
import { toast } from "react-toastify";

export class PostRepository {
    collectionName = "posts";

    async deleteImage(imageUrl: string): Promise<void> {
        const response = await fetch("/api/delete-image", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: imageUrl }),
        });

        if (!response.ok) {
            throw new Error("Failed to delete image");
        }
    }

    async uploadImage(file: File): Promise<string> {
        const formData = new FormData();
        formData.append("image", file);

        const response = await fetch("/api/upload-image", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Failed to upload image");
        }

        const data = await response.json();
        return data.imageUrl;
    }

    async addPost(post: Post, image?: File): Promise<Post> {
        try {
            let imageUrl: string | undefined;
            if (image) {
                imageUrl = await toast.promise(
                    this.uploadImage(image),
                    {
                        pending: "Creating post",
                        error: "Something bad happened during the post creation process",
                        success: "Created",
                    },
                    {
                        toastId: "cloundary_id_toast",
                    },
                );
            }

            if (post.id) {
                delete post.id;
            }

            const docRef = await toast.promise(
                addDoc(collection(firebaseDb, this.collectionName), {
                    ...post,
                    imageUrl,
                }),
                {
                    pending: "Crating post",
                    error: "Something bad happened",
                    success: "Created",
                },
                {
                    toastId: "create_post_id",
                },
            );

            return {
                ...post,
                id: docRef.id,
                imageUrl,
            };
        } catch (e) {
            console.error("Error adding post: ", e);
            throw e;
        }
    }

    async getAllPosts(): Promise<Post[]> {
        try {
            const querySnapshot = await getDocs(
                collection(firebaseDb, this.collectionName),
            );
            const posts: Post[] = [];
            querySnapshot.forEach((doc) => {
                posts.push({ id: doc.id, ...doc.data() } as Post);
            });
            return posts;
        } catch (e) {
            console.error("Error fetching posts: ", e);
            throw e;
        }
    }

    async getPostsByUser(userId: string): Promise<Post[]> {
        try {
            const q = query(
                collection(firebaseDb, this.collectionName),
                where("userId", "==", userId),
            );
            const querySnapshot = await getDocs(q);
            const posts: Post[] = [];
            querySnapshot.forEach((doc) => {
                posts.push({ id: doc.id, ...doc.data() } as Post);
            });
            return posts;
        } catch (e) {
            console.error("Error fetching user posts: ", e);
            throw e;
        }
    }

    async deletePost(postId: string): Promise<void> {
        try {
            const postRef = doc(firebaseDb, this.collectionName, postId);
            const postSnap = await getDoc(postRef);
            if (postSnap.exists() && postSnap.data().imageUrl) {
                const imageUrl: string = postSnap.data().imageUrl;
                await toast.promise(
                    this.deleteImage(imageUrl),
                    {
                        pending: "Deleting image",
                        error: "Error during the image deletion",
                        success: "Post image deleted",
                    },
                    {
                        toastId: "delete_image_id",
                    },
                );
            }

            await toast.promise(
                deleteDoc(postRef),
                {
                    pending: "Deleting post",
                    error: "Error during the deletion process of the post",
                    success: "Deleted",
                },
                {
                    toastId: "post_delete_id",
                },
            );

            console.log("Post deleted with ID: ", postId);
        } catch (e) {
            console.error("Error deleting post: ", e);
            throw e;
        }
    }
}
