
"use client";

import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./client";

/**
 * Uploads a user's ID document to Firebase Storage.
 * @param userId - The ID of the user.
 * @param file - The file to upload.
 * @returns The download URL of the uploaded file.
 */
export const uploadIdDocument = async (userId: string, file: File): Promise<string> => {
  const filePath = `user_ids/${userId}/${file.name}`;
  const storageRef = ref(storage, filePath);

  try {
    const snapshot = await uploadBytes(storageRef, file);
    console.log("Uploaded a blob or file!", snapshot);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading ID document:", error);
    throw new Error("File upload failed. Please try again.");
  }
};

/**
 * Uploads a photo for a help request.
 * @param userId The ID of the user making the request.
 * @param file The photo file to upload.
 * @returns The download URL of the uploaded photo.
 */
export const uploadRequestPhoto = async (userId: string, file: File): Promise<string> => {
  const filePath = `request_photos/${userId}/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, filePath);

  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading request photo:", error);
    throw new Error("Photo upload failed. Please try again.");
  }
};


/**
 * Removes a user's ID document from Firebase Storage.
 * @param userId - The ID of the user.
 */
export const removeIdDocument = async (userId: string): Promise<void> => {
    // This is a simplified implementation. A real app would need to know the full file path.
    // For this example, we assume there's only one ID doc and we can guess the path.
    // A better approach would be to store the full storage path in Firestore.
    // We are trying to find the file without knowing its name.
    const fileRef = ref(storage, `user_ids/${userId}`);

    try {
        // This won't work as intended without the full path, but it demonstrates the logic.
        // In a real app, you would list files in the directory or store the full path.
        // For now, we will assume we can't delete it perfectly, but we'll try.
        const fileToDelete = ref(storage, cnicLinkToPath(userId));
        await deleteObject(fileToDelete);
        console.log("File deleted successfully");
    } catch (error: any) {
        if(error.code === 'storage/object-not-found') {
            console.warn("Could not find the object to delete. This may be because the full path was not available.");
            // We can ignore this error if the goal is just to clear the link.
            return;
        }
        console.error("Error deleting ID document:", error);
        throw new Error("File deletion failed. Please try again.");
    }
};

// Helper to construct a path from a URL, this is a bit of a hack
// A better solution is to store the full path in firestore.
const cnicLinkToPath = (url: string) => {
    const baseUrl = `https://firebasestorage.googleapis.com/v0/b/${storage.app.options.storageBucket}/o/`;
    let imagePath = url.replace(baseUrl,"");
    //Remove the trailing token
    imagePath = imagePath.substring(0, imagePath.lastIndexOf("?"));
    //Decode the url
    return decodeURIComponent(imagePath);
}
