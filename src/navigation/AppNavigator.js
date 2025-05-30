import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';

// Import your screens
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import FoundScreen from '../screens/FoundScreen';
import LostScreen from '../screens/LostScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import PickLocationScreen from '../screens/PickLocationScreen';
import PostDetailScreen from '../screens/PostDetailScreen';
import FullMapScreen from '../screens/FullMapScreen';
import RequestsScreen from '../screens/RequestsScreen';

import { AuthContext } from '../contexts/AuthContext';

// Create stack navigators for different sections
const AuthStack = createStackNavigator();
const FoundStack = createStackNavigator();
const LostStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Authentication stack for login, signup, and password reset
function AuthStackScreen() {
  return (
    <AuthStack.Navigator initialRouteName="Login">
      <AuthStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <AuthStack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
      <AuthStack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen} 
        options={{ title: 'Reset Password', headerShown: false }} 
      />
    </AuthStack.Navigator>
  );
}

// Navigator for Found-related screens
function FoundNavigator() {
  return (
    <FoundStack.Navigator>
      <FoundStack.Screen
        name="FoundScreen"
        component={FoundScreen}
        options={{ title: 'Found' }}
      />
      <FoundStack.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{ title: 'Create Post' }}
      />
      <FoundStack.Screen
        name="PickLocation"
        component={PickLocationScreen}
        options={{ title: 'Pick Location' }}
      />
      <FoundStack.Screen
        name="PostDetail"
        component={PostDetailScreen}
        options={{ title: 'Post Details' }}
      />
      <FoundStack.Screen
        name="FullMap"
        component={FullMapScreen}
        options={{ title: 'Full Map' }}
      />
    </FoundStack.Navigator>
  );
}

// Navigator for Lost-related screens
function LostNavigator() {
  return (
    <LostStack.Navigator>
      <LostStack.Screen
        name="LostScreen"
        component={LostScreen}
        options={{ title: 'Lost' }}
      />
      <LostStack.Screen
        name="PostDetail"
        component={PostDetailScreen}
        options={{ title: 'Post Details' }}
      />
      <LostStack.Screen
        name="FullMap"
        component={FullMapScreen}
        options={{ title: 'Full Map' }}
      />
    </LostStack.Navigator>
  );
}

// Navigator for Profile-related screens
function ProfileNavigator() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <ProfileStack.Screen
        name="Requests"
        component={RequestsScreen}
        options={{ title: 'Requests' }}
      />
    </ProfileStack.Navigator>
  );
}

// Bottom tab navigator for main app sections
function AppTabNavigator() {
  return (
    <Tab.Navigator initialRouteName="Lost" screenOptions={{
        headerShown: false, // Hide top header in the tab
      }}>
      <Tab.Screen name="Found" component={FoundNavigator} />
      <Tab.Screen name="Lost" component={LostNavigator} />
      <Tab.Screen name="Profile" component={ProfileNavigator} />
    </Tab.Navigator>
  );
}

// Main navigation container deciding between auth flow and main app
export default function AppNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      // Show loading indicator while checking authentication status
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppTabNavigator /> : <AuthStackScreen />} 
    </NavigationContainer>
  );
}
