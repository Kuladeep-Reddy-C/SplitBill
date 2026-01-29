import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { BACKEND_URL } from "../../../../../constants/Imps";

const FeastDetails = () => {
  const { groupId, feastId } = useLocalSearchParams();

  const [feast, setFeast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId || !feastId) return;

    const fetchFeast = async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/api/groups/${groupId}/feasts`
        );
        const feasts = await res.json();
        console.log(feastId);

        const found = feasts.find(
          (f) => f._id === feastId
        );

        setFeast(found || null);
      } catch (err) {
        console.error("Failed to fetch feast", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeast();
  }, [groupId, feastId]);

  // 🔄 Loading
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // ❌ Feast not found
  if (!feast) {
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <Text>Feast not found</Text>
      </View>
    );
  }

  // ✅ Final / open / settled feast
  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>
        {feast.title}
      </Text>

      <Text style={{ marginTop: 6 }}>
        Status: {feast.status}
      </Text>

      <Text style={{ marginTop: 6 }}>
        Total Amount: ₹{feast.totalAmountFeast}
      </Text>

      {/* 👥 Feast Friends */}
      <Text
        style={{
          marginTop: 16,
          fontSize: 16,
          fontWeight: "bold",
        }}
      >
        Participants
      </Text>

      {feast.feastFriends.map((friend) => (
        <View key={friend.userId} style={{ marginTop: 8 }}>
          <Text>User: {friend.userId}</Text>
          <Text>
            Consumed: ₹{friend.totalConsumedAmount}
          </Text>
          <Text>
            Balance: ₹{friend.balanceAmount}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
};

export default FeastDetails;
