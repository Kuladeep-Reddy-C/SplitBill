import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { Stack } from 'expo-router'

const GroupLayout = () => {
  return (  
    <>
        <StatusBar style='auto'/>
        <Stack screenOptions={{headerShown:false}} />
    </>
  )
}

export default GroupLayout