import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Modal,
    useColorScheme,
} from "react-native";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../constants/Imps";
import { useUser } from "@clerk/clerk-expo";
import { theme } from "../constants/Colors";

const UserPreviewCard = ({ visible, onClose, oppUser }) => {
    const { user, isLoaded } = useUser();
    const colorScheme = useColorScheme();
    const colors = theme[colorScheme ?? "light"];

    const [requestStatus, setRequestStatus] = useState("");
    const [loading, setLoading] = useState(false);

    /* ---------------- FETCH FRIEND STATUS ---------------- */
    useEffect(() => {
        if (!visible || !isLoaded || !user || !oppUser) return;

        const fetchFriendStatus = async () => {
            try {
                const res = await fetch(
                    `${BACKEND_URL}/api/friend-request/${user.id}`
                );
                const json = await res.json();

                const friendsList = json?.data?.friendsList ?? [];

                const relation = friendsList.find(
                    (f) => f.friendUserId === oppUser.userId
                );

                setRequestStatus(relation?.requestStatus ?? "");
            } catch (err) {
                console.log("Friend fetch error:", err);
            }
        };

        fetchFriendStatus();
    }, [visible, isLoaded, user, oppUser]);

    /* ---------------- BUTTON LABEL ---------------- */
    const getButtonText = () => {
        switch (requestStatus) {
            case "":
                return "Send Friend Request";
            case "req-sent":
                return "Cancel Request";
            case "req-rec":
                return "Accept Request";
            case "accepted":
                return "Friends";
            default:
                return "Send Friend Request";
        }
    };

    /* ---------------- ACTION HANDLER ---------------- */
    const handleFriendRequest = async () => {
        if (loading) return;
        setLoading(true);

        try {
            /* SEND REQUEST */
            if (requestStatus === "") {
                await fetch(`${BACKEND_URL}/api/friend-request`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        fromUserId: user.id,
                        toUserId: oppUser.userId,
                    }),
                });
                setRequestStatus("req-sent");
            }

            /* CANCEL REQUEST */
            else if (requestStatus === "req-sent") {
                await fetch(`${BACKEND_URL}/api/friend-request`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId: user.id,
                        friendUserId: oppUser.userId,
                        action: "cancel",
                    }),
                });
                setRequestStatus("");
            }

            /* ACCEPT REQUEST */
            else if (requestStatus === "req-rec") {
                await fetch(`${BACKEND_URL}/api/friend-request`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId: user.id,
                        friendUserId: oppUser.userId,
                        action: "accept",
                    }),
                });
                setRequestStatus("accepted");
            }
        } catch (err) {
            console.log("Friend action error:", err);
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- HARD GUARD ---------------- */
    if (!visible || !oppUser || !isLoaded || !user) return null;

    const imageUri = oppUser?.imageUrl ?? null;

    return (
        <Modal visible={visible} transparent animationType="fade">
            {/* Overlay */}
            <TouchableOpacity
                activeOpacity={1}
                onPress={onClose}
                style={tw`flex-1 bg-black/50 justify-center items-center`}
            >
                {/* Card */}
                <TouchableOpacity
                    activeOpacity={1}
                    style={tw`w-80 bg-white rounded-2xl p-6`}
                >
                    {/* Close */}
                    <View style={tw`items-end`}>
                        <Ionicons name="close" size={22} onPress={onClose} />
                    </View>

                    {/* Profile */}
                    <View style={tw`items-center`}>
                        {imageUri ? (
                            <Image
                                source={{ uri: imageUri }}
                                style={tw`w-32 h-32 rounded-full mb-4`}
                            />
                        ) : (
                            <Ionicons name="person-circle" size={120} color="#999" />
                        )}

                        <Text style={tw`text-xl font-bold`}>
                            {oppUser.fullName}
                        </Text>

                        <Text style={tw`text-gray-500 mt-1`}>
                            @{oppUser.userName ?? "user"}
                        </Text>
                    </View>

                    {/* Action Button */}
                    <TouchableOpacity
                        disabled={requestStatus === "accepted" || loading}
                        onPress={handleFriendRequest}
                        style={[
                            tw`mt-6 py-3 rounded-xl border-2`,
                            {
                                backgroundColor: colors.background,
                                borderColor: colors.border,
                                opacity:
                                    requestStatus === "accepted" || loading ? 0.6 : 1,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                tw`text-center font-semibold`,
                                { color: colors.primary },
                            ]}
                        >
                            {getButtonText()}
                        </Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

export default UserPreviewCard;
