import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { collection, query, getDocs, orderBy, startAt, endAt } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { getGeohashBounds, getDistanceInMeters } from '../utils/geoUtils';
import { useNavigation } from '@react-navigation/native';

// Bottom sheet for results
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
// Optional date picker
import DateTimePicker from '@react-native-community/datetimepicker';
// Slider for radius
import Slider from '@react-native-community/slider';

// Reusable item layout
import LostFoundItem from '../components/LostFoundItem';

// 1) Import the large categories list
import { CATEGORIES } from '../constants/categoriesList';

import { useTranslation } from 'react-i18next';

export default function LostScreen() {
  // ---------------------------
  // LOCATION & MAP
  // ---------------------------
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setHasLocationPermission(true);
        try {
          const { coords } = await Location.getCurrentPositionAsync({});
          setUserLocation(coords);
          setMapRegion({
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        } catch (err) {
          console.warn('Error getting location:', err);
        }
      } else {
        // fallback region if no permission
        setMapRegion({
          latitude: 37.7749,
          longitude: -122.4194,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    })();
  }, []);

  const handleRegionChangeComplete = (region) => {
    if (region) {
      setMapRegion(region);
    }
  };

  const { t } = useTranslation(); // i18n translations

  // ---------------------------
  // SEARCH & FILTER
  // ---------------------------
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // 2) Instead of typed categoryFilter, we do a modal approach
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');

  const [dateFilter, setDateFilter] = useState(null);
  const [radius, setRadius] = useState(1); // in km

  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  // For the date picker
  const onDateChange = (event, selectedDate) => {
    if (event.type === 'set') {
      setDateFilter(selectedDate);
    }
  };

  // BOTTOM SHEET
  const bottomSheetRef = useRef(null);
  const snapPoints = ['27%', '80%']; // 27% for collapsed, 80% for expanded

  // ---------------------------
  // CATEGORY MODAL LOGIC
  // ---------------------------
  // Filter categories by user typed search
  const filteredCategories = CATEGORIES.filter((cat) =>
    cat.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const handleSelectCategory = (cat) => {
    
    setCategoryFilter(cat);
    setCategoryModalVisible(false);
  };

  // ---------------------------
  // SEARCH
  // ---------------------------
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      Alert.alert('Validation', 'Please enter an item name to search.');
      return;
    }
    if (!mapRegion) {
      Alert.alert('Location not ready', 'Map/Location not initialized.');
      return;
    }

    setLoading(true);
    setSearchResults([]);

    try {
      const centerLat = mapRegion.latitude;
      const centerLng = mapRegion.longitude;
      const radiusInMeters = radius * 1000;

      // geohash bounding box
      const bounds = getGeohashBounds([centerLat, centerLng], radiusInMeters);
      const promises = [];
      bounds.forEach(([start, end]) => {
        const qRef = query(
          collection(db, 'foundPosts'),
          orderBy('geohash'),
          startAt(start),
          endAt(end)
        );
        promises.push(getDocs(qRef));
      });

      const snapshots = await Promise.all(promises);
      let matchingDocs = [];

      snapshots.forEach((snap) => {
        snap.docs.forEach((docSnap) => {
          const data = docSnap.data();
          const lat = data.location.latitude;
          const lng = data.location.longitude;
          const distInM = getDistanceInMeters([centerLat, centerLng], [lat, lng]);

          // We only add docs within radius
          if (distInM <= radiusInMeters) {
            // Substring matching for name
            if (data.name_lower && data.name_lower.includes(searchTerm.toLowerCase())) {
              // If user selected a category, we match data.category_lower to that
              if (categoryFilter.trim()) {
                // Compare lowercased to user-lower
                // e.g. "Electronics" -> "electronics"
                const chosenCatLower = categoryFilter.toLowerCase();
                if (!data.category_lower || data.category_lower !== chosenCatLower) {
                  return; // skip
                }
              }

              // If dateFilter is chosen, skip older ones
              if (dateFilter && data.createdAt) {
                const createdAt = data.createdAt.toDate?.();
                if (createdAt && createdAt < dateFilter) {
                  return;
                }
              }

              matchingDocs.push({
                id: docSnap.id,
                ...data,
                distance: distInM,
              });
            }
          }
        });
      });

      // sort by distance
      matchingDocs.sort((a, b) => a.distance - b.distance);
      setSearchResults(matchingDocs);

      // auto-expand
      bottomSheetRef.current?.snapToIndex(1);
    } catch (err) {
      console.error('Search error:', err);
      Alert.alert('Error', t('lostScreen.searchError'));
    }

    setLoading(false);
  };


  if (!mapRegion) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>{t('lostScreen.loading')}</Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        {/* MAP */}
        <MapView
          style={StyleSheet.absoluteFillObject}
          provider={Platform.OS === 'android' ? 'google' : undefined}
          region={mapRegion}
          onRegionChangeComplete={handleRegionChangeComplete}
        >
          {hasLocationPermission && userLocation && (
            <Marker
              coordinate={{ latitude: userLocation.latitude, longitude: userLocation.longitude }}
              title="You"
            />
          )}
          <Circle
            center={{ latitude: mapRegion.latitude, longitude: mapRegion.longitude }}
            radius={radius * 1000}
            strokeColor="rgba(0,0,255,0.5)"
            fillColor="rgba(0,0,255,0.1)"
          />
        </MapView>

        {/* TOP SEARCH BAR */}
        <View style={styles.topBar}>
          <TextInput
            style={styles.searchInput}
            placeholder={t('lostScreen.searchPlaceholder')}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        {/* BOTTOM SHEET */}
        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          enableOverDrag={false}
          enablePanDownToClose={false}
        >
          <BottomSheetScrollView contentContainerStyle={styles.sheetContent}>
            {/* RADIUS SLIDER */}
            <Text style={styles.sliderLabel}>
              {t('lostScreen.sliderLabel', { value: radius })}
            </Text>
            <Slider
              style={styles.sliderStyle}
              minimumValue={1}
              maximumValue={50}
              step={1}
              value={radius}
              onValueChange={(val) => setRadius(val)}
            />

            {/* Search & Filter Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.searchBtnText}>{t('lostScreen.searchButton')}</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.filterBtn}
                onPress={() => setShowFilters((prev) => !prev)}
              >
                <Text style={styles.filterBtnText}>{t('lostScreen.filters')}</Text>
              </TouchableOpacity>
            </View>

            {/* Show filters (category & date) if toggled */}
            {showFilters && (
              <View style={styles.filterContainer}>
                <Text style={styles.filterLabel}>Category:</Text>
               
                <TouchableOpacity
                  style={styles.categoryButton}
                  onPress={() => setCategoryModalVisible(true)}
                >
                  <Text style={styles.categoryButtonText}>
                    {categoryFilter || 'Tap to select category'}
                  </Text>
                </TouchableOpacity>

                <Text style={styles.filterLabel}>{t('lostScreen.dateFilter')}</Text>
                <DateTimePicker
                  value={dateFilter || new Date()}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                  maximumDate={new Date()}
                />
              </View>
            )}

            {/* RESULTS */}
            <Text style={styles.resultTitle}>{t('lostScreen.resultTitle')}</Text>
            {searchResults.length === 0 && !loading ? (
              <Text>{t('lostScreen.noResults')}</Text>
            ) : (
              searchResults.map((item) => (
                <View key={item.id} style={styles.resultItemContainer}>
                  {/* Reusable layout */}
                  <LostFoundItem
                    item={item}
                    onPressView={() => {
                      navigation.navigate('PostDetail', { postId: item.id });
                    }}
                  />
                </View>
              ))
            )}
          </BottomSheetScrollView>
        </BottomSheet>
      </View>

      {/* 3) Category Modal for filtering */}
      <Modal
        visible={categoryModalVisible}
        animationType="slide"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{t('lostScreen.categoryFilter')}</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search categories..."
            value={categorySearch}
            onChangeText={setCategorySearch}
          />

          <FlatList
            data={filteredCategories}
            keyExtractor={(cat) => cat}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.categoryItem}
                onPress={() => {
                  handleSelectCategory(item);
                }}
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
            style={styles.closeModalBtn}
            onPress={() => setCategoryModalVisible(false)}
          >
            <Text style={{ color: '#fff' }}>{t('lostScreen.close')}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

