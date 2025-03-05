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

const AuthStack = createStackNavigator();
const FoundStack = createStackNavigator();
const LostStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const Tab = createBottomTabNavigator();

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

function AppTabNavigator() {
  return (
    <Tab.Navigator initialRouteName="Lost">
      <Tab.Screen name="Found" component={FoundNavigator} />
      <Tab.Screen name="Lost" component={LostNavigator} />
      <Tab.Screen name="Profile" component={ProfileNavigator} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
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
