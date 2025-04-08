import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

export default function LostFoundItem({
  item,
  onPressView,
  showStatus = false,  // if true, display item.status
}) {
  // item.photos is an array; pick first image or a placeholder
  const thumbnailUri =
    item.photos && item.photos.length > 0
      ? item.photos[0]
      : 'https://via.placeholder.com/80?text=No+Image';

  // Convert Firestore Timestamp to JS date
  let dateFound = null;
  if (item.createdAt && item.createdAt.toDate) {
    dateFound = item.createdAt.toDate();
  }

  return (
    <View style={styles.container}>
      {/* Thumbnail on the left */}
      <Image source={{ uri: thumbnailUri }} style={styles.thumbnail} />

      {/* Middle text section */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.category}>Category: {item.category}</Text>
        {/* If we have a date, show it. Format as desired. */}
        {dateFound && (
          <Text style={styles.date}>
            Date Found: {dateFound.toDateString()}
          </Text>
        )}
        {/* Optionally show status for FoundScreen items */}
        {showStatus && item.status && (
          <Text style={styles.status}>Status: {item.status}</Text>
        )}
      </View>

      {/* “View” button on the right */}
      <TouchableOpacity style={styles.viewButton} onPress={onPressView}>
        <Text style={styles.viewButtonText}>View</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 6,
    marginRight: 10,
    backgroundColor: '#eee',
  },
  textContainer: {
    flex: 1, // take remaining space
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  category: {
    color: '#555',
    marginTop: 2,
  },
  date: {
    color: '#555',
    marginTop: 2,
  },
  status: {
    marginTop: 2,
    fontStyle: 'italic',
  },
  viewButton: {
    backgroundColor: '#007bff',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  viewButtonText: {
    color: '#fff',
  },
});
