import {
    View,
    Text,
    TextInput,
    Pressable,
    useColorScheme,
    Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import tw from "twrnc";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { theme } from "../../../constants/Colors";
import { BACKEND_URL } from "../../../constants/Imps";
import { Image, FlatList } from "react-native";

const CreateGroup = () => {
    const { user } = useUser();
    const router = useRouter();
    const scheme = useColorScheme();
    const colors = theme[scheme ?? "light"];

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [friends, setFriends] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);

    useEffect(() => {
        if (!user?.id) return;

        const fetchFriends = async () => {
            try {
                const res = await fetch(
                    `${BACKEND_URL}/api/friend-request/${user?.id}`
                );
                const json = await res.json();

                const accepted = json.data.friendsList.filter(
                    (f) => f.requestStatus === "accepted"
                );

                // fetch user profiles
                const profiles = await Promise.all(
                    accepted.map(async (f) => {
                        const r = await fetch(
                            `${BACKEND_URL}/api/clerk-search/${f.friendUserId}`
                        );
                        const d = await r.json();
                        return d.data;
                    })
                );


                setFriends(profiles);
            } catch (err) {
                console.log(err);
            }
        };

        fetchFriends();
    }, [user?.id]);

    const toggleMember = (userId) => {
        setSelectedMembers((prev) => {
            if (prev.includes(userId)) {
                // remove if already selected
                return prev.filter((id) => id !== userId);
            } else {
                // add if not selected
                return [...prev, userId];
            }
        });
    };



    const handleCreate = async () => {
        if (!name.trim()) {
            Alert.alert("Group name is required");
            return;
        }

        try {
            setLoading(true);

            // 1️⃣ Create group
            const res = await fetch(`${BACKEND_URL}/api/groups`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim(),
                    userId: user.id,
                }),
            });

            const group = await res.json();
            if (!res.ok) throw new Error(group.error);

            // 2️⃣ Add selected members
            await Promise.all(
                selectedMembers.map((memberId) =>
                    fetch(
                        `${BACKEND_URL}/api/groups/${group._id}/members`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ userId: memberId }),
                        }
                    )
                )
            );

            // 3️⃣ Go to group details
            router.replace(`/group/${group._id}`);
        } catch (err) {
            Alert.alert("Error", err.message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <View
            style={[
                tw`flex-1 px-5 pt-8`,
                { backgroundColor: colors.background },
            ]}
        >
            <Text
                style={[
                    tw`text-2xl font-extrabold mb-6`,
                    { color: colors.textPrimary },
                ]}
            >
                Create Group
            </Text>

            {/* GROUP NAME */}
            <View style={tw`mb-5`}>
                <Text
                    style={[
                        tw`mb-1 text-sm font-semibold`,
                        { color: colors.textSecondary },
                    ]}
                >
                    Group Name
                </Text>
                <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Trip to Goa"
                    placeholderTextColor={colors.textMuted}
                    style={[
                        tw`h-12 px-4 rounded-xl`,
                        {
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                            borderWidth: 1,
                            color: colors.textPrimary,
                        },
                    ]}
                />
            </View>

            {/* DESCRIPTION */}
            <View style={tw`mb-8`}>
                <Text
                    style={[
                        tw`mb-1 text-sm font-semibold`,
                        { color: colors.textSecondary },
                    ]}
                >
                    Description (optional)
                </Text>
                <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Friends trip expenses"
                    placeholderTextColor={colors.textMuted}
                    multiline
                    style={[
                        tw`min-h-[80px] px-4 py-3 rounded-xl`,
                        {
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                            borderWidth: 1,
                            color: colors.textPrimary,
                        },
                    ]}
                />
            </View>
            {/* ADD MEMBERS */}
            <View style={tw`mb-8`}>
                <Text
                    style={[
                        tw`mb-3 text-sm font-semibold`,
                        { color: colors.textSecondary },
                    ]}
                >
                    Add Members
                </Text>

                <View style={tw`flex-row items-center`}>
                    {friends.slice(0, 4).map((friend) => {
                        const selected = selectedMembers.includes(friend.userId);

                        return (
                            <Pressable
                                key={friend.userId}
                                onPress={() => toggleMember(friend.userId)}
                                style={tw`mr-3`}
                            >
                                <View
                                    style={[
                                        tw`rounded-full p-[2px]`,
                                        {
                                            borderColor: selected
                                                ? colors.primary
                                                : "transparent",
                                            borderWidth: 2,
                                        },
                                    ]}
                                >
                                    <Image
                                        source={{ uri: friend.imageUrl }}
                                        style={tw`w-12 h-12 rounded-full`}
                                    />
                                </View>
                            </Pressable>
                        );
                    })}

                    {friends.length > 4 && (
                        <View
                            style={[
                                tw`w-12 h-12 rounded-full items-center justify-center`,
                                { backgroundColor: colors.surfaceMuted },
                            ]}
                        >
                            <Text
                                style={[
                                    tw`font-semibold`,
                                    { color: colors.textSecondary },
                                ]}
                            >
                                +{friends.length - 4}
                            </Text>
                        </View>
                    )}
                </View>
            </View>


            {/* CREATE BUTTON */}
            <Pressable
                onPress={handleCreate}
                disabled={loading}
                style={[
                    tw`h-14 rounded-full items-center justify-center`,
                    {
                        backgroundColor: loading
                            ? colors.primarySoft
                            : colors.primary,
                    },
                ]}
            >
                <Text
                    style={[
                        tw`text-lg font-bold`,
                        { color: colors.primaryText },
                    ]}
                >
                    {loading ? "Creating..." : "Create Group"}
                </Text>
            </Pressable>
        </View>
    );
};

export default CreateGroup;
