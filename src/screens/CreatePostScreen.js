// src/screens/CreatePostScreen.js
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { addDoc, collection, serverTimestamp, GeoPoint } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { getGeohash } from '../utils/geoUtils';
import { AuthContext } from '../contexts/AuthContext';

export default function CreatePostScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  // Form fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Location state
  const [location, setLocation] = useState(null);
  const [locLoading, setLocLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Permission to access location was denied.');
        setLocLoading(false);
        return;
      }
      try {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch location.');
      } finally {
        setLocLoading(false);
      }
    })();
  }, []);

  const handleCreatePost = async () => {
    if (!name || !category || !description || !location) {
      Alert.alert('Error', 'Please fill in all required fields and ensure location is available.');
      return;
    }

    try {
      const lat = location.latitude;
      const lng = location.longitude;
      const geohash = getGeohash(lat, lng);

      await addDoc(collection(db, 'foundPosts'), {
        name,
        category,
        description,
        location: new GeoPoint(lat, lng),
        geohash,
        photos: photos ? photos.split(',').map(url => url.trim()) : [],
        additionalInfo,
        creatorId: user ? user.uid : 'unknown',
        status: 'available',
        createdAt: serverTimestamp(),
      });
      
      Alert.alert('Success', 'Post created successfully.');
      navigation.goBack();
    } catch (error) {
      setErrorMsg(error.message);
      Alert.alert('Error', error.message);
    }
  };

  if (locLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Fetching current location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Found Post</Text>
      {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}
      <TextInput placeholder="Item Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Category" value={category} onChangeText={setCategory} style={styles.input} />
      <TextInput placeholder="Description" value={description} onChangeText={setDescription} style={styles.input} />
      <TextInput placeholder="Photos (comma-separated URLs)" value={photos} onChangeText={setPhotos} style={styles.input} />
      <TextInput placeholder="Additional Info" value={additionalInfo} onChangeText={setAdditionalInfo} style={styles.input} />
      <Button title="Create Post" onPress={handleCreatePost} />
      <Text style={styles.locationText}>
        Current Location: {location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'Not available'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: 'gray', padding: 10, marginBottom: 15 },
  error: { color: 'red', textAlign: 'center', marginBottom: 15 },
  locationText: { marginTop: 20, textAlign: 'center', fontStyle: 'italic' },
});
