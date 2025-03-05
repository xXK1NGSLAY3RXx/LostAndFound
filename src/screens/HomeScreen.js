// src/screens/HomeScreen.js
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

export default function HomeScreen({ navigation }) {
  const handleSignOut = async () => {
    await signOut(auth);
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Screen</Text>
      <Button title="Create Found Post" onPress={() => navigation.navigate('CreatePost')} />
      <Button title="View Nearby Found Posts" onPress={() => navigation.navigate('FoundPosts')} />
      <Button title="View Requests" onPress={() => navigation.navigate('Requests')} />
      <Button title="Profile" onPress={() => navigation.navigate('Profile')} />

      <Button title="Sign Out" onPress={handleSignOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, marginBottom: 20 }
});
