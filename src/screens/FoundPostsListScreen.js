// src/screens/FoundPostsListScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

export default function FoundPostsListScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const querySnapshot = await getDocs(collection(db, 'foundPosts'));
        const postsData = [];
        querySnapshot.forEach(doc => {
          postsData.push({ id: doc.id, ...doc.data() });
        });
        setPosts(postsData);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!posts.length) {
    return (
      <View style={styles.container}>
        <Text>No posts found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('PostDetail', { postId: item.id })}>
            <View style={styles.postContainer}>
              <Text style={styles.postTitle}>{item.name}</Text>
              <Text>{item.description}</Text>
              <Text>Status: {item.status}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  postContainer: { marginBottom: 15, padding: 10, borderWidth: 1, borderColor: 'gray' },
  postTitle: { fontSize: 18, fontWeight: 'bold' },
});
