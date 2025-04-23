import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import MapView, { Marker } from 'react-native-maps';
import { addDoc, collection, serverTimestamp, GeoPoint } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { db } from '../config/firebaseConfig';
import { getGeohash } from '../utils/geoUtils';
import { AuthContext } from '../contexts/AuthContext';
import { CATEGORIES } from '../constants/categoriesList';

// (Optional) If you're using react-i18next for translations
import { useTranslation } from 'react-i18next';

export default function CreatePostScreen({ navigation, route }) {
  const { user } = useContext(AuthContext);

  // Form fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  // Location
  const [location, setLocation] = useState(null);
  const [locLoading, setLocLoading] = useState(true);

  // Upload state
  const [uploading, setUploading] = useState(false);

  // Category modal
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');

  // Image dropdown
  const [isImageDropdownOpen, setImageDropdownOpen] = useState(false);

  // (Optional) i18n
  const { t } = useTranslation();

  // On mount: if user returned from location screen
  useEffect(() => {
    if (route.params?.pickedLocation) {
      setLocation(route.params.pickedLocation);

      // Restore form data if provided
      if (route.params.formState) {
        setName(route.params.formState.name);
        setCategory(route.params.formState.category);
        setDescription(route.params.formState.description);
        setPhotos(route.params.formState.photos);
      }
      setLocLoading(false);
    } else {
      // Request location if not already picked
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

  // Camera
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
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  // Gallery
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera roll permissions are required!');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  // Upload single image
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
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Upload all images
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

  // Create the post
  const handleCreatePost = async () => {
    if (!name || !category || !description || !location) {
      Alert.alert('Error', t('createPost.fillRequiredFields') || 'Please fill in all required fields and pick a location.');
      return;
    }
    try {
      const uploadedURLs = await uploadAllImages();
      const lat = location.latitude;
      const lng = location.longitude;
      const geohash = getGeohash(lat, lng);

      await addDoc(collection(db, 'foundPosts'), {
        name,
        category: category.toLowerCase(),
        description,
        location: new GeoPoint(lat, lng),
        geohash,
        photos: uploadedURLs,
        creatorId: user ? user.uid : 'unknown',
        status: 'available',
        createdAt: serverTimestamp(),

        // For search
        name_lower: name.toLowerCase(),
        category_lower: category.toLowerCase(),
      });

      Alert.alert('Success', t('createPost.successMessage') || 'Post created successfully');
      // Go back to the previous screen
      navigation.goBack();
      navigation.goBack();
    } catch (error) {
      setErrorMsg(error.message);
      Alert.alert('Error', error.message);
    }
  };

  // Filter categories by search
  const filteredCategories = CATEGORIES.filter((cat) =>
    cat.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // Select a category
  const handleSelectCategory = (cat) => {
    setCategory(cat);
    setCategoryModalVisible(false);
  };

  // Toggle the image dropdown
  const toggleImageDropdown = () => {
    setImageDropdownOpen(!isImageDropdownOpen);
  };

  // Handle image dropdown pick
  const handleImageOption = (option) => {
    setImageDropdownOpen(false);
    if (option === 'takePhoto') {
      takePhoto();
    } else if (option === 'choose') {
      pickImage();
    }
  };

  // If still loading location
  if (locLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Fetching current location...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>
          {t('createPost.title') || 'Create Found Post'}
        </Text>

        {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

        {/* Item Name */}
        <TextInput
          placeholder={t('createPost.itemNamePlaceholder') || 'Item Name'}
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        {/* Category Button */}
        <TouchableOpacity
          style={styles.categoryButton}
          onPress={() => setCategoryModalVisible(true)}
        >
          <Text style={styles.categoryButtonText}>
            {category ||
              (t('createPost.categoryPlaceholder') || 'Tap to select category')}
          </Text>
        </TouchableOpacity>

        {/* Description */}
        <TextInput
          placeholder={t('createPost.descriptionPlaceholder') || 'Description'}
          value={description}
          onChangeText={setDescription}
          style={[styles.input, styles.descriptionInput]}
          multiline
        />

        {/* Separator line */}
        <View style={styles.separatorLine} />

        {/* Upload Photos label */}
        <Text style={[styles.label, { marginTop: -10, marginBottom: 15 } ]}>
          {t('createPost.uploadPhotos') || 'Upload Photos'}
        </Text>

        {/* Images Row */}
        <View style={styles.imagesRow}>
          {photos.map((uri, index) => (
            <Image
              key={index}
              source={{ uri }}
              style={styles.imagePreview}
            />
          ))}

          {/* Plus Icon => opens dropdown */}
          <TouchableOpacity onPress={toggleImageDropdown}>
            <View style={styles.plusIconContainer}>
              <Ionicons name="add-circle-outline" size={40} color="#a3a3a3" />
            </View>
          </TouchableOpacity>
        </View>

        {uploading && (
          <Text style={styles.uploadingText}>
            {t('createPost.uploadingText') || 'Uploading image(s)...'}
          </Text>
        )}

        {/* Separator line */}
        <View style={styles.separatorLine} />

        {/* Map section label */}
        <Text style={[styles.label, { marginTop: -10, marginBottom: 15 }]}>
          {t('createPost.pickLocationLabel') || 'Where did you find this item?'}
        </Text>
        
        {/* Map container */}
        <TouchableOpacity
          style={styles.mapContainer}
          onPress={() =>
            navigation.navigate('PickLocation', {
              currentLocation: location,
              formState: { name, category, description, photos },
            })
          }
        >
          <MapView
            style={styles.map}
            pointerEvents="none"
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
          <View style={styles.mapOverlay}>
            <Text style={styles.mapOverlayText}>
              {t('createPost.pickLocationOverlay') || 'Press to pick location'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Create Post Button */}
        <TouchableOpacity style={styles.createButton} onPress={handleCreatePost}>
          <Text style={styles.createButtonText}>
            {t('createPost.createButton') || 'Create Post'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Image dropdown (on top of everything) */}
      {isImageDropdownOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setImageDropdownOpen(false)}
        >
          <TouchableWithoutFeedback>
            <View style={styles.dropdown}>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handleImageOption('takePhoto')}
              >
                <Text style={styles.dropdownText}>
                  {t('createPost.addImageOptions.takePhoto') || 'Take Photo'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handleImageOption('choose')}
              >
                <Text style={styles.dropdownText}>
                  {t('createPost.addImageOptions.chooseFromLibrary') || 'Choose from Library'}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      )}

      {/* Category Modal with Searchable List */}
      <Modal
        visible={categoryModalVisible}
        animationType="slide"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            {t('createPost.addImageOptions.title') || 'Select a Category'}
           
          </Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search categories..."
            value={categorySearch}
            onChangeText={setCategorySearch}
          />

          <FlatList
            data={filteredCategories}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.categoryItem}
                onPress={() => handleSelectCategory(item)}
              >
                <Text style={styles.categoryItemText}>{item}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={{ textAlign: 'center', marginTop: 20 }}>
                No matching categories found.
              </Text>
            }
          />

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setCategoryModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>
              {t('createPost.addImageOptions.cancel') || 'Close'}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // Loading screen
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Main container
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '700',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    padding: 10,
    marginBottom: 15,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  descriptionInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  separatorLine: {
    height: 1,
    backgroundColor: '#cbd5e1',
    marginVertical: 20,
    marginHorizontal: 0,
  },
  label: {
    fontWeight: '600',
    fontSize: 16,
  },
  imagesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 5,
    alignItems: 'center',
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginRight: 10,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    resizeMode: 'cover',
  },
  plusIconContainer: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 5,
  },
  uploadingText: {
    fontStyle: 'italic',
    marginBottom: 15,
    textAlign: 'center',
  },
  mapContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 15,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapOverlayText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#0284c7',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  categoryButton: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    padding: 12,
    borderRadius: 6,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  categoryButtonText: {
    color: '#333',
  },

  // Image dropdown on top
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 9999,
  },
  dropdown: {
    position: 'absolute',
    top: '50%',
    left: '25%',
    width: 180,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    zIndex: 9999,
    alignItems: 'center',
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 10,
    color: '#333',
  },
  dropdownItem: {
    width: '100%',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 14,
    color: '#1f2937',
  },

  // Category modal
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 40,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  categoryItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  categoryItemText: {
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: '#0284c7',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