// STYLES
const screenWidth = Dimensions.get('window').width;
const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: '#fff',
    zIndex: 999,
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginTop: 20,
    marginHorizontal: 10,
    borderRadius: 8,
  },
  searchInput: {
    backgroundColor: '#f2f2f2',
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 35,
  },
  sheetContent: {
    padding: 16,
  },
  sliderLabel: {
    fontSize: 16, marginBottom: 5,
  },
  sliderStyle: {
    width: '100%', height: 40, marginBottom: 10,
  },
  actionRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  searchBtn: {
    backgroundColor: '#0284c7',
    padding: 12, borderRadius: 8,
    alignItems: 'center',
    marginRight: 10, flex: 1,
  },
  searchBtnText: {
    color: '#fff', fontSize: 16,
  },
  filterBtn: {
    backgroundColor: 'gray',
    padding: 12, borderRadius: 8,
    alignItems: 'center',
  },
  filterBtnText: {
    color: '#fff', fontSize: 16,
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterLabel: {
    fontWeight: 'bold', marginTop: 10, marginBottom: 5,
  },
  categoryButton: {
    borderWidth: 1, borderColor: 'gray',
    padding: 10, borderRadius: 4,
    backgroundColor: '#f2f2f2',
    marginBottom: 10,
  },
  categoryButtonText: {
    color: '#333',
  },
  resultTitle: {
    fontSize: 18, fontWeight: 'bold', marginBottom: 8,
  },
  resultItemContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    marginBottom: 10,
    paddingVertical: 4,
  },

  modalContainer: {
    flex: 1, backgroundColor: '#fff', padding: 20,
  },
  modalTitle: {
    fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10,
  },
  categoryItem: {
    padding: 12,
    borderBottomWidth: 1, borderBottomColor: '#ccc',
  },
  categoryItemText: {
    fontSize: 16,
  },
  closeModalBtn: {
    backgroundColor: 'gray',
    padding: 12, borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
});
