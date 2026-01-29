import { View, Text, TextInput, Pressable, Alert } from "react-native";
import React, { useState } from "react";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import tw from "twrnc";
import { BACKEND_URL } from "../../../constants/Imps";

const EditUpi = () => {
    const { user } = useUser();
    const router = useRouter();
    const [upiId, setUpiId] = useState("");

    const saveUpi = async () => {
        if (!upiId.includes("@")) {
            Alert.alert("Invalid UPI ID");
            return;
        }

        const resp = await fetch(`${BACKEND_URL}/api/user/upi/id`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: user.id,
                upiId,
            }),
        });

        console.log(resp);

        router.back();
    };

    return (
        <View style={tw`flex-1 p-5`}>
            <Text style={tw`text-xl font-semibold mb-4`}>
                Enter UPI ID
            </Text>

            <TextInput
                placeholder="example@okaxis"
                value={upiId}
                onChangeText={setUpiId}
                autoCapitalize="none"
                style={tw`border rounded-xl px-4 py-3 mb-6`}
            />

            <Pressable
                onPress={saveUpi}
                style={tw`bg-black py-4 rounded-full items-center`}
            >
                <Text style={tw`text-white font-medium`}>
                    Save
                </Text>
            </Pressable>
        </View>
    );
};

export default EditUpi;
