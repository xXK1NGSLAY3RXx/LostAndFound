import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_KEY = 'preferred_language';

export const saveLanguagePreference = async (language) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
    console.log('Language preference saved:', language);
  } catch (error) {
    console.error('Error saving language preference:', error);
  }
};

export const getLanguagePreference = async () => {
  try {
    const language = await AsyncStorage.getItem(LANGUAGE_KEY);
    console.log('Loaded language preference:', language);
    return language;
  } catch (error) {
    console.error('Error loading language preference:', error);
    return null;
  }
};
