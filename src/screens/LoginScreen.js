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
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { saveLanguagePreference, getLanguagePreference } from '../utils/languageStorage';

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
      // Save the selected language preference after successful login
      await saveLanguagePreference(selectedLanguage);
    } catch (error) {
      setErrorMsg(error.message);
      Alert.alert('Error', error.message);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const handleLanguageSelect = (lang) => {
    setSelectedLanguage(lang);
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

      {/* When dropdown is open, show a full-screen overlay */}
      {isDropdownOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setDropdownOpen(false)}
        >
          {/* Stop propagation inside the dropdown */}
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
                <Text style={styles.dropdownText}>Espanish</Text>
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

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>

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
  /* Main container */
  container: {
    flex: 1,
    backgroundColor: stylesConstants.background,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /* Top-right language container */
  languageContainer: {
    position: 'absolute',
    top: 50,  // Adjust based on safe area
    right: 20,
  },
  languageText: {
    fontSize: 14,
    fontWeight: '500',
    color: stylesConstants.textDark,
  },
  /* Overlay for outside-click detection */
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // no backgroundColor or transparent background so the UI is visible behind
    // but if you want to dim the background, you could do:
    // backgroundColor: 'rgba(0,0,0,0.2)'
  },
  /* Dropdown area */
  dropdown: {
    position: 'absolute',
    top: 70,    // near the languageContainer
    right: 20,
    backgroundColor: '#fff',
    borderColor: '#cbd5e1',
    borderWidth: 1,
    borderRadius: 6,
    width: 90,
    zIndex: 999, // ensure it's on top
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dropdownText: {
    fontSize: 14,
    color: stylesConstants.textDark,
  },
  /* App icon & name */
  appIcon: {
    marginBottom: 10,
  },
  appName: {
    fontSize: 20,
    fontWeight: '600',
    color: stylesConstants.primary,
    marginBottom: 30,
  },
  /* Login Title, Error, and Inputs */
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
  /* Login Button */
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
