import { ref, deleteObject } from "firebase/storage";
import { storage } from "./firebase";

export const deleteUpiQr = async (userId) => {
    const qrRef = ref(storage, `upi-qr/${userId}.png`);
    await deleteObject(qrRef);
};
