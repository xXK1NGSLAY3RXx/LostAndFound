// src/screens/LoginScreen.jsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Firebase
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

// Language preference utilities (optional)
import { saveLanguagePreference, getLanguagePreference } from '../utils/languageStorage';

// React-i18next
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';  // so we can call i18n.changeLanguage

const stylesConstants = {
  primary: '#0284c7',
  secondary: '#06b6d4',
  accent: '#3b82f6',
  background: '#f9fafb',
  textDark: '#1f2937',
  error: '#dc2626',
};

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  // Pull in the translation function
  const { t } = useTranslation();



  // Handle user login
  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Save language preference after a successful login
      await saveLanguagePreference(selectedLanguage);
    } catch (error) {
      setErrorMsg(error.message);
      Alert.alert('Error', error.message);
    }
  };

  // Toggle the dropdown
  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  // When user picks a language
  const handleLanguageSelect = (lang) => {
    setSelectedLanguage(lang);
    i18n.changeLanguage(lang); 
    setDropdownOpen(false);
  };

  return (
    <View style={styles.container}>
      {/* Language selector at top-right */}
      <View style={styles.languageContainer}>
        <TouchableOpacity onPress={toggleDropdown}>
          <Text style={styles.languageText}>
            {selectedLanguage} ▼
          </Text>
        </TouchableOpacity>
      </View>

      {/* Dropdown overlay when open */}
      {isDropdownOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setDropdownOpen(false)}
        >
          <TouchableWithoutFeedback>
            <View style={styles.dropdown}>
            
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handleLanguageSelect('en')}
              >
                <Text style={styles.dropdownText}>English</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handleLanguageSelect('es')}
              >
                <Text style={styles.dropdownText}>Spanish</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      )}

      {/* App Icon */}
      <Ionicons
        name="search-circle"
        size={80}
        color={stylesConstants.primary}
        style={styles.appIcon}
      />
      {/* App Name */}
      <Text style={styles.appName}>Lost & Found</Text>

      {/* Title */}
      <Text style={styles.title}>{t('login.title')}</Text>

      {/* Error message */}
      {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

      {/* Email input */}
      <TextInput
        placeholder={t('login.emailPlaceholder')}
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Password input */}
      <TextInput
        placeholder={t('login.passwordPlaceholder')}
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />

      {/* Login Button */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>{t('login.loginButton')}</Text>
      </TouchableOpacity>

      {/* Sign Up link */}
      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.link}>{t('login.signupLink')}</Text>
      </TouchableOpacity>

      {/* Forgot Password link */}
      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.link}>{t('login.forgotPasswordLink')}</Text>
      </TouchableOpacity>
    </View>
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
  languageContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
  },
  languageText: {
    fontSize: 14,
    fontWeight: '500',
    color: stylesConstants.textDark,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dropdown: {
    position: 'absolute',
    top: 70,
    right: 20,
    backgroundColor: '#fff',
    borderColor: '#cbd5e1',
    borderWidth: 1,
    borderRadius: 6,
    width: 90,
    zIndex: 999,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dropdownText: {
    fontSize: 14,
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
    marginBottom: 15,
    textAlign: 'center',
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
  loginButton: {
    width: '100%',
    backgroundColor: stylesConstants.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    color: stylesConstants.accent,
    marginTop: 10,
    fontSize: 14,
  },
});
