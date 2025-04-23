import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
} from 'react-native';
import MapView, { Circle } from 'react-native-maps';
import { doc, getDoc } from 'firebase/firestore';

import { db } from '../config/firebaseConfig';
import { sendRequest } from '../utils/requestUtils';
import { AuthContext } from '../contexts/AuthContext';

// For i18n
import { useTranslation } from 'react-i18next';

// For location approximation & translation
import { getLanguagePreference } from '../utils/languageStorage';
import { translateText } from '../utils/translateUtils';

// Screen sizing
const screenWidth = Dimensions.get('window').width;

export default function PostDetailScreen({ route, navigation }) {
  const { postId } = route.params;
  const { user } = useContext(AuthContext);

  // Post data
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  // Request message
  const [requestMessage, setRequestMessage] = useState('');

  // Approx location
  const [approxRegion, setApproxRegion] = useState(null);

  // For translation
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [translatedDescription, setTranslatedDescription] = useState(null);
  const [translating, setTranslating] = useState(false);

  const { t } = useTranslation(); // i18n hook

  // Photos showcase
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Load user’s language preference
  useEffect(() => {
    (async () => {
      const lang = await getLanguagePreference();
      setPreferredLanguage(lang || 'en');
    })();
  }, []);

  // Helper: approximate location
  const getApproximateLocation = (loc) => {
    // ±0.0015 ~ 150m offset
    const offset = (Math.random() - 0.5) * 0.003;
    return {
      latitude: loc.latitude + offset,
      longitude: loc.longitude + offset,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  };

  // Fetch post from Firestore
  useEffect(() => {
    async function fetchPost() {
      try {
        const docRef = doc(db, 'foundPosts', postId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const postData = { id: docSnap.id, ...docSnap.data() };
          setPost(postData);
          // Approx location
          if (postData.location) {
            setApproxRegion(getApproximateLocation(postData.location));
          }
        } else {
          Alert.alert('Error', t('postDetail.postNotFound'));
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
  }, [postId, navigation, t]);

  // Send request to the post’s creator
  const handleSendRequest = async () => {
    if (!post) return;
    if (!requestMessage.trim()) {
      Alert.alert('Validation', t('postDetail.emptyMessageAlert'));
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
      Alert.alert('Success', t('postDetail.successRequest'));
      setRequestMessage('');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  // Translate the post's description
  const handleTranslateDescription = async () => {
    if (!post || !post.description) return;
    try {
      setTranslating(true);
      const translated = await translateText(post.description, preferredLanguage);
      if (translated) {
        setTranslatedDescription(translated);
      } else {
        Alert.alert(
          t('postDetail.translationErrorTitle'),
          t('postDetail.translationError')
        );
      }
    } catch (error) {
      console.error('Translation error:', error);
      Alert.alert(
        t('postDetail.translationErrorTitle'),
        t('postDetail.translationError')
      );
    } finally {
      setTranslating(false);
    }
  };

  // If still loading
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>{t('postDetail.loadingPost')}</Text>
      </View>
    );
  }

  // If no post
  if (!post) {
    return (
      <View style={styles.loadingContainer}>
        <Text>{t('postDetail.postNotFound')}</Text>
      </View>
    );
  }

  // Region for the map
  const region = approxRegion || {
    latitude: post.location.latitude,
    longitude: post.location.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  // Photo swipe handler
  const handlePhotoScroll = (e) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / screenWidth);
    setCurrentPhotoIndex(index);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#f9fafb' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* PHOTOS SHOWCASE at top */}
        {post.photos && post.photos.length > 0 ? (
          <View style={styles.photosShowcaseContainer}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handlePhotoScroll}
              scrollEventThrottle={16}
              style={styles.showcaseScroll}
            >
              {post.photos.map((url, idx) => (
                <Image
                  key={idx}
                  source={{ uri: url }}
                  style={styles.showcaseImage}
                />
              ))}
            </ScrollView>

            {/* Dots indicator  */}
            <View style={styles.dotsContainer}>
              {post.photos.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.dot,
                    idx === currentPhotoIndex && styles.activeDot,
                  ]}
                />
              ))}
            </View>
          </View>
        ) : null}

        {/* NAME + CATEGORY */}
        <View style={styles.nameCategoryContainer}>
          <Text style={styles.title}>{post.name}</Text>
          <Text style={styles.category}>
            {t('postDetail.categoryLabel')}: {post.category}
          </Text>
        </View>

        {/* Separator line */}
        <View style={styles.separatorLine} />

        {/* DESCRIPTION (with small Translate btn) */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionLabel}>
            {t('postDetail.descriptionLabel')}
          </Text>
          <Text style={styles.descriptionText}>
            {translatedDescription || post.description}
          </Text>

          {/* Small button for translate */}
          {!translatedDescription && (
            <TouchableOpacity
              style={styles.translateButton}
              onPress={handleTranslateDescription}
            >
              {translating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.translateButtonText}>
                  {t('postDetail.translateButton')}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Separator line */}
        <View style={styles.separatorLine} />

        {/* MAP (with border) */}
        <Text style={styles.locationLabel}>
          {t('postDetail.locationLabel')}
        </Text>
        <TouchableOpacity
          style={styles.mapContainer}
          onPress={() =>
            navigation.navigate('FullMap', { location: post.location })
          }
        >
          <MapView
            style={styles.mapPreview}
            pointerEvents="none"
            provider={Platform.OS === 'android' ? 'google' : undefined}
            region={region}
          >
            <Circle
              center={region}
              radius={300}
              strokeColor="rgba(0,0,255,0.5)"
              fillColor="rgba(0,0,255,0.2)"
            />
          </MapView>
        </TouchableOpacity>

       

        {/* If not owner => Request form */}
        {user.uid !== post.creatorId ? (
          <View style={styles.requestContainer}>
            <Text style={styles.requestTitle}>{t('postDetail.requestTitle')}</Text>
            <TextInput
              style={styles.requestInput}
              placeholder={t('postDetail.requestPlaceholder')}
              value={requestMessage}
              onChangeText={setRequestMessage}
              multiline
            />
            <TouchableOpacity style={styles.sendRequestButton} onPress={handleSendRequest}>
              <Text style={styles.sendRequestButtonText}>
                {t('postDetail.sendRequestButton')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.requestContainer}>
            <Text style={styles.ownPostNote}>
              {t('postDetail.ownPostNote')}
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  container: {
    paddingBottom: 20,
    backgroundColor: '#f9fafb',
  },

  // Photos Showcase
  photosShowcaseContainer: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    overflow: 'hidden',
    marginHorizontal: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  showcaseScroll: {
    width: Dimensions.get('window').width - 24, // a bit less than container width
  },
  showcaseImage: {
    width: Dimensions.get('window').width - 24, // full width for paging
    height: 300,
    resizeMode: 'cover',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9ca3af',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#0284c7',
  },

  // Name + Category
  nameCategoryContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 5,
    marginTop: 5,
  },
  category: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#6b7280',
  },

  // Separator line 
  separatorLine: {
    height: 1,
    backgroundColor: '#cbd5e1',
    marginVertical: 20,
    marginHorizontal: 20,
  },

  // Description
  descriptionContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  descriptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1f2937',
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#1f2937',
    paddingRight: 10, // so text doesn't overlap the translate btn
  },
  translateButton: {
    position: 'absolute',
    bottom: -30,
    right: 0,
    backgroundColor: '#0284c7',
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    margin: 3,
  },
  translateButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },

  // Map (with border)
  locationLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 20,
    marginBottom: 8,
    color: '#1f2937',
  },
  mapContainer: {
    marginHorizontal: 23,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 20,
  },
  mapPreview: {
    width: Dimensions.get('window').width - 48,
    height: 200,
  },

  // Status
  status: {
    fontSize: 16,
    color: '#1f2937',
    marginHorizontal: 20,
    marginBottom: 20,
  },

  // Request container
  requestContainer: {
    borderTopWidth: 1,
    borderTopColor: '#cbd5e1',
    paddingTop: 20,
    marginHorizontal: 20,
  },
  requestTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 10,
  },
  requestInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    backgroundColor: '#fff',
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  sendRequestButton: {
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  sendRequestButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  ownPostNote: {
    fontSize: 16,
    color: '#6b7280',
  },
});
