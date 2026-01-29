import {
    View,
    Text,
    Image,
    useColorScheme,
    TouchableOpacity,
    Pressable,
    ScrollView,
    Alert,
} from "react-native";
import { Animated, Dimensions } from "react-native";
import React, { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import tw, { style } from "twrnc";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../../constants/Colors";
import { BACKEND_URL } from "../../../constants/Imps";
import { deleteUpiQr } from "../../../lib/deleteUpiQr";
import QuickActionCard from "../../../components/QuickActionCard";

const Index = () => {
    const { user, isLoaded } = useUser();
    const { isSignedIn } = useAuth();
    const router = useRouter();
    const scheme = useColorScheme();
    const colors = theme[scheme ?? "light"];
    const screenHeight = Dimensions.get("window").height;
    const scrollY = React.useRef(new Animated.Value(0)).current;
    const qrScale = scrollY.interpolate({
        inputRange: [0, screenHeight * 0.4],
        outputRange: [0, 1],
        extrapolate: "clamp",
    });


    const [userNet, setUserNet] = useState({});

    useEffect(() => {
        if (!isLoaded || !user?.id) return;
        const fetchUserData = async () => {
            const data = await fetch(`${BACKEND_URL}/api/net/${user?.id}`);
            const resp = await data.json();
            if (resp) {
                setUserNet(resp);
            }
            console.log(resp);
        }
        fetchUserData();
    }, [isLoaded, user?.id]);

    console.log(user?.unsafeMetadata);
    if (!isLoaded) {
        return (
            <View style={tw`flex-1 items-center justify-center`}>
                <Text>Loading...</Text>
            </View>
        );
    }

    if (!user || !isSignedIn) {
        return (
            <View style={tw`flex-1 items-center justify-center`}>
                <Text>Not signed in</Text>
            </View>
        );
    }

    return (
        <Animated.ScrollView
            style={[tw`p-4`, { backgroundColor: colors.background }]}
            scrollEventThrottle={16}
            onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: true }
            )}
        >

            {/* Header */}
            <View style={tw`flex-row justify-between items-center`}>
                {/* Profile image */}
                <Pressable style={tw`flex-row`} onPress={() => {
                    router.push('/profile')
                }}>
                    <View style={tw`mr-2`}>
                        <Image
                            source={{ uri: user.imageUrl }}
                            style={tw`w-10 h-10 rounded-full`}
                        />
                    </View>
                    <View>
                        <Text style={tw`font-bold text-xl`}>👋 {user?.unsafeMetadata ? `${user?.unsafeMetadata?.firstName}` : `${user?.firstName}`}</Text>
                        <Text>Ready to get settled</Text>
                    </View>
                </Pressable>


                {/* Right actions */}
                <View style={tw`flex-row`}>
                    {/* Search */}
                    <TouchableOpacity
                        onPress={() => router.push("/explore/search_people")}
                        style={[
                            tw`w-10 h-10 rounded-full items-center justify-center mr-2`,
                            { backgroundColor: colors.surface },
                        ]}
                    >
                        <Ionicons
                            name="search-outline"
                            size={20}
                            color={colors.textPrimary}
                        />
                    </TouchableOpacity>

                    {/* Notifications */}
                    <TouchableOpacity onPress={() => {
                        router.push('/explore/notifications')
                    }}
                        style={[
                            tw`w-10 h-10 rounded-full items-center justify-center`,
                            { backgroundColor: colors.surface },
                        ]}
                    >
                        <Ionicons
                            name="notifications-outline"
                            size={20}
                            color={colors.textPrimary}
                        />
                    </TouchableOpacity>
                </View>
            </View>
            {/* Net Balance Card */}
            <View
                style={[
                    tw`my-5 px-5 py-5 rounded-3xl`,
                    {
                        backgroundColor: colors.textPrimary,
                        width: "100%",
                    },
                ]}
            >
                {/* Title */}
                <Text
                    style={[
                        tw`text-xs font-semibold uppercase`,
                        { color: colors.background, opacity: 0.8 },
                    ]}
                >
                    Total Net Balance
                </Text>

                {/* Amount */}
                <Text
                    style={[
                        tw`mt-2 text-3xl font-bold`,
                        { color: colors.primary },
                    ]}
                >
                    ₹{userNet.lent - userNet.owed}.00
                </Text>

                {/* Divider */}
                <View
                    style={[
                        tw`my-4`,
                        { height: 1, backgroundColor: colors.background, opacity: 0.2 },
                    ]}
                />

                {/* Owe / Get Row */}
                <View style={tw`flex-row justify-between`}>
                    {/* You Owe */}
                    <View>
                        <Text
                            style={[
                                tw`text-xs uppercase`,
                                { color: colors.background, opacity: 0.6 },
                            ]}
                        >
                            You Owe
                        </Text>
                        <Text
                            style={[
                                tw`mt-1 text-base font-semibold`,
                                { color: colors.background },
                            ]}
                        >
                            ₹{userNet.owed}.00
                        </Text>
                    </View>

                    {/* You Get */}
                    <View style={tw`items-end`}>
                        <Text
                            style={[
                                tw`text-xs uppercase`,
                                { color: colors.background, opacity: 0.6 },
                            ]}
                        >
                            You Get
                        </Text>
                        <Text
                            style={[
                                tw`mt-1 text-base font-semibold`,
                                { color: colors.primary },
                            ]}
                        >
                            ₹{userNet.lent}.00
                        </Text>
                    </View>
                </View>

                {/* Button */}
                <Pressable
                    style={[
                        tw`mt-5 py-3 rounded-full items-center`,
                        { backgroundColor: "#2A2A2A" },
                    ]}
                >
                    <Text style={tw`text-white text-sm font-medium`}>
                        View detailed analytics
                    </Text>
                </Pressable>
            </View>

            {/* Title */}
            <View style={tw`pt-4 mb-2`}>
                <Text
                    style={[
                        tw`font-semibold text-xl`,
                        { color: colors.textPrimary },
                    ]}
                >
                    Quick Actions
                </Text>
            </View>

            {/* Quick Actions */}
            <View style={[tw`mt-4 px-4 py-5 rounded-2xl`, { backgroundColor: colors.surfaceMuted }]}>

                <View style={tw`flex-row justify-between`}>

                    {/* LEFT COLUMN */}
                    <View style={tw`w-[48%]`}>
                        <QuickActionCard
                            title={`Add\nGroup`}
                            icon="add"
                            primary
                            cardBg={colors.primary}
                            iconBg="rgba(255,255,255,0.25)"
                            textColor="#000"
                            iconColor="#000"
                            onPress={() => router.push("/groups/create")}
                        />

                        <View style={tw`mt-4`}>
                            <QuickActionCard
                                title={`Remind\nFriends`}
                                icon="megaphone-outline"
                                cardBg={colors.background}
                                iconBg="#E9F9EF"
                                iconColor={colors.primary}
                                textColor={colors.textPrimary}
                                onPress={() => console.log("Remind")}
                            />
                        </View>
                    </View>

                    {/* RIGHT COLUMN */}
                    <View style={tw`w-[48%]`}>
                        <QuickActionCard
                            title={`Settle\nUp`}
                            icon="cash-outline"
                            cardBg={colors.background}
                            iconBg="#E9F9EF"
                            iconColor={colors.primary}
                            textColor={colors.textPrimary}
                            onPress={() => router.push("/groups")}
                        />

                        <View style={tw`mt-4`}>
                            <QuickActionCard
                                title={`Scan\nQR`}
                                icon="qr-code"
                                cardBg={colors.background}
                                iconBg="#E9F9EF"
                                iconColor={colors.primary}
                                textColor={colors.textPrimary}
                                onPress={() => router.push("/explore/scan-qr")}
                            />
                        </View>
                    </View>

                </View>

            </View>

            {/* ===================== */}
            {/* MY QR SECTION */}
            {/* ===================== */}
            <View style={tw`mt-12 items-center`}>
                <Text
                    style={[
                        tw`text-xl font-semibold mb-4`,
                        { color: colors.textPrimary },
                    ]}
                >
                    My Payment QR
                </Text>

                <Animated.View
                    style={[
                        tw`rounded-3xl p-5 items-center`,
                        {
                            transform: [{ scale: qrScale }],
                            backgroundColor: colors.surface,
                        },
                    ]}
                >
                    {userNet?.upiQrUrl ? (
                        <>
                            <Image
                                source={{ uri: userNet.upiQrUrl }}
                                style={{ width: 220, height: 220 }}
                                resizeMode="contain"
                            />

                            <Pressable
                                onPress={async () => {
                                    Alert.alert(
                                        "Delete QR?",
                                        "This will remove your QR image",
                                        [
                                            { text: "Cancel", style: "cancel" },
                                            {
                                                text: "Delete",
                                                style: "destructive",
                                                onPress: async () => {
                                                    await deleteUpiQr(user.id);
                                                    await fetch(`${BACKEND_URL}/api/user/upi/${user.id}`, {
                                                        method: "DELETE",
                                                    });
                                                    setUserNet(prev => ({ ...prev, upiQrUrl: null }));
                                                },
                                            },
                                        ]
                                    );
                                }}
                                style={tw`mt-4`}
                            >
                                <Text style={tw`text-red-500 text-sm`}><Ionicons name="trash-sharp" size={24} /></Text>
                            </Pressable>
                        </>
                    ) : (

                        <Pressable
                            onPress={() => router.push("/explore/upload-qr")}
                            style={[
                                tw`w-56 h-56 rounded-2xl items-center justify-center border-2 border-dashed`,
                                { borderColor: colors.textSecondary },
                            ]}
                        >
                            <Ionicons
                                name="qr-code-outline"
                                size={48}
                                color={colors.textSecondary}
                            />
                            <Text
                                style={[
                                    tw`mt-3 text-sm text-center`,
                                    { color: colors.textSecondary },
                                ]}
                            >
                                Upload your UPI QR
                            </Text>
                        </Pressable>
                    )}
                </Animated.View>
            </View>
            <View style={tw`mt-6 w-full pb-10`}>
                <Text style={tw`text-sm mb-2 text-gray-500`}>
                    UPI ID
                </Text>

                <Pressable
                    onPress={() => router.push("/explore/edit-upi")}
                    style={tw`border rounded-xl px-4 py-3 items-center`}
                >
                    <Text>
                        {userNet?.upiId || "Add your UPI ID"}
                    </Text>
                </Pressable>
            </View>


        </Animated.ScrollView>
    );
};

export default Index;
