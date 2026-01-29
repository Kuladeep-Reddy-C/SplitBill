import { View, Text, Pressable, Alert, Linking } from "react-native";
import React, { useEffect, useState } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";

const ScanQr = () => {
    const router = useRouter();
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        if (!permission) return;
        if (!permission.granted) requestPermission();
    }, [permission]);

    const handleScan = ({ data }) => {
        if (scanned) return;
        setScanned(true);

        // ✅ Detect UPI QR
        if (data.startsWith("upi://")) {
            Alert.alert(
                "Pay via UPI",
                "Open UPI app to complete payment?",
                [
                    {
                        text: "Cancel",
                        style: "cancel",
                        onPress: () => setScanned(false),
                    },
                    {
                        text: "Pay",
                        onPress: async () => {
                            const supported = await Linking.canOpenURL(data);
                            if (supported) {
                                await Linking.openURL(data);
                                router.back();
                            } else {
                                Alert.alert("No UPI app found");
                                setScanned(false);
                            }
                        },
                    },
                ]
            );
            return;
        }

        // ❌ Not a UPI QR
        Alert.alert("Invalid QR", "This QR is not a UPI payment QR", [
            {
                text: "OK",
                onPress: () => setScanned(false),
            },
        ]);
    };


    if (!permission?.granted) {
        return (
            <View style={tw`flex-1 items-center justify-center`}>
                <Text>Camera permission required</Text>
                <Pressable
                    onPress={requestPermission}
                    style={tw`mt-4 bg-black px-4 py-2 rounded`}
                >
                    <Text style={tw`text-white`}>Grant Permission</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={tw`flex-1 bg-black`}>

            {/* Camera */}
            <CameraView
                style={tw`flex-1`}
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                onBarcodeScanned={handleScan}
            />

            {/* Overlay */}
            <View style={tw`absolute inset-0 items-center justify-center`}>

                {/* Top dim */}
                <View style={tw`absolute top-0 w-full h-[25%] bg-black/60`} />

                {/* Bottom dim */}
                <View style={tw`absolute bottom-0 w-full h-[25%] bg-black/60`} />

                {/* Left dim */}
                <View style={tw`absolute left-0 w-[10%] h-full bg-black/60`} />

                {/* Right dim */}
                <View style={tw`absolute right-0 w-[10%] h-full bg-black/60`} />

                {/* Scan box */}
                <View style={tw`w-64 h-64 border-2 border-white rounded-xl`} />

                {/* Guide text */}
                <Text style={tw`text-white mt-6 text-sm`}>
                    Align the QR inside the square
                </Text>
            </View>

            {/* Close button */}
            <Pressable
                onPress={() => router.back()}
                style={tw`absolute top-12 right-6`}
            >
                <Ionicons name="close" size={28} color="white" />
            </Pressable>

        </View>
    );
};

export default ScanQr;
