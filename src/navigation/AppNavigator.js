// src/navigation/AppNavigator.js
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';

// Import your screens
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import FoundPostsListScreen from '../screens/FoundPostsListScreen';
import PostDetailScreen from '../screens/PostDetailScreen';
import RequestsScreen from '../screens/RequestsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PickLocationScreen from '../screens/PickLocationScreen';

import { AuthContext } from '../contexts/AuthContext';

const AuthStack = createStackNavigator();
const AppStack = createStackNavigator();

function AuthStackScreen() {
  return (
    <AuthStack.Navigator initialRouteName="Login">
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
      <AuthStack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen} 
        options={{ title: 'Reset Password' }} 
      />
    </AuthStack.Navigator>
  );
}

function AppStackScreen() {
  return (
    <AppStack.Navigator>
      <AppStack.Screen name="Home" component={HomeScreen} />
      <AppStack.Screen 
        name="CreatePost" 
        component={CreatePostScreen} 
        options={{ title: 'Create Found Post' }} 
      />
      <AppStack.Screen
        name="PickLocation"
        component={PickLocationScreen}
        options={{ title: 'Pick Location' }}
      />
      <AppStack.Screen 
        name="FoundPosts" 
        component={FoundPostsListScreen} 
        options={{ title: 'Found Posts Near You' }} 
      />
      <AppStack.Screen 
        name="PostDetail" 
        component={PostDetailScreen} 
        options={{ title: 'Post Details' }} 
      />
      <AppStack.Screen 
        name="Requests" 
        component={RequestsScreen} 
        options={{ title: 'Requests for Your Posts' }} 
      />
      <AppStack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Profile' }} 
      />
    </AppStack.Navigator>
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
      {user ? <AppStackScreen /> : <AuthStackScreen />}
    </NavigationContainer>
  );
}
