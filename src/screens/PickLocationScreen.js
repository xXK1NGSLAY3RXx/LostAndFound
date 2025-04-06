import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Platform } from 'react-native';
import MapView from 'react-native-maps';

export default function PickLocationScreen({ navigation, route }) {
  // Use passed currentLocation if available; otherwise fallback to default location (San Francisco)
  const initialRegion = route.params?.currentLocation
    ? {
        latitude: route.params.currentLocation.latitude - 0.0003, // Slight offset for positioning
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

  const [region, setRegion] = useState(initialRegion);

  // Updates the region state when the user moves or zooms the map
  const handleRegionChangeComplete = (newRegion) => {
    setRegion(newRegion);
  };

  // Confirms the location and passes it back to CreatePost screen
  const handleConfirmLocation = () => {
    if (region) {
      navigation.replace('CreatePost', {
        pickedLocation: {
          latitude: region.latitude + 0.00015, // Slight adjustment to marker position
          longitude: region.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        formState: route.params?.formState, // Preserve form state if available
      });
    } else {
      alert("Please adjust the map to set a location");
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={Platform.OS === 'android' ? 'google' : undefined}
        initialRegion={initialRegion}
        onRegionChangeComplete={handleRegionChangeComplete}
      />
      
      {/* Fixed marker overlay in the center of the screen */}
      <View style={styles.fixedMarkerContainer}>
        <View style={styles.fixedMarker} />
      </View>
      
      {/* Button to confirm the selected location */}
      <TouchableOpacity style={styles.button} onPress={handleConfirmLocation}>
        <Text style={styles.buttonText}>Confirm Location</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
  fixedMarkerContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -10, // Center marker horizontally
    marginTop: -10, // Center marker vertically
    zIndex: 1,
  },
  fixedMarker: {
    width: 20,
    height: 20,
    backgroundColor: 'red',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
  },
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
