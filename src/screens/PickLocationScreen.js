// src/screens/PickLocationScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function PickLocationScreen({ navigation, route }) {
  // Use the passed currentLocation if available; otherwise, fallback to a default
  const initialRegion = route.params?.currentLocation
    ? {
        latitude: route.params.currentLocation.latitude,
        longitude: route.params.currentLocation.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }
    : {
        latitude: 37.7749,
        longitude: -122.4194,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };

  const [selectedLocation, setSelectedLocation] = useState(initialRegion);

  const handleLongPress = (event) => {
    const coords = event.nativeEvent.coordinate;
    setSelectedLocation({
      ...coords,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    });
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      navigation.navigate('CreatePost', { pickedLocation: selectedLocation });
    } else {
      alert("Please select a location by long pressing on the map");
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        // On Android, use Google Maps; iOS will use Apple Maps by default.
        provider={Platform.OS === 'android' ? 'google' : undefined}
        initialRegion={initialRegion}
        onLongPress={Platform.OS !== 'web' ? handleLongPress : undefined}
      >
        {selectedLocation && Platform.OS !== 'web' && <Marker coordinate={selectedLocation} />}
      </MapView>
      <TouchableOpacity style={styles.button} onPress={handleConfirmLocation}>
        <Text style={styles.buttonText}>Confirm Location</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
  button: {
    position: 'absolute',
    bottom: 20,
    left: '25%',
    right: '25%',
    backgroundColor: 'blue',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontSize: 18 },
});
