import React, { useEffect, useState } from 'react';
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
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';
import { saveLanguagePreference, getLanguagePreference } from '../utils/languageStorage';

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

  // Language selection & dropdown states
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  // Load saved language preference
  useEffect(() => {
    async function loadLanguage() {
      const lang = await getLanguagePreference();
      if (lang) {
        setSelectedLanguage(lang);
      }
    }
    loadLanguage();
  }, []);

  // Sign Up logic
  const handleSignUp = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
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

      // Save language preference
      await saveLanguagePreference(selectedLanguage);

      // After successful signup, you might want to navigate or goBack. 
      // For example: navigation.replace('Login') 
      // but if you'd prefer staying on the sign-up screen, remove that.
    } catch (error) {
      setErrorMsg(error.message);
      Alert.alert('Error', error.message);
    }
  };

  // Dropdown toggles
  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const handleLanguageSelect = (lang) => {
    setSelectedLanguage(lang);
    setDropdownOpen(false);
  };

  // Actual rendering
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        {/* Back button that goes back in the stack */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={stylesConstants.textDark} />
          <Text style={styles.backButtonText}>Login</Text>
        </TouchableOpacity>

        {/* Language selector at top-right */}
        <View style={styles.languageContainer}>
          <TouchableOpacity onPress={toggleDropdown}>
            <Text style={styles.languageText}>{selectedLanguage.toUpperCase()} ▼</Text>
          </TouchableOpacity>
        </View>

        {/* Overlay when dropdown is open */}
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
                  <Text style={styles.dropdownText}>En</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => handleLanguageSelect('es')}
                >
                  <Text style={styles.dropdownText}>Es</Text>
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

        <Text style={styles.title}>Sign Up</Text>

        {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

        <TextInput
          placeholder="Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
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

        {/* Sign Up Button */}
        <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
          <Text style={styles.signUpButtonText}>Sign Up</Text>
        </TouchableOpacity>

        {/* The text link to go to Login has been removed */}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
    backgroundColor: stylesConstants.background,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Back Button
  backButton: {
    position: 'absolute',
    top: 50, // adjust based on your safe area or status bar
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
  // Language Dropdown
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
    width: 80,
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
  // App icon & name
  appIcon: {
    marginBottom: 10,
  },
  appName: {
    fontSize: 20,
    fontWeight: '600',
    color: stylesConstants.primary,
    marginBottom: 30,
  },
  // Title & error
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
  // Text inputs
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  // Sign Up Button
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
