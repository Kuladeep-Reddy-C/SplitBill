import {
    View,
    Text,
    TouchableOpacity,
    useColorScheme,
    TouchableWithoutFeedback,
    Keyboard,
    Image,
    ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../../constants/Colors";
import { useRouter } from "expo-router";
import { BACKEND_URL } from "../../../constants/Imps";
import { useUser } from "@clerk/clerk-expo";

const Notifications = () => {
    const scheme = useColorScheme();
    const colors = theme[scheme ?? "light"];
    const router = useRouter();
    const { user, isLoaded } = useUser();

    const [requests, setRequests] = useState([]);
    const [loadingId, setLoadingId] = useState(null);

    /* ---------------- FETCH INCOMING REQUESTS ---------------- */
    useEffect(() => {
        if (!isLoaded || !user) return;

        const fetchIncoming = async () => {
            try {
                // 1️⃣ get req-rec
                const res = await fetch(
                    `${BACKEND_URL}/api/friend-request/${user.id}?status=req-rec`
                );
                const json = await res.json();
                const list = json?.data?.friendsList ?? [];

                // 2️⃣ fetch clerk user info for each incoming user
                const enriched = await Promise.all(
                    list.map(async (item) => {
                        const userRes = await fetch(
                            `${BACKEND_URL}/api/clerk-search/${item.friendUserId}`
                        );
                        const userJson = await userRes.json();

                        return {
                            friendUserId: item.friendUserId,
                            ...userJson.data,
                        };
                    })
                );

                setRequests(enriched);
            } catch (err) {
                console.log("Notification fetch error:", err);
            }
        };

        fetchIncoming();
    }, [isLoaded, user]);

    /* ---------------- ACCEPT / REJECT ---------------- */
    const handleAction = async (friendUserId, action) => {
        setLoadingId(friendUserId);

        try {
            await fetch(`${BACKEND_URL}/api/friend-request`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.id,
                    friendUserId,
                    action,
                }),
            });

            // remove immediately from UI
            setRequests((prev) =>
                prev.filter((r) => r.friendUserId !== friendUserId)
            );
        } catch (err) {
            console.log("Action error:", err);
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ flexGrow: 1 }}
                style={{ backgroundColor: colors.background }}
            >
                {/* Header */}
                <View style={tw`flex-row items-center px-4 pt-3 mb-4`}>
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color={colors.icon}
                        onPress={() => router.back()}
                    />
                    <Text
                        style={[
                            tw`ml-3 text-2xl font-bold`,
                            { color: colors.textPrimary },
                        ]}
                    >
                        Notifications
                    </Text>
                </View>

                {/* Empty State */}
                {requests.length === 0 && (
                    <View style={tw`flex-1 items-center justify-center mt-20`}>
                        <Ionicons
                            name="people-outline"
                            size={56}
                            color={colors.textMuted}
                        />
                        <Text
                            style={[
                                tw`mt-4 text-lg font-semibold`,
                                { color: colors.textSecondary },
                            ]}
                        >
                            No friend requests
                        </Text>
                        <Text
                            style={[
                                tw`mt-1 text-sm text-center px-6`,
                                { color: colors.textMuted },
                            ]}
                        >
                            You’re all caught up 🎉
                        </Text>
                    </View>
                )}

                {/* Requests List */}
                {requests.map((item) => (
                    <View
                        key={item.friendUserId}
                        style={[
                            tw`flex-row items-center justify-between mx-4 mb-4 p-3 rounded-xl`,
                            {
                                backgroundColor: colors.surface,
                                borderWidth: 1,
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        {/* Avatar + Info */}
                        <View style={tw`flex-row items-center flex-1`}>
                            {item.imageUrl ? (
                                <Image
                                    source={{ uri: item.imageUrl }}
                                    style={tw`w-12 h-12 rounded-full`}
                                />
                            ) : (
                                <Ionicons
                                    name="person-circle"
                                    size={48}
                                    color={colors.icon}
                                />
                            )}

                            <View style={tw`ml-3`}>
                                <Text
                                    style={[
                                        tw`font-semibold`,
                                        { color: colors.textPrimary },
                                    ]}
                                >
                                    {item.fullName}
                                </Text>

                                <Text
                                    style={[
                                        tw`text-sm`,
                                        { color: colors.textMuted },
                                    ]}
                                >
                                    @{item.username || "No UserName"}
                                </Text>
                            </View>
                        </View>

                        {/* Actions */}
                        <View style={tw`flex-row items-center`}>
                            {/* ADD */}
                            <TouchableOpacity
                                disabled={loadingId === item.friendUserId}
                                onPress={() =>
                                    handleAction(item.friendUserId, "accept")
                                }
                                style={[
                                    tw`px-4 py-2 rounded-full mr-2`,
                                    { backgroundColor: colors.primary },
                                ]}
                            >
                                <Text
                                    style={[
                                        tw`font-semibold`,
                                        { color: colors.primaryText },
                                    ]}
                                >
                                    Add
                                </Text>
                            </TouchableOpacity>

                            {/* REJECT */}
                            <TouchableOpacity
                                disabled={loadingId === item.friendUserId}
                                onPress={() =>
                                    handleAction(item.friendUserId, "reject")
                                }
                                style={[
                                    tw`px-4 py-2 rounded-full`,
                                    { backgroundColor: colors.dangerSoft },
                                ]}
                            >
                                <Text
                                    style={[
                                        tw`font-semibold`,
                                        { color: colors.danger },
                                    ]}
                                >
                                    Reject
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </TouchableWithoutFeedback>
    );
};

export default Notifications;
