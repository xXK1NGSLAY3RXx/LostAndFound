// src/screens/ProfileScreen.js
import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';
import { getLanguagePreference, saveLanguagePreference } from '../utils/languageStorage';
import { AuthContext } from '../contexts/AuthContext';
import { Picker } from '@react-native-picker/picker';

export default function ProfileScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [profileName, setProfileName] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [loading, setLoading] = useState(true);

  // Load user profile data from Firestore
  useEffect(() => {
    async function fetchProfile() {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setProfileName(userDoc.data().name);
        } else {
          setProfileName('No Name');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        // IMPORTANT: set loading to false here, so the UI can update
        setLoading(false);
      }
    }
    fetchProfile();
  }, [user.uid]);

  // Load preferred language from AsyncStorage
  useEffect(() => {
    async function loadLanguage() {
      const lang = await getLanguagePreference();
      setPreferredLanguage(lang || 'en');
    }
    loadLanguage();
  }, []);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleLanguageChange = async (lang) => {
    setPreferredLanguage(lang);
    await saveLanguagePreference(lang);
    Alert.alert('Language Updated', `Your preferred language is now ${lang}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.label}>Name: {profileName}</Text>

      
      

      {/* Button to navigate to Found Posts */}
      <Button
        title="Your Posts"
        onPress={() => navigation.navigate('FoundPosts')}
      />



      <Button
        title="Requests"
        onPress={() => navigation.navigate('Requests')}
      />


      <Text style={styles.label}>Preferred Language:</Text>
      <Picker
        selectedValue={preferredLanguage}
        style={styles.picker}
        onValueChange={(itemValue) => handleLanguageChange(itemValue)}
      >
        <Picker.Item label="English" value="en" />
        <Picker.Item label="Spanish" value="es" />
        {/* Add more languages as needed */}
      </Picker>

      {/* Sign Out button */}
      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 26, textAlign: 'center', marginBottom: 20 },
  label: { fontSize: 18, marginBottom: 10 },
  picker: { height: 50, width: '100%', marginBottom: 20 },
  button: { backgroundColor: '#007bff', padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#fff', fontSize: 18 },
});
