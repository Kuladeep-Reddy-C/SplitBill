import {
    View,
    Text,
    Pressable,
    ScrollView,
    useColorScheme,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import tw from "twrnc";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { theme } from "../../../constants/Colors";
import { BACKEND_URL } from "../../../constants/Imps";

const Groups = () => {
    const { user } = useUser();
    const router = useRouter();
    const scheme = useColorScheme();
    const colors = theme[scheme ?? "light"];
    const [groups, setGroups] = useState([]);
    const [loadingGroups, setLoadingGroups] = useState(true);


    const [net, setNet] = useState(null);

    useEffect(() => {
        if (!user?.id) return;

        const fetchGroups = async () => {
            try {
                const res = await fetch(
                    `${BACKEND_URL}/api/groups/user/${user.id}`
                );
                const data = await res.json();
                setGroups(data);
            } catch (err) {
                console.log(err);
            } finally {
                setLoadingGroups(false);
            }
        };
        const fetchNet = async () => {
            const res = await fetch(`${BACKEND_URL}/api/net/${user.id}`);
            const data = await res.json();
            setNet(data);
        };

        fetchNet();
        fetchGroups();
    }, [user?.id]);

    if (!net) {
        return (
            <View
                style={[
                    tw`flex-1 items-center justify-center`,
                    { backgroundColor: colors.background },
                ]}
            >
                <Text style={{ color: colors.textSecondary }}>Loading…</Text>
            </View>
        );
    }

    const totalBalance = net.lent - net.owed;
    const isPositive = totalBalance >= 0;

    return (
        <ScrollView
            style={{ backgroundColor: colors.background }}
            contentContainerStyle={tw`pb-32`}
        >
            {/* HEADER */}
            <View style={tw`px-4 pt-4 flex-row justify-between items-center`}>
                <Text
                    style={[
                        tw`text-2xl font-extrabold`,
                        { color: colors.textPrimary },
                    ]}
                >
                    Groups
                </Text>

                <View style={tw`flex-row gap-3`}>
                    <Pressable
                        style={[
                            tw`h-10 w-10 rounded-full items-center justify-center`,
                            { backgroundColor: colors.surface },
                        ]}
                    >
                        <Ionicons
                            name="search-outline"
                            size={20}
                            color={colors.icon}
                        />
                    </Pressable>

                    <Pressable
                        style={[
                            tw`h-10 w-10 rounded-full items-center justify-center`,
                            { backgroundColor: colors.surface },
                        ]}
                    >
                        <Ionicons
                            name="notifications-outline"
                            size={20}
                            color={colors.icon}
                        />
                    </Pressable>
                </View>
            </View>

            {/* CREATE GROUP CTA */}
            <View style={tw`px-4 py-4`}>
                <Pressable
                    onPress={() => router.push("/group/create-group")}
                    style={[
                        tw`h-14 rounded-full flex-row items-center justify-center`,
                        { backgroundColor: colors.primary },
                    ]}
                >

                    <Ionicons
                        name="people-outline"
                        size={20}
                        color={colors.primaryText}
                    />
                    <Text
                        style={[
                            tw`ml-2 text-lg font-bold`,
                            { color: colors.primaryText },
                        ]}
                    >
                        Create New Group
                    </Text>
                </Pressable>
            </View>

            {/* SUMMARY CARD */}
            <View style={tw`px-4`}>
                <View
                    style={[
                        tw`rounded-2xl p-5`,
                        {
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                            borderWidth: 1,
                        },
                    ]}
                >
                    <Text
                        style={[
                            tw`text-xs uppercase font-semibold`,
                            { color: colors.textSecondary },
                        ]}
                    >
                        Total Balance
                    </Text>

                    <Text
                        style={[
                            tw`text-4xl font-extrabold mt-1`,
                            {
                                color: isPositive ? colors.success : colors.danger,
                            },
                        ]}
                    >
                        {isPositive ? "+" : "-"}₹{Math.abs(totalBalance)}
                    </Text>

                    <View
                        style={[
                            tw`my-4 h-px`,
                            { backgroundColor: colors.border },
                        ]}
                    />

                    <View style={tw`flex-row justify-between`}>
                        <View>
                            <Text
                                style={[
                                    tw`text-xs uppercase`,
                                    { color: colors.textSecondary },
                                ]}
                            >
                                You owe
                            </Text>
                            <Text
                                style={[
                                    tw`text-lg font-bold`,
                                    { color: colors.textPrimary },
                                ]}
                            >
                                ₹{net.owed}
                            </Text>
                        </View>
                        <View style={tw`items-end`}>
                            <Text
                                style={[
                                    tw`text-xs uppercase`,
                                    { color: colors.textSecondary },
                                ]}
                            >
                                You are owed
                            </Text>
                            <Text
                                style={[
                                    tw`text-lg font-bold`,
                                    { color: colors.textPrimary },
                                ]}
                            >
                                ₹{net.lent}
                            </Text>
                        </View>

                    </View>
                </View>
            </View>

            {/* ACTIVE GROUPS HEADER */}
            <View style={tw`px-4 pt-6 pb-2 flex-row justify-between items-center`}>
                <Text
                    style={[
                        tw`text-xl font-bold`,
                        { color: colors.textPrimary },
                    ]}
                >
                    Active Groups
                </Text>

                <Text
                    style={[
                        tw`text-sm font-bold`,
                        { color: colors.primary },
                    ]}
                >
                    See all
                </Text>
            </View>

            {/* ACTIVE GROUP CARD */}
            <View style={tw`px-4`}>
                {loadingGroups ? (
                    <Text style={{ color: colors.textSecondary }}>
                        Loading groups…
                    </Text>
                ) : groups.length === 0 ? (
                    <Text style={{ color: colors.textSecondary }}>
                        No groups yet. Create one!
                    </Text>
                ) : (
                    groups.map((group) => {
                        // find current user's member record
                        const me = group.members.find(
                            (m) => m.userId === user.id
                        );

                        const myBalance =
                            (me?.lent || 0) - (me?.owed || 0);

                        const isOwed = myBalance < 0;

                        return (
                            <Pressable
                                key={group._id}
                                onPress={() =>
                                    router.push(`/group/${group._id}`)
                                }
                                style={[
                                    tw`mb-4 rounded-xl p-4 flex-row justify-between items-center`,
                                    {
                                        backgroundColor: colors.surface,
                                        borderColor: colors.border,
                                        borderWidth: 1,
                                    },
                                ]}
                            >
                                <View>
                                    <View
                                        style={[
                                            tw`mb-1 px-2 py-0.5 rounded-full self-start`,
                                            {
                                                backgroundColor:
                                                    isOwed
                                                        ? colors.dangerSoft
                                                        : colors.successSoft,
                                            },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                tw`text-[10px] font-bold uppercase`,
                                                {
                                                    color: isOwed
                                                        ? colors.danger
                                                        : colors.success,
                                                },
                                            ]}
                                        >
                                            {group.status}
                                        </Text>
                                    </View>

                                    <Text
                                        style={[
                                            tw`text-lg font-bold`,
                                            { color: colors.textPrimary },
                                        ]}
                                    >
                                        {group.name}
                                    </Text>

                                    <Text
                                        style={[
                                            tw`text-sm`,
                                            { color: colors.textSecondary },
                                        ]}
                                    >
                                        {myBalance < 0
                                            ? "You owe "
                                            : "You are owed "}
                                        <Text
                                            style={{
                                                color:
                                                    myBalance < 0
                                                        ? colors.danger
                                                        : colors.success,
                                                fontWeight: "bold",
                                            }}
                                        >
                                            ₹{Math.abs(myBalance)}
                                        </Text>
                                    </Text>
                                </View>

                                <View
                                    style={[
                                        tw`h-10 px-5 rounded-full items-center justify-center`,
                                        { backgroundColor: colors.primary },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            tw`font-bold`,
                                            { color: colors.primaryText },
                                        ]}
                                    >
                                        Open
                                    </Text>
                                </View>
                            </Pressable>
                        );
                    })
                )}
            </View>
        </ScrollView>
    );
};

export default Groups;