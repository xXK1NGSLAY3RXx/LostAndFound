// src/screens/CreatePostScreen.js
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import MapView, { Marker } from 'react-native-maps';
import { addDoc, collection, serverTimestamp, GeoPoint } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../config/firebaseConfig';
import { getGeohash } from '../utils/geoUtils';
import { AuthContext } from '../contexts/AuthContext';

export default function CreatePostScreen({ navigation, route }) {
  const { user } = useContext(AuthContext);

  // Form fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState([]); // Array of image URIs
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Location state
  const [location, setLocation] = useState(null);
  const [locLoading, setLocLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // On mount: if location & formState were picked from PickLocationScreen, restore them
  useEffect(() => {
    if (route.params?.pickedLocation) {
      setLocation(route.params.pickedLocation);
      // Restore form data if provided
      if (route.params.formState) {
        setName(route.params.formState.name);
        setCategory(route.params.formState.category);
        setDescription(route.params.formState.description);
        setAdditionalInfo(route.params.formState.additionalInfo);
        setPhotos(route.params.formState.photos);
      }
      setLocLoading(false);
    } else {
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
    }
  }, [route.params]);

  // Function to pick an image from the gallery
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera roll permissions are required!');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], // Updated per Expo docs
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    console.log('ImagePicker result:', result);
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  // Function to take a photo with the camera
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera permissions are required!');
      return;
    }
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    console.log('Camera result:', result);
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  // Upload an image given its URI
  const uploadImageAsync = async (uri) => {
    setUploading(true);
    try {
      let finalUri = uri;
      if (Platform.OS === 'ios') {
        finalUri = uri.replace('file://', '');
      }
      const response = await fetch(finalUri);
      const blob = await response.blob();
      const storage = getStorage();
      const filename = uri.split('/').pop() || `${Date.now()}.jpg`;
      const storageRef = ref(storage, `images/${user.uid}/${filename}`);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Upload all selected images and return an array of download URLs
  const uploadAllImages = async () => {
    const urls = [];
    for (const uri of photos) {
      const url = await uploadImageAsync(uri);
      if (url) {
        urls.push(url);
      }
    }
    return urls;
  };

  // Handle post creation: upload images first, then create the post document in Firestore
  const handleCreatePost = async () => {
    if (!name || !category || !description || !location) {
      Alert.alert('Error', 'Please fill in all required fields and ensure location is available.');
      return;
    }
    try {
      // First, upload all selected images
      const uploadedURLs = await uploadAllImages();
      // Create the post document with the download URLs
      const lat = location.latitude;
      const lng = location.longitude;
      const geohash = getGeohash(lat, lng);
      await addDoc(collection(db, 'foundPosts'), {
        name,
        category,
        description,
        location: new GeoPoint(lat, lng),
        geohash,
        photos: uploadedURLs, // Array of download URLs from Firebase Storage
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Found Post</Text>
      {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}
      <TextInput placeholder="Item Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Category" value={category} onChangeText={setCategory} style={styles.input} />
      <TextInput placeholder="Description" value={description} onChangeText={setDescription} style={styles.input} />
      
      <View style={styles.buttonRow}>
        <Button title="Pick Image" onPress={pickImage} />
        <Button title="Take Photo" onPress={takePhoto} />
      </View>
      {uploading && <Text>Uploading image(s)...</Text>}
      {photos.length > 0 && (
        <View style={styles.imagePreviewContainer}>
          {photos.map((uri, index) => (
            <Image key={index} source={{ uri }} style={styles.imagePreview} />
          ))}
        </View>
      )}
      
      <TextInput placeholder="Additional Info" value={additionalInfo} onChangeText={setAdditionalInfo} style={styles.input} />

      {/* Mini Map Preview: Tapping navigates to PickLocationScreen, passing current location and form state */}
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('PickLocation', {
            currentLocation: location,
            formState: { name, category, description, additionalInfo, photos },
          })
        }
      >
        <View style={styles.mapPreview}>
          <MapView
            style={styles.map}
            pointerEvents="none" // Disable interaction for preview
            provider={Platform.OS === 'android' ? 'google' : undefined}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
          >
            <Marker coordinate={location} />
          </MapView>
        </View>
      </TouchableOpacity>
      <Text style={styles.locationText}>
        Current Location: {location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'Not available'}
      </Text>

      <Button title="Create Post" onPress={handleCreatePost} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, justifyContent: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: 'gray', padding: 10, marginBottom: 15 },
  error: { color: 'red', textAlign: 'center', marginBottom: 15 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  imagePreviewContainer: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 10 },
  imagePreview: { width: 100, height: 100, marginRight: 10, marginBottom: 10 },
  mapPreview: { width: '100%', height: 150, borderWidth: 1, borderColor: 'gray', marginBottom: 15 },
  map: { width: '100%', height: '100%' },
  locationText: { marginTop: 20, textAlign: 'center', fontStyle: 'italic' },
});
