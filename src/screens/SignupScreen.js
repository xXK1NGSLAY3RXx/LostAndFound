// src/screens/SignupScreen.jsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Firebase
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';

// Language preference utilities (optional)
import { saveLanguagePreference } from '../utils/languageStorage';

// React-i18next
import { useTranslation } from 'react-i18next';

// Local color palette
const stylesConstants = {
  primary: '#0284c7',
  secondary: '#06b6d4',
  accent: '#3b82f6',
  background: '#f9fafb',
  textDark: '#1f2937',
  error: '#dc2626',
};

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Translation hook
  const { t } = useTranslation();

  async function handleSignUp() {
    if (!name || !email || !password) {
      Alert.alert('Error', t('common.fillAllFields') || 'Please fill in all fields.');
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user doc in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        trustLevel: 1,
        foundItems: [],
        createdAt: serverTimestamp(),
      });

      // Save the language preference if needed
      // await saveLanguagePreference(...); 
      

      // After successful sign-up, navigate to Login
      navigation.replace('Login');
    } catch (error) {
      setErrorMsg(error.message);
      Alert.alert('Error', error.message);
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        {/* Back button (goBack) */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={stylesConstants.textDark} />
          {/* Translated text for the back button */}
          <Text style={styles.backButtonText}>
            {t('signup.loginBackButton')}
          </Text>
        </TouchableOpacity>

        {/* App Icon */}
        <Ionicons
          name="search-circle"
          size={80}
          color={stylesConstants.primary}
          style={styles.appIcon}
        />
        {/* App Name */}
        <Text style={styles.appName}>Lost & Found</Text>

        {/* Title from translation files */}
        <Text style={styles.title}>{t('signup.title')}</Text>
        {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

        {/* Input fields with placeholders from i18n */}
        <TextInput
          placeholder={t('signup.namePlaceholder')}
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <TextInput
          placeholder={t('signup.emailPlaceholder')}
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          placeholder={t('signup.passwordPlaceholder')}
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />

        {/* Sign Up Button with translated text */}
        <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
          <Text style={styles.signUpButtonText}>
            {t('signup.signupButton')}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: stylesConstants.background,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50, 
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: '500',
    color: stylesConstants.textDark,
  },
  appIcon: {
    marginBottom: 10,
  },
  appName: {
    fontSize: 20,
    fontWeight: '600',
    color: stylesConstants.primary,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    color: stylesConstants.textDark,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '700',
  },
  error: {
    color: stylesConstants.error,
    textAlign: 'center',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  signUpButton: {
    width: '100%',
    backgroundColor: stylesConstants.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
