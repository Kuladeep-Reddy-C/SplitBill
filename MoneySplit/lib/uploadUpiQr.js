import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

export const uploadUpiQr = async (imageUri, userId) => {
    const response = await fetch(imageUri);
    const blob = await response.blob();

    const storageRef = ref(storage, `upi-qr/${userId}.png`);

    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
};
