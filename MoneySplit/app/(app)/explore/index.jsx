import {
    View,
    Text,
    Image,
    useColorScheme,
    TouchableOpacity,
    Pressable,
} from "react-native";
import React, { useEffect } from "react";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../../constants/Colors";

const Index = () => {
    const { user, isLoaded } = useUser();
    const { isSignedIn } = useAuth();
    const router = useRouter();
    const scheme = useColorScheme();
    const colors = theme[scheme ?? "light"];

    useEffect(() => {
        if (!isLoaded || !user?.id) return;
        // fetch groups later
    }, [isLoaded, user?.id]);

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
        <View style={[tw`p-4`, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={tw`flex-row justify-between items-center`}>
                {/* Profile image */}
                <Pressable onPress={() => {
                    router.push('/profile')
                }}>
                    <Image
                        source={{ uri: user.imageUrl }}
                        style={tw`w-10 h-10 rounded-full`}
                    />
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

            {/* Title */}
            <View style={tw`pt-4`}>
                <Text
                    style={[
                        tw`font-semibold text-3xl`,
                        { color: colors.textPrimary },
                    ]}
                >
                    Groups
                </Text>
            </View>
            <View style={tw`flex-1`}>
                {/* Absolute top button */}
                <View style={tw`absolute top-147 left-0 right-0 items-center z-10`}>
                    <Pressable
                        style={[
                            tw`px-4 py-4 rounded-full flex-row items-center justify-center`,
                            {
                                width: "90%",
                                backgroundColor: colors.primary,
                            },
                        ]}
                    >
                        <Ionicons
                            name="add"
                            size={28}
                            color={colors.primaryText}
                        />
                        <Text
                            style={[
                                tw`ml-2 text-base font-bold`,
                                { color: colors.primaryText },
                            ]}
                        >
                            Create New Group
                        </Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
};

export default Index;
