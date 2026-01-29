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
import { socket } from "../../../../lib/socket";

const AddFeast = () => {
  // const { feastId, groupId } = useLocalSearchParams();
  const { user } = useUser();
  const scheme = useColorScheme();
  const colors = theme[scheme ?? "light"];
  const feastId = "test-feast-123";

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  // 🔌 Socket lifecycle
  useEffect(() => {
    if (!feastId || !user) return;

    socket.connect();

    socket.emit("feast:join", {
      feastId,
      user: {
        id: user?.id,
        name: user?.fullName,
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


    return () => {
      socket.off("chat:system");
      socket.off("chat:message");
      socket.disconnect();
    };
  }, [feastId]);


  socket.on("chat:message", (msg) => {
    console.log("🟢 CLIENT received chat:message");
    console.log(msg);
  });

  socket.on("chat:system", (msg) => {
    console.log("🟢 CLIENT received chat:system");
    console.log(msg);
  });
  console.log("🟡 CLIENT feastId =", feastId);



  const sendMessage = () => {
    console.log("🟡 CLIENT sendMessage triggered:", text);

    socket.emit("chat:message", {
      scope: "feast",
      id: feastId,
      user: {
        id: user.id,
        name: user.fullName,
      },
      text,
    });

    console.log("🟡 CLIENT chat:message emitted");

    setText("");
  };


  const renderItem = ({ item }) => {
    if (item.system) {
      return (
        <Text
          style={[
            tw`text-xs text-center my-2`,
            { color: colors.textMuted },
          ]}
        >
          {item.message}
        </Text>
      );
    }

    const mine = item.user.id === user.id;

    return (
      <View
        style={[
          tw`mb-2 px-3 py-2 rounded-xl max-w-[75%]`,
          {
            alignSelf: mine ? "flex-end" : "flex-start",
            backgroundColor: mine
              ? colors.primary
              : colors.surface,
          },
        ]}
      >
        {!mine && (
          <Text style={[tw`text-xs mb-1`, { color: colors.textMuted }]}>
            {item.user.name}
          </Text>
        )}

        <Text
          style={{
            color: mine
              ? colors.primaryText
              : colors.textPrimary,
          }}
        >
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <View style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      {/* HEADER */}
      <View
        style={[
          tw`px-4 py-4`,
          { borderBottomWidth: 1, borderColor: colors.border },
        ]}
      >
        <Text style={[tw`text-lg font-bold`, { color: colors.textPrimary }]}>
          Draft Feast
        </Text>
        <Text style={[tw`text-xs`, { color: colors.textMuted }]}>
          Live collaboration
        </Text>
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
                  color: "#888",
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
                backgroundColor: isMe ? "#4f46e5" : "#e5e7eb",
                padding: 10,
                borderRadius: 12,
                marginBottom: 8,
                maxWidth: "75%",
              }}
            >
              {!isMe && (
                <Text style={{ fontSize: 11, color: "#555" }}>
                  {item.user.name}
                </Text>
              )}

              <Text style={{ color: isMe ? "white" : "black" }}>
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
