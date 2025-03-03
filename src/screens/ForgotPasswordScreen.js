// src/screens/ForgotPasswordScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handlePasswordReset = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent. Check your inbox.');
      setErrorMsg('');
    } catch (error) {
      setErrorMsg(error.message);
      setMessage('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Button title="Send Reset Email" onPress={handlePasswordReset} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: { height: 50, borderColor: 'gray', borderWidth: 1, marginBottom: 15, paddingHorizontal: 10 },
  error: { color: 'red', marginBottom: 15, textAlign: 'center' },
  message: { color: 'green', marginBottom: 15, textAlign: 'center' }
});
