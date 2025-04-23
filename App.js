import React, { useEffect } from 'react';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import './src/config/i18n'; 
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';

// Import your AsyncStorage helpers
import { getLanguagePreference } from './src/utils/languageStorage';

export default function App() {
  useEffect(() => {
    async function loadLanguageOnce() {
      const savedLang = await getLanguagePreference();
      if (savedLang) {
        i18n.changeLanguage(savedLang); // sets the global i18n language
      }
    }
    loadLanguageOnce();
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </I18nextProvider>
  );
}
