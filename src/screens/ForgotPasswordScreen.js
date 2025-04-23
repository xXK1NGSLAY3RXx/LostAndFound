// src/screens/ForgotPasswordScreen.jsx

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
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

// react-i18next
import { useTranslation } from 'react-i18next';

const stylesConstants = {
  primary: '#0284c7',
  secondary: '#06b6d4',
  accent: '#3b82f6',
  background: '#f9fafb',
  textDark: '#1f2937',
  error: '#dc2626',
  success: '#16a34a',
};

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Translation hook
  const { t } = useTranslation();

  // Handle password reset request
  async function handlePasswordReset() {
    if (!email) {
      Alert.alert('Error', t('common.fillAllFields') || 'Please fill in all fields.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage(t('forgotPassword.successMessage') || 'Password reset email sent. Check your inbox.');
      setErrorMsg('');
    } catch (error) {
      setErrorMsg(error.message);
      setMessage('');
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        {/* Back Button to go back */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={stylesConstants.textDark} />
          <Text style={styles.backButtonText}>
            {t('forgotPassword.backButtonText')}
          </Text>
        </TouchableOpacity>


        {/* Title */}
        <Text style={styles.title}>
          {t('forgotPassword.title')}
        </Text>

        {/* Success & Error Messages */}
        {message ? <Text style={styles.message}>{message}</Text> : null}
        {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

        {/* Email Input */}
        <TextInput
          style={styles.input}
          placeholder={t('forgotPassword.instructions') || 'Enter your email'}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Reset Button */}
        <TouchableOpacity style={styles.resetButton} onPress={handlePasswordReset}>
          <Text style={styles.resetButtonText}>
            {t('forgotPassword.buttonText')}
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
  /* Back Button */
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
  /* Optional App Icon & Name */
  appIcon: {
    marginBottom: 10,
  },
  appName: {
    fontSize: 20,
    fontWeight: '600',
    color: stylesConstants.primary,
    marginBottom: 30,
  },
  /* Title */
  title: {
    fontSize: 24,
    color: stylesConstants.textDark,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '700',
  },
  /* Success & Error Messages */
  error: {
    color: stylesConstants.error,
    marginBottom: 15,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  message: {
    color: stylesConstants.success,
    marginBottom: 15,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  /* Text Input */
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  /* Reset Button */
  resetButton: {
    width: '100%',
    backgroundColor: stylesConstants.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
