import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { AuthContext } from '../contexts/AuthContext';

export default function FoundScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]); // Stores the list of found posts
  const [loading, setLoading] = useState(true); // Indicates loading state

  useEffect(() => {
    async function fetchUserPosts() {
      try {
        // Query Firestore for posts created by the current user, ordered by creation date
        const q = query(
          collection(db, 'foundPosts'),
          where('creatorId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const data = [];
        querySnapshot.forEach(doc => {
          data.push({ id: doc.id, ...doc.data() });
        });
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserPosts();
  }, [user.uid]); // Re-run effect when user UID changes

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Renders each post as a touchable item navigating to the PostDetail screen
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.postItem}
      onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
    >
      <Text style={styles.postTitle}>{item.name}</Text>
      <Text numberOfLines={1} style={styles.postCategory}>Category: {item.category}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No posts found.</Text>}
      />
      
      {/* Button to navigate to the Create Post screen */}
      <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate('CreatePost')}>
        <Text style={styles.createButtonText}>Create Post</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  postItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  postTitle: { fontSize: 18, fontWeight: 'bold' },
  postCategory: { fontSize: 14, color: '#555' },
  emptyText: { textAlign: 'center', marginTop: 20, fontSize: 16 },
  createButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 30,
  },
  createButtonText: { color: 'white', fontSize: 16 },
});
