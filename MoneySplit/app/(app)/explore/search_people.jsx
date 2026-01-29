import {
    View,
    Text,
    TouchableOpacity,
    useColorScheme,
    TextInput,
    TouchableWithoutFeedback,
    Keyboard,
    Image,
    ScrollView,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../constants/Colors';
import { useRouter } from 'expo-router';
import { BACKEND_URL } from '../../../constants/Imps';
import UserPreviewCard from '../../../components/userPreviewCard';

const SearchPeople = () => {
    const scheme = useColorScheme();
    const colors = theme[scheme ?? 'light'];
    const router = useRouter();

    const [searchTerm, setSearchTerm] = useState('');
    const [searchUsers, setSearchUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showPreview, setShowPreview] = useState(false);

    const isSearching = searchTerm.trim().length > 0;

    /* ---------------- DEBOUNCED SEARCH ---------------- */
    useEffect(() => {
        if (!searchTerm.trim()) {
            setSearchUsers([]);
            return;
        }

        const timeoutId = setTimeout(() => {
            fetchUsers(searchTerm.trim());
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    /* ---------------- FETCH USERS ---------------- */
    const fetchUsers = async (query) => {
        setLoading(true);
        try {
            const response = await fetch(
                `${BACKEND_URL}/api/search/${encodeURIComponent(query)}`
            );
            const data = await response.json();
            setSearchUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.log('Search error:', error);
            setSearchUsers([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <ScrollView
                keyboardShouldPersistTaps="handled"
                style={tw`pl-3 pr-3 pt-2`}
            >
                {/* Header */}
                <View style={tw`flex-row justify-between items-center`}>
                    <View style={tw`flex-row items-center`}>
                        <Ionicons
                            name="arrow-back"
                            size={24}
                            onPress={() => router.back()}
                        />
                        <Text style={tw`p-3 font-bold text-2xl`}>
                            Search People
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={[
                            tw`w-20 h-10 rounded-full items-center justify-center`,
                            { backgroundColor: colors.surface },
                        ]}
                    >
                        <Text style={[tw`text-lg`, { color: colors.primary }]}>
                            Cancel
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View
                    style={[
                        tw`flex-row items-center px-4 py-2 rounded-full`,
                        {
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                            borderWidth: 1,
                        },
                    ]}
                >
                    <Ionicons
                        name="search-outline"
                        size={22}
                        color={colors.textMuted}
                    />

                    <TextInput
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                        placeholder="Search by name or email"
                        placeholderTextColor={colors.textMuted}
                        style={[
                            tw`ml-3 flex-1 text-base`,
                            { color: colors.textPrimary },
                        ]}
                        autoFocus
                    />
                </View>

                {/* Results */}
                {!isSearching && (
                    <Text style={tw`my-4 mx-2 text-xl font-semibold`}>
                        Recent Searches
                    </Text>
                )}

                {isSearching && (
                    <View style={tw`mt-4`}>
                        {loading && <Text>Searching...</Text>}

                        {!loading && searchUsers.length === 0 && (
                            <Text>No users found</Text>
                        )}

                        {searchUsers.map((u) => (
                            <View
                                key={u.userId}
                                style={tw`flex-row items-center justify-between p-3 border-b border-gray-200`}
                            >
                                {/* LEFT */}
                                <View style={tw`flex-row items-center flex-1`}>
                                    <Image
                                        source={{ uri: u.imageUrl }}
                                        style={tw`w-11 h-11 mr-4 rounded-full`}
                                    />
                                    <View>
                                        <Text style={tw`font-semibold`}>
                                            {u.fullName}
                                        </Text>
                                        <Text style={tw`text-gray-500`}>
                                            @{u.userName}
                                        </Text>
                                    </View>
                                </View>

                                {/* RIGHT */}
                                <TouchableOpacity
                                    onPress={() => {
                                        setSelectedUser(u);
                                        setShowPreview(true);
                                    }}
                                >
                                    <Text style={tw`text-blue-600 font-semibold`}>
                                        View
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}

                {/* Preview Modal */}
                <UserPreviewCard
                    visible={showPreview}
                    oppUser={selectedUser}
                    onClose={() => {
                        setShowPreview(false);
                        setSelectedUser(null);
                    }}
                />
            </ScrollView>
        </TouchableWithoutFeedback>
    );
};

export default SearchPeople;
