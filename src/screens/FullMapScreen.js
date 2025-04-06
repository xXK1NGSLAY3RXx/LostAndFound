import React from 'react';
import { View, StyleSheet, Platform, Dimensions } from 'react-native';
import MapView, { Circle } from 'react-native-maps';

export default function FullMapScreen({ navigation, route }) {
  // Expect a location passed from PostDetailScreen; otherwise, use a fallback location (San Francisco)
  const { location } = route.params || {};
  const exactLocation = location || { latitude: 37.7749, longitude: -122.4194 };

  // Create a small random offset to obscure the exact location for privacy reasons
  const randomOffset = () => (Math.random() - 0.5) * 0.002; // Approximately ±0.001 degrees
  const approximateLocation = {
    latitude: exactLocation.latitude + randomOffset(),
    longitude: exactLocation.longitude + randomOffset(),
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={Platform.OS === 'android' ? 'google' : undefined}
        region={approximateLocation} // Set the initial region to the approximate location
      >
        {/* Display a transparent circle to indicate the general area without exposing exact details */}
        <Circle
          center={approximateLocation}
          radius={300} // Radius in meters; adjust based on privacy requirements
          strokeColor="rgba(0,0,255,0.5)"
          fillColor="rgba(0,0,255,0.2)"
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 5,
  },
  backButtonText: { color: 'white', fontSize: 16 },
});