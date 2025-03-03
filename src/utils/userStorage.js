import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_PROFILE_KEY = 'userProfile';

export const saveUserProfile = async (profile) => {
  try {
    await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
    console.log('User profile saved:', profile);
  } catch (error) {
    console.error('Error saving user profile:', error);
  }
};

export const getUserProfile = async () => {
  try {
    const profileString = await AsyncStorage.getItem(USER_PROFILE_KEY);
    if (profileString) {
      console.log('Loaded user profile:', profileString);
      return JSON.parse(profileString);
    }
    return null;
  } catch (error) {
    console.error('Error loading user profile:', error);
    return null;
  }
};
