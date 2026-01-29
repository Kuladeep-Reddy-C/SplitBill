import {
    View,
    Text,
    TextInput,
    Pressable,
    FlatList,
    useColorScheme,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import tw from "twrnc";
import { theme } from "../../../../constants/Colors";
import { BACKEND_URL } from "../../../../constants/Imps";
import { socket } from "../../../../lib/socket";

const AddFeast = () => {
    const { feastId, groupId } = useLocalSearchParams();
    const { user } = useUser();
    const router = useRouter();

    const scheme = useColorScheme();
    const colors = theme[scheme ?? "light"];

    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [isCreator, setIsCreator] = useState(false);

    /* ===============================
       FETCH FEAST META (creator check)
    =============================== */
    useEffect(() => {
        if (!groupId || !feastId || !user) return;

        const fetchFeastMeta = async () => {
            try {
                const res = await fetch(
                    `${BACKEND_URL}/api/groups/${groupId}/feasts`
                );
                const feasts = await res.json();

                const feast = feasts.find(
                    (f) => f.feastId.toString() === feastId
                );

                if (feast?.createdBy === user.id) {
                    setIsCreator(true);
                }
            } catch (err) {
                console.error("Failed to fetch feast meta", err);
            }
        };

        fetchFeastMeta();
    }, [groupId, feastId, user?.id]);

    /* ===============================
       SOCKET LIFECYCLE
    =============================== */
    useEffect(() => {
        if (!feastId || !user) return;

        socket.connect();

        socket.emit("feast:join", {
            feastId,
            user: {
                id: user.id,
                name: user.fullName,
            },
        });

        socket.on("chat:system", (msg) => {
            setMessages((prev) => [
                ...prev,
                {
                    id: `sys-${Date.now()}-${Math.random()}`,
                    type: "system",
                    ...msg,
                },
            ]);
        });

        socket.on("chat:message", (msg) => {
            setMessages((prev) => [
                ...prev,
                {
                    id: `msg-${Date.now()}-${Math.random()}`,
                    type: "user",
                    ...msg,
                },
            ]);
        });

        // 🔒 FEAST OPENED → REDIRECT EVERYONE
        socket.on("feast:opened", ({ feastId: openedId }) => {
            if (openedId === feastId) {
                router.replace(
                    `/group/${groupId}/feast/${feastId}`
                );
            }
        });

        return () => {
            socket.off("chat:system");
            socket.off("chat:message");
            socket.off("feast:opened");
            socket.disconnect();
        };
    }, [feastId]);

    /* ===============================
       SEND CHAT MESSAGE
    =============================== */
    const sendMessage = () => {
        if (!text.trim()) return;

        socket.emit("chat:message", {
            scope: "feast",
            id: feastId,
            user: {
                id: user.id,
                name: user.fullName,
            },
            text,
        });

        setText("");
    };

    /* ===============================
       SAVE FEAST (CREATOR ONLY)
    =============================== */
    const saveFeast = async () => {
        try {
            const res = await fetch(
                `${BACKEND_URL}/api/groups/${groupId}/feasts/${feastId}/open`,
                { method: "PATCH" }
            );

            const data = await res.json();
            if (!data.success) {
                throw new Error("Failed to open feast");
            }

            // notify all users
            socket.emit("feast:opened", {
                groupId,
                feastId,
            });

            // redirect creator immediately
            router.replace(
                `/group/${groupId}/feast/${feastId}`
            );
        } catch (err) {
            console.error("Save feast failed", err);
        }
    };

    /* ===============================
       RENDER
    =============================== */
    return (
        <View style={[tw`flex-1`, { backgroundColor: colors.background }]}>
            {/* HEADER */}
            <View
                style={[
                    tw`px-4 py-4 flex-row items-center justify-between`,
                    { borderBottomWidth: 1, borderColor: colors.border },
                ]}
            >
                <View>
                    <Text style={[tw`text-lg font-bold`, { color: colors.textPrimary }]}>
                        Draft Feast
                    </Text>
                    <Text style={[tw`text-xs`, { color: colors.textMuted }]}>
                        Live collaboration
                    </Text>
                </View>

                {isCreator && (
                    <Pressable
                        onPress={saveFeast}
                        style={[
                            tw`px-4 py-2 rounded-full`,
                            { backgroundColor: colors.primary },
                        ]}
                    >
                        <Text style={{ color: colors.primaryText, fontWeight: "bold" }}>
                            Save
                        </Text>
                    </Pressable>
                )}
            </View>

            {/* CHAT */}
            <FlatList
                data={messages}
                keyExtractor={(_, index) => index.toString()}
                contentContainerStyle={{ padding: 16 }}
                renderItem={({ item }) => {
                    if (item.type === "system") {
                        return (
                            <Text
                                style={{
                                    textAlign: "center",
                                    marginVertical: 6,
                                    color: colors.textMuted,
                                    fontSize: 12,
                                }}
                            >
                                {item.message}
                            </Text>
                        );
                    }

                    const isMe = item.user?.id === user.id;

                    return (
                        <View
                            style={{
                                alignSelf: isMe ? "flex-end" : "flex-start",
                                backgroundColor: isMe
                                    ? colors.primary
                                    : colors.surface,
                                padding: 10,
                                borderRadius: 12,
                                marginBottom: 8,
                                maxWidth: "75%",
                            }}
                        >
                            {!isMe && (
                                <Text style={{ fontSize: 11, color: colors.textMuted }}>
                                    {item.user.name}
                                </Text>
                            )}

                            <Text
                                style={{
                                    color: isMe
                                        ? colors.primaryText
                                        : colors.textPrimary,
                                }}
                            >
                                {item.text}
                            </Text>
                        </View>
                    );
                }}
            />

            {/* INPUT */}
            <View
                style={[
                    tw`flex-row items-center px-3 py-2`,
                    { borderTopWidth: 1, borderColor: colors.border },
                ]}
            >
                <TextInput
                    value={text}
                    onChangeText={setText}
                    placeholder="Type something..."
                    placeholderTextColor={colors.textMuted}
                    style={[
                        tw`flex-1 px-3 py-2 rounded-full`,
                        {
                            backgroundColor: colors.surface,
                            color: colors.textPrimary,
                        },
                    ]}
                />

                <Pressable
                    onPress={sendMessage}
                    style={[
                        tw`ml-2 px-4 py-2 rounded-full`,
                        { backgroundColor: colors.primary },
                    ]}
                >
                    <Text style={{ color: colors.primaryText, fontWeight: "bold" }}>
                        Send
                    </Text>
                </Pressable>
            </View>
        </View>
    );
};

export default AddFeast;
