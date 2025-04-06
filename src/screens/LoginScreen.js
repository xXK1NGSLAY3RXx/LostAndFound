import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { Picker } from '@react-native-picker/picker';
import { saveLanguagePreference, getLanguagePreference } from '../utils/languageStorage';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState(''); // Stores user email input
  const [password, setPassword] = useState(''); // Stores user password input
  const [selectedLanguage, setSelectedLanguage] = useState('en'); // Default language selection
  const [errorMsg, setErrorMsg] = useState(''); // Stores any authentication error messages

  // Load saved language preference from AsyncStorage on component mount
  useEffect(() => {
    async function loadLanguage() {
      const lang = await getLanguagePreference();
      if (lang) {
        setSelectedLanguage(lang);
      }
    }
    loadLanguage();
  }, []);

  // Handles user login with Firebase Authentication
  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Save the selected language preference after successful login
      await saveLanguagePreference(selectedLanguage);
    } catch (error) {
      setErrorMsg(error.message);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      {/* Display error message if authentication fails */}
      {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}
      
      {/* Email input field */}
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      {/* Password input field */}
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      
      <Text style={styles.label}>Select Language:</Text>
      
      {/* Language picker dropdown */}
      <Picker
        selectedValue={selectedLanguage}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedLanguage(itemValue)}
      >
        <Picker.Item label="English" value="en" />
        <Picker.Item label="Spanish" value="es" />
      </Picker>
      
      {/* Login button */}
      <Button title="Login" onPress={handleLogin} />
      
      {/* Navigation link to signup screen */}
      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.link}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>

      {/* Navigation link to forgot password screen */}
      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.link}>Forgot your Password?</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: 'gray', marginBottom: 15, padding: 10 },
  label: { fontSize: 16, marginBottom: 5 },
  picker: { height: 50, marginBottom: 15 },
  error: { color: 'red', marginBottom: 15, textAlign: 'center' },
  link: { marginTop: 15, color: 'blue', textAlign: 'center' },
});
