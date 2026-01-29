import { Pressable, View, Text } from "react-native";
import React from "react";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";

const QuickActionCard = ({
    title,
    icon,
    iconBg,
    cardBg,
    textColor = "#000",
    iconColor = "#000",
    onPress,
    primary = false,
}) => {
    return (
        <Pressable
            onPress={onPress}
            style={[
                tw`h-36 rounded-3xl p-4 justify-between`,
                { backgroundColor: cardBg },
            ]}
        >
            <View
                style={[
                    tw`h-10 w-10 rounded-full items-center justify-center`,
                    { backgroundColor: iconBg },
                ]}
            >
                <Ionicons name={icon} size={22} color={iconColor} />
            </View>

            <Text
                style={[
                    tw`${primary ? "text-base font-semibold" : "text-sm font-medium"}`,
                    { color: textColor },
                ]}
            >
                {title}
            </Text>
        </Pressable>
    );
};

export default QuickActionCard;
