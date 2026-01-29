import {
    View,
    Text,
    ScrollView,
    Pressable,
    Image,
    useColorScheme,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../../../constants/Colors";
import { BACKEND_URL } from "../../../../constants/Imps";
import { socket } from "../../../../lib/socket";
import { useUser } from "@clerk/clerk-expo";

const sortFeasts = (list) => {
    return [...list].sort((a, b) => {
        if (a.status === b.status) {
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        }
        return a.status ? -1 : 1;
    });
};

const GroupDetails = () => {
    const { groupId } = useLocalSearchParams();
    const { user } = useUser();
    const router = useRouter();
    const scheme = useColorScheme();
    const colors = theme[scheme ?? "light"];

    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [memberProfiles, setMemberProfiles] = useState([]);
    const [feasts, setFeasts] = useState([]);

    useEffect(() => {
        if (!groupId) return;

        const fetchGroup = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/api/groups/${groupId}`);
                const data = await res.json();
                setGroup(data);
                fetchFeasts();
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };
        const fetchFeasts = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/api/groups/${groupId}/feasts`);
                const data = await res.json();
                setFeasts(sortFeasts(data));
                console.log(data)
            } catch (e) {
                console.log("Failed to fetch feasts", e);
            }
        };


        fetchGroup();
    }, [groupId]);

    useEffect(() => {
        if (!groupId || !user?.id) return;

        socket.connect();

        socket.emit("group:join", {
            groupId,
            userId: user.id,
        });

        socket.on("feast:created", (feast) => {
            setFeasts((prev) => sortFeasts([feast, ...prev]));
        });

        socket.on("feast:item-added", ({ feastId }) => {
            setFeasts((prev) =>
                sortFeasts(
                    prev.map((f) =>
                        f._id === feastId ? { ...f, status: true } : f
                    )
                )
            );
        });

        socket.on("feast:status-updated", ({ feastId, status }) => {
            setFeasts((prev) =>
                sortFeasts(
                    prev.map((f) =>
                        f._id === feastId ? { ...f, status } : f
                    )
                )
            );
        });

        return () => {
            socket.emit("group:leave", { groupId });
            socket.off();
            socket.disconnect();
        };
    }, [groupId, user?.id]);

    useEffect(() => {
        if (!group?.members?.length) return;

        const fetchProfiles = async () => {
            try {
                const active = group.members
                    .filter((m) => m.status === "active")
                    .map((m) => m.userId);

                const results = await Promise.all(
                    active.map(async (userId) => {
                        const res = await fetch(
                            `${BACKEND_URL}/api/clerk-search/${userId}`
                        );
                        const json = await res.json();
                        return json.success ? json.data : null;
                    })
                );

                const profileMap = {};
                results.forEach((p) => {
                    if (p) profileMap[p.userId] = p;
                });

                setMemberProfiles(profileMap);
            } catch (err) {
                console.log("Failed to fetch member profiles", err);
            }
        };

        fetchProfiles();
    }, [group]);

    useEffect(() => {
        socket.on("feast:draft-created", (data) => {
            console.log("🟢 Draft feast appeared", data);

            // optional: refetch feasts
            // or optimistically add to UI
        });

        return () => {
            socket.off("feast:draft-created");
        };
    }, []);

    if (loading) {
        return (
            <View style={[tw`flex-1 items-center justify-center`, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.textSecondary }}>Loading group…</Text>
            </View>
        );
    }

    if (!group) {
        return (
            <View style={[tw`flex-1 items-center justify-center`, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.textSecondary }}>Group not found</Text>
            </View>
        );
    }

    const me = group.members.find((m) => m.userId === user.id);
    const myBalance = (me?.lent || 0) - (me?.owed || 0);

    const activeMembers = group.members.filter((m) => m.status === "active");

    return (
        <>
            <ScrollView
                style={{ backgroundColor: colors.background }}
                contentContainerStyle={tw`pb-40`}
            >
                {/* HEADER */}
                <View
                    style={[
                        tw`px-4 py-8 flex-row items-center justify-between`,
                        { borderBottomWidth: 1, borderColor: colors.border },
                    ]}
                >
                    <Pressable
                        onPress={() => router.back()}
                        style={[tw`h-10 w-10 rounded-full items-center justify-center`, { backgroundColor: colors.surface }]}
                    >
                        <Ionicons name="chevron-back" size={22} color={colors.icon} />
                    </Pressable>

                    <View style={tw`items-center`}>
                        <Text style={[tw`text-xs uppercase font-bold`, { color: colors.textMuted }]}>
                            Expense Group
                        </Text>
                        <Text style={[tw`text-lg font-extrabold`, { color: colors.textPrimary }]}>
                            {group.name}
                        </Text>
                    </View>

                    <View style={[tw`h-10 w-10 rounded-full`, { backgroundColor: colors.surface }]} />
                </View>

                {/* MEMBERS AVATARS */}
                <Pressable
                    onPress={() =>
                        router.push({
                            pathname: `/group/${groupId}/members`,
                            params: {
                                members: JSON.stringify(activeMembers),
                            },
                        })
                    }
                >

                    <View style={tw`mt-8 items-center`}>
                        <View style={tw`flex-row`}>
                            {activeMembers.slice(0, 4).map((m, i) => {
                                const profile = memberProfiles[m.userId];

                                return (
                                    <View
                                        key={m.userId}
                                        style={[
                                            tw`w-12 h-12 rounded-full overflow-hidden`,
                                            {
                                                marginLeft: i === 0 ? 0 : -12,
                                                borderWidth: 3,
                                                borderColor: colors.background,
                                                backgroundColor: colors.surfaceMuted,
                                            },
                                        ]}
                                    >
                                        {profile?.imageUrl ? (
                                            <Image
                                                source={{ uri: profile.imageUrl }}
                                                style={tw`w-full h-full`}
                                            />
                                        ) : (
                                            <View
                                                style={tw`flex-1 items-center justify-center`}
                                            >
                                                <Ionicons
                                                    name="person"
                                                    size={18}
                                                    color={colors.icon}
                                                />
                                            </View>
                                        )}
                                    </View>
                                );
                            })}

                            {activeMembers.length > 4 && (
                                <View
                                    style={[
                                        tw`w-12 h-12 rounded-full items-center justify-center`,
                                        {
                                            marginLeft: -12,
                                            backgroundColor: colors.primary,
                                            borderWidth: 3,
                                            borderColor: colors.background,
                                        },
                                    ]}
                                >
                                    <Text
                                        style={{
                                            color: colors.primaryText,
                                            fontWeight: "bold",
                                        }}
                                    >
                                        +{activeMembers.length - 4}
                                    </Text>
                                </View>
                            )}
                        </View>

                        <Text style={[tw`mt-2 text-sm`, { color: colors.textSecondary }]}>
                            {activeMembers.length} active members
                        </Text>
                    </View>
                </Pressable>


                {/* SUMMARY CARDS */}
                <View style={tw`px-4 mt-8 flex-row gap-4`}>
                    <View
                        style={[
                            tw`flex-1 rounded-xl p-4`,
                            { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
                        ]}
                    >
                        <Text style={[tw`text-[10px] uppercase font-bold`, { color: colors.textMuted }]}>
                            Total Group Spend
                        </Text>
                        <Text style={[tw`text-xl font-extrabold`, { color: colors.textPrimary }]}>
                            ₹{group.totalAmount || 0}
                        </Text>
                    </View>

                    <View
                        style={[
                            tw`flex-1 rounded-xl p-4`,
                            { backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.primary },
                        ]}
                    >
                        <Text style={[tw`text-[10px] uppercase font-bold`, { color: colors.primary }]}>
                            Your Balance
                        </Text>
                        <Text
                            style={[
                                tw`text-xl font-extrabold`,
                                { color: myBalance >= 0 ? colors.success : colors.danger },
                            ]}
                        >
                            {myBalance >= 0 ? "+" : "-"}₹{Math.abs(myBalance)}
                        </Text>
                    </View>
                </View>

                <View style={tw`px-4 mt-10`}>
                    <Text style={[tw`text-sm font-bold uppercase mb-3`, { color: colors.textMuted }]}>
                        Feasts
                    </Text>

                    {feasts.length === 0 ? (
                        <View
                            style={[
                                tw`rounded-xl p-4`,
                                { backgroundColor: colors.surfaceMuted, borderWidth: 1, borderColor: colors.border },
                            ]}
                        >
                            <Text style={{ color: colors.textSecondary }}>
                                No feasts added yet.
                            </Text>
                        </View>
                    ) : (
                        feasts.map((feast) => (
                            <Pressable
                                key={feast._id}
                                onPress={() => {
                                    if (feast.status === "draft") {
                                        // 🔴 Draft → live collaboration page
                                        router.push({
                                            pathname: `/group/${groupId}/add-feast`,
                                            params: { feastId: feast._id },
                                        });
                                    } else {
                                        // 🟢 Open / settled → read-only details page
                                        router.push({
                                            pathname: `/group/${groupId}/feast/${feast._id}`,
                                        });
                                    }
                                }}
                                style={[
                                    tw`mb-3 rounded-xl p-4 flex-row items-center justify-between`,
                                    {
                                        backgroundColor:
                                            feast.status === "draft"
                                                ? colors.surface
                                                : colors.primarySoft,
                                        borderWidth: 1,
                                        borderColor:
                                            feast.status === "draft"
                                                ? colors.border
                                                : colors.primary,
                                    },
                                ]}
                            >
                                <View>
                                    <Text style={[tw`font-bold`, { color: colors.textPrimary }]}>
                                        {feast.title}
                                    </Text>

                                    {feast.status && (
                                        <Text style={[tw`text-xs mt-1`, { color: colors.primary }]}>
                                            ● Active now
                                        </Text>
                                    )}
                                </View>

                                <Ionicons
                                    name="chevron-forward"
                                    size={18}
                                    color={colors.icon}
                                />
                            </Pressable>
                        ))
                    )}
                </View>
            </ScrollView>

            {/* BOTTOM ACTION BAR */}
            <View
                style={[
                    tw`absolute bottom-0 left-0 right-0 px-4 py-4 flex-row`,
                    { backgroundColor: colors.background },
                ]}
            >
                <Pressable
                    onPress={() => router.push(`/group/${groupId}/settle`)}
                    style={[
                        tw`h-14 rounded-full items-center justify-center`,
                        {
                            flexGrow: 1,
                            backgroundColor: colors.surface,
                            borderWidth: 1,
                            borderColor: colors.border,
                        },
                    ]}
                >
                    <Text style={[tw`font-bold`, { color: colors.textPrimary }]}>
                        Settle Up
                    </Text>
                </Pressable>

                <View style={tw`w-3`} />

                <Pressable
                    onPress={async () => {
                        try {
                            const res = await fetch(
                                `${BACKEND_URL}/api/groups/${groupId}/feasts/draft`,
                                {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                        createdBy: user.id,
                                        title: "Draft Feast",
                                    }),
                                }
                            );

                            const data = await res.json();
                            if (!data.success) {
                                throw new Error("Failed to create feast");
                            }

                            const feastId = data.feastId;

                            // 2️⃣ Notify group members (socket)
                            socket.emit("feast:draft-created", {
                                groupId,
                                feastId,
                                createdBy: user.id,
                            });

                            // 3️⃣ Navigate to AddFeast page WITH feastId
                            router.push({
                                pathname: `/group/${groupId}/add-feast`,
                                params: { feastId },
                            });
                        } catch (err) {
                            console.error("Add feast failed", err);
                        }
                    }}
                    style={[
                        tw`h-14 rounded-full items-center justify-center`,
                        {
                            flexGrow: 1.5,
                            backgroundColor: colors.primary,
                        },
                    ]}
                >
                    <Text style={[tw`font-bold`, { color: colors.primaryText }]}>
                        Add Feast
                    </Text>
                </Pressable>
            </View>

        </>
    );
};

export default GroupDetails;
