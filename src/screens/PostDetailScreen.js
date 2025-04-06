import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
} from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import MapView, { Circle } from 'react-native-maps';
import { db } from '../config/firebaseConfig';
import { sendRequest } from '../utils/requestUtils';
import { AuthContext } from '../contexts/AuthContext';

export default function PostDetailScreen({ route, navigation }) {
  const { postId } = route.params;
  const [post, setPost] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [approxRegion, setApproxRegion] = useState(null);
  const { user } = useContext(AuthContext);

  // Compute approximate location only once after the post is loaded.
  const getApproximateLocation = (loc) => {
    const offset = (Math.random() - 0.5) * 0.002; // ±0.001 approx
    return {
      latitude: loc.latitude + offset,
      longitude: loc.longitude + offset,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  };

  useEffect(() => {
    async function fetchPost() {
      try {
        const docRef = doc(db, 'foundPosts', postId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const postData = { id: docSnap.id, ...docSnap.data() };
          setPost(postData);
          if (postData.location) {
            setApproxRegion(getApproximateLocation(postData.location));
          }
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
  }, [postId, navigation]);

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

  // Use the stored approximate region (if available)
  const region = approxRegion || {
    latitude: post.location.latitude,
    longitude: post.location.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{post.name}</Text>
        <Text style={styles.category}>Category: {post.category}</Text>
        <Text style={styles.description}>{post.description}</Text>
        <Text style={styles.location}>Approximate Location:</Text>
        <TouchableOpacity onPress={() => navigation.navigate('FullMap', { location: post.location })}>
          <MapView
            style={styles.mapPreview}
            provider={Platform.OS === 'android' ? 'google' : undefined}
            region={region}
            pointerEvents="none" // disables interaction for preview
          >
            <Circle
              center={region}
              radius={300} 
              strokeColor="rgba(0,0,255,0.5)"
              fillColor="rgba(0,0,255,0.2)"
            />
          </MapView>
        </TouchableOpacity>
        {post.photos && post.photos.length > 0 && (
          <ScrollView horizontal style={styles.photosContainer}>
            {post.photos.map((url, index) => (
              <Image key={index} source={{ uri: url }} style={styles.photo} />
            ))}
          </ScrollView>
        )}
        <Text style={styles.additionalInfo}>Additional Info: {post.additionalInfo}</Text>
        <Text style={styles.status}>Status: {post.status}</Text>
        
        {/* Conditionally render request section only if the current user did not create this post */}
        {user.uid !== post.creatorId ? (
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
        ) : (
          <View style={styles.requestContainer}>
            <Text style={styles.requestTitle}>You cannot send a request for your own post.</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 10 },
  category: { fontSize: 16, fontStyle: 'italic', marginBottom: 5 },
  description: { fontSize: 16, marginBottom: 10 },
  location: { fontSize: 16, marginBottom: 5 },
  mapPreview: { width: Dimensions.get('window').width - 40, height: 150, borderRadius: 10, marginBottom: 10 },
  photosContainer: { marginVertical: 10 },
  photo: { width: 200, height: 200, marginRight: 10 },
  additionalInfo: { fontSize: 16, marginBottom: 10 },
  status: { fontSize: 16, marginBottom: 20 },
  requestContainer: { borderTopWidth: 1, borderTopColor: '#ccc', paddingTop: 20 },
  requestTitle: { fontSize: 18, marginBottom: 10 },
  requestInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    minHeight: 60,
    textAlignVertical: 'top',
  },
});
