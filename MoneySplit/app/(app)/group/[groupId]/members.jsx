import {
    View,
    Text,
    ScrollView,
    Image,
    ActivityIndicator,
    useColorScheme,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";
import { BACKEND_URL } from "../../../../constants/Imps";
import { theme } from "../../../../constants/Colors";

const MembersScreen = () => {
    const { members } = useLocalSearchParams();
    const router = useRouter();
    const scheme = useColorScheme();
    const colors = theme[scheme ?? "light"];

    const parsedMembers = members ? JSON.parse(members) : [];

    const [profiles, setProfiles] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                const results = await Promise.all(
                    parsedMembers.map(async (m) => {
                        const res = await fetch(
                            `${BACKEND_URL}/api/clerk-search/${m.userId}`
                        );
                        const json = await res.json();
                        return json.success ? json.data : null;
                    })
                );

                const map = {};
                results.forEach((p) => {
                    if (p) map[p.userId] = p;
                });

                setProfiles(map);
            } catch (err) {
                console.log("Error fetching members", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfiles();
    }, []);

    if (loading) {
        return (
            <View
                style={[
                    tw`flex-1 items-center justify-center`,
                    { backgroundColor: colors.background },
                ]}
            >
                <ActivityIndicator />
            </View>
        );
    }

    return (
        <ScrollView
            style={{ backgroundColor: colors.background }}
            contentContainerStyle={tw`p-4`}
        >
            {/* HEADER */}
            <View style={tw`flex-row items-center mb-6`}>
                <Ionicons
                    name="chevron-back"
                    size={24}
                    color={colors.icon}
                    onPress={() => router.back()}
                />
                <Text
                    style={[
                        tw`ml-2 text-lg font-extrabold`,
                        { color: colors.textPrimary },
                    ]}
                >
                    Members
                </Text>
            </View>

            {/* MEMBERS LIST */}
            {parsedMembers.map((member) => {
                const profile = profiles[member.userId];

                return (
                    <View
                        key={member.userId}
                        style={[
                            tw`flex-row items-center p-4 rounded-xl mb-3`,
                            {
                                backgroundColor: colors.surface,
                                borderWidth: 1,
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        {/* Avatar */}
                        <View
                            style={[
                                tw`w-12 h-12 rounded-full overflow-hidden items-center justify-center`,
                                { backgroundColor: colors.surfaceMuted },
                            ]}
                        >
                            {profile?.imageUrl ? (
                                <Image
                                    source={{ uri: profile.imageUrl }}
                                    style={tw`w-full h-full`}
                                />
                            ) : (
                                <Ionicons
                                    name="person"
                                    size={20}
                                    color={colors.icon}
                                />
                            )}
                        </View>

                        {/* Info */}
                        <View style={tw`ml-4 flex-1`}>
                            <Text
                                style={[
                                    tw`font-bold`,
                                    { color: colors.textPrimary },
                                ]}
                            >
                                {profile?.fullName || "Unknown User"}
                            </Text>

                            <Text
                                style={[
                                    tw`text-xs`,
                                    { color: colors.textSecondary },
                                ]}
                            >
                                {profile?.email}
                            </Text>

                            <Text
                                style={[
                                    tw`text-[11px] mt-1 uppercase`,
                                    { color: colors.textMuted },
                                ]}
                            >
                                {member.role}
                            </Text>
                        </View>

                        {/* Balance */}
                        <View>
                            <Text
                                style={{
                                    color:
                                        member.lent - member.owed >= 0
                                            ? colors.success
                                            : colors.danger,
                                    fontWeight: "bold",
                                }}
                            >
                                ₹{member.lent - member.owed}
                            </Text>
                        </View>
                    </View>
                );
            })}
        </ScrollView>
    );
};

export default MembersScreen;
