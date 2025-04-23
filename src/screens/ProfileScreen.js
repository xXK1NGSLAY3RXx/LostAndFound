// src/screens/ProfileScreen.jsx
import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Firebase
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';

// Language utilities
import { getLanguagePreference, saveLanguagePreference } from '../utils/languageStorage';

// Auth context
import { AuthContext } from '../contexts/AuthContext';

// react-i18next
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';

const stylesConstants = {
  primary: '#0284c7',
  secondary: '#06b6d4',
  accent: '#3b82f6',
  background: '#f9fafb',
  textDark: '#1f2937',
  error: '#dc2626',
};

export default function ProfileScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [profileName, setProfileName] = useState(''); // user's name
  const [loading, setLoading] = useState(true);       // loading state for profile

  // Language dropdown states
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  // i18n translation hook
  const { t } = useTranslation();

  // Fetch user profile data from Firestore
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
        setLoading(false);
      }
    }
    fetchProfile();
  }, [user.uid]);

  // Load preferred language from AsyncStorage once
  useEffect(() => {
    async function loadLanguage() {
      const lang = await getLanguagePreference();
      if (lang) {
        setSelectedLanguage(lang);
        i18n.changeLanguage(lang); // set the global i18n language
      }
    }
    loadLanguage();
  }, []);

  // Sign out logic
  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  // Handle language selection
  const handleLanguageSelect = async (lang) => {
    setSelectedLanguage(lang);
    i18n.changeLanguage(lang);         // globally change language
    await saveLanguagePreference(lang); 
    setDropdownOpen(false);
  };

  // If loading profile
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t('profile.loadingProfile')}</Text>
        <ActivityIndicator size="large" color={stylesConstants.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Language selector at top-right */}
      <View style={styles.languageContainer}>
        <TouchableOpacity onPress={toggleDropdown}>
          <Text style={styles.languageText}>{selectedLanguage} ▼</Text>
        </TouchableOpacity>
      </View>

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
                <Text style={styles.dropdownText}>Español</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      )}

      {/* Title */}
      <Text style={styles.title}>{t(profileName)}</Text>

    

      {/* Requests Button */}
      <TouchableOpacity
        style={styles.requestsButton}
        onPress={() => navigation.navigate('Requests')}
      >
        <Text style={styles.requestsButtonText}>{t('profile.requestsButton')}</Text>
      </TouchableOpacity>

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutButtonText}>
          {t('profile.signOutButton')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // Loading screen style
  loadingContainer: {
    flex: 1,
    backgroundColor: stylesConstants.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: stylesConstants.textDark,
    marginBottom: 10,
  },

  // Main container
  container: {
    flex: 1,
    backgroundColor: stylesConstants.background,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Language dropdown
  languageContainer: {
    position: 'absolute',
    top: 20,
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
    top: 40,
    right: 20,
    backgroundColor: '#fff',
    borderColor: '#cbd5e1',
    borderWidth: 1,
    borderRadius: 6,
    width: 100,
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

  // Title
  title: {
    fontSize: 26,
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '700',
    color: stylesConstants.textDark,
  },

  // Labels
  label: {
    fontSize: 18,
    marginBottom: 20,
    color: stylesConstants.textDark,
  },

  // Requests button
  requestsButton: {
    width: '100%',
    backgroundColor: stylesConstants.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  requestsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Sign Out button
  signOutButton: {
    width: '100%',
    backgroundColor: stylesConstants.accent,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
