import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function LostFoundItem({ item, onPressView, showStatus = false }) {
  const { t } = useTranslation();

  const thumbnailUri =
    item.photos && item.photos.length > 0
      ? item.photos[0]
      : 'https://via.placeholder.com/80?text=No+Image';

  let dateFound = null;
  if (item.createdAt && item.createdAt.toDate) {
    dateFound = item.createdAt.toDate();
  }

  return (
    <TouchableOpacity style={styles.container} onPress={onPressView}>
      <Image source={{ uri: thumbnailUri }} style={styles.thumbnail} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.category}>
          {t('lostFoundItem.categoryLabel', { defaultValue: 'Category:' })} {item.category}
        </Text>
        {dateFound && (
          <Text style={styles.date}>
            {t('lostFoundItem.dateFoundLabel', { defaultValue: 'Date Found:' })} {dateFound.toDateString()}
          </Text>
        )}
        {showStatus && item.status && (
          <Text style={styles.status}>
            {t('lostFoundItem.statusLabel', { defaultValue: 'Status:' })} {item.status}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    borderWidth: 2,           
    borderColor: 'black',   
    borderRadius: 12,          
    alignItems: 'center',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    marginVertical: 6,
    marginHorizontal: 5,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 6,
    marginRight: 10,
    backgroundColor: '#eee',
  },
  textContainer: {
    flex: 1,
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
});
