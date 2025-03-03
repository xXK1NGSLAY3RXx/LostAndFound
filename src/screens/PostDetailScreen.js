// src/screens/PostDetailScreen.js
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { sendRequest } from '../utils/requestUtils';
import { AuthContext } from '../contexts/AuthContext';


export default function PostDetailScreen({ route, navigation }) {
  const { postId } = route.params;
  const [post, setPost] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    async function fetchPost() {
      try {
        const docRef = doc(db, 'foundPosts', postId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPost({ id: docSnap.id, ...docSnap.data() });
        } else {
          Alert.alert('Error', 'Post not found.');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        Alert.alert('Error', 'There was an error fetching the post.');
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [postId]);

  const handleSendRequest = async () => {
    if (!post) return;
    if (!requestMessage.trim()) {
      Alert.alert('Validation', 'Please enter a message for your request.');
      return;
    }
    
    const requestData = {
      senderId: user.uid,
      founderId: post.creatorId,
      itemId: post.id,
      description: requestMessage,
    };
  
    try {
      await sendRequest(requestData);
      Alert.alert('Success', 'Your request has been sent.');
      setRequestMessage('');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Loading post...</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Post not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{post.name}</Text>
      <Text style={styles.category}>Category: {post.category}</Text>
      <Text style={styles.description}>{post.description}</Text>
      <Text style={styles.location}>
        Location:{' '}
        {post.location.address ||
          `Lat: ${post.location.latitude}, Lng: ${post.location.longitude}`}
      </Text>
      {post.photos && post.photos.length > 0 && (
        <ScrollView horizontal style={styles.photosContainer}>
          {post.photos.map((url, index) => (
            <Image key={index} source={{ uri: url }} style={styles.photo} />
          ))}
        </ScrollView>
      )}
      <Text style={styles.additionalInfo}>Additional Info: {post.additionalInfo}</Text>
      <Text style={styles.status}>Status: {post.status}</Text>
      <View style={styles.requestContainer}>
        <Text style={styles.requestTitle}>Send Request to Claim this Item</Text>
        <TextInput
          style={styles.requestInput}
          placeholder="Enter your message"
          value={requestMessage}
          onChangeText={setRequestMessage}
          multiline
        />
        <Button title="Send Request" onPress={handleSendRequest} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 10 },
  category: { fontSize: 16, fontStyle: 'italic', marginBottom: 5 },
  description: { fontSize: 16, marginBottom: 10 },
  location: { fontSize: 16, marginBottom: 10 },
  photosContainer: { marginVertical: 10 },
  photo: { width: 200, height: 200, marginRight: 10 },
  additionalInfo: { fontSize: 16, marginBottom: 10 },
  status: { fontSize: 16, marginBottom: 20 },
  requestContainer: { borderTopWidth: 1, borderTopColor: '#ccc', paddingTop: 20 },
  requestTitle: { fontSize: 18, marginBottom: 10 },
  requestInput: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, minHeight: 60, textAlignVertical: 'top' },
});
