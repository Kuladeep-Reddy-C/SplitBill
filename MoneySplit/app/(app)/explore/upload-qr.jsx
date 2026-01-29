import { View, Text, Pressable, Image, Alert } from "react-native";
import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";
import { uploadUpiQr } from "../../../lib/uploadUpiQr";
import { BACKEND_URL } from "../../../constants/Imps";

const UploadQr = () => {
    const { user } = useUser();
    const router = useRouter();
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,     // 👈 ENABLE CROPPING
            aspect: [1, 1],          // 👈 FORCE SQUARE (BEST FOR QR)
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };


    const handleUpload = async () => {
        if (!image) return;

        try {
            setLoading(true);

            // 1️⃣ Upload to Firebase
            const qrUrl = await uploadUpiQr(image, user.id);

            // 2️⃣ Save URL to backend
            await fetch(`${BACKEND_URL}/api/user/upi/Qr`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.id,
                    upiQrUrl: qrUrl,
                }),
            });

            Alert.alert("Success", "UPI QR uploaded successfully");
            router.back();
        } catch (err) {
            Alert.alert("Error", "Upload failed");
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={tw`flex-1 p-5`}>
            <Text style={tw`text-xl font-semibold mb-6`}>
                Upload UPI QR
            </Text>

            <Pressable
                onPress={pickImage}
                style={tw`h-56 rounded-2xl border-2 border-dashed items-center justify-center`}
            >
                {image ? (
                    <Image source={{ uri: image }} style={tw`w-full h-full rounded-xl`} />
                ) : (
                    <>
                        <Ionicons name="image-outline" size={40} />
                        <Text style={tw`mt-2 text-sm`}>Choose QR image</Text>
                    </>
                )}
            </Pressable>

            <Pressable
                disabled={!image || loading}
                onPress={handleUpload}
                style={tw`mt-6 bg-black py-4 rounded-full items-center`}
            >
                <Text style={tw`text-white font-medium`}>
                    {loading ? "Uploading..." : "Upload QR"}
                </Text>
            </Pressable>
        </View>
    );
};

export default UploadQr;
