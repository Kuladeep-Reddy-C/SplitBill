import { View, Text, StatusBar } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const GroupLayout = () => {
    return (
        <>
            <StatusBar style="auto" />
            <Stack screenOptions={{ headerShown: false }} />
        </>
    )
}

export default GroupLayout