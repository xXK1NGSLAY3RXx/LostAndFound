// src/screens/LoginScreen.js
import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { Picker } from '@react-native-picker/picker';
import { saveLanguagePreference, getLanguagePreference } from '../utils/languageStorage';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en'); // default language
  const [errorMsg, setErrorMsg] = useState('');

  // Load saved language preference, if available
  useEffect(() => {
    async function loadLanguage() {
      const lang = await getLanguagePreference();
      if (lang) {
        setSelectedLanguage(lang);
      }
    }
    loadLanguage();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Save the language preference to AsyncStorage
      await saveLanguagePreference(selectedLanguage);
    } catch (error) {
      setErrorMsg(error.message);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <Text style={styles.label}>Select Language:</Text>
      
      <Button title="Login" onPress={handleLogin} />
     
      <Picker
        selectedValue={selectedLanguage}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedLanguage(itemValue)}
      >
        <Picker.Item label="English" value="en" />
        <Picker.Item label="Spanish" value="es" />
        {/* Add additional languages as needed */}
      </Picker>
      
      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.link}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>

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
