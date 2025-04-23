import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { AuthContext } from '../contexts/AuthContext';
import LostFoundItem from '../components/LostFoundItem';
// For translations
import { useTranslation } from 'react-i18next';

export default function FoundScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { t } = useTranslation(); // i18n translations

  // 1) Fetch once on mount
  useEffect(() => {
    fetchUserPosts();
    
  }, []); // runs only once per mount

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'foundPosts'),
        where('creatorId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const data = [];
      querySnapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...docSnap.data() });
      });
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 2) Pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchUserPosts();
  };

  // Show spinner if loading (and not manually refreshing)
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>
          {t('foundScreen.loading') || 'Loading...'}
        </Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <LostFoundItem
      item={item}
      showStatus
      onPressView={() => navigation.navigate('PostDetail', { postId: item.id })}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
          {t('foundScreen.title') || 'Loading...'}
        </Text>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {t('foundScreen.noPosts') || 'No posts found.'}
          </Text>
        }
      />

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreatePost')}
      >
        <Text style={styles.createButtonText}>
          {t('foundScreen.createPost') || 'Create Post'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// Your style
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#1f2937',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#1f2937',
  },
  createButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '700',
  },
});
