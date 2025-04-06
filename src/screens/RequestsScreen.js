import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  Button,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { AuthContext } from '../contexts/AuthContext';
import { approveRequest } from '../utils/requestUtils';

// Helper component to display a user's full name fetched from the users collection
function UserName({ userId }) {
  const [name, setName] = useState(null);

  useEffect(() => {
    async function fetchUserName() {
      try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          // Assuming the user document has a 'name' field
          setName(userSnap.data().name);
        } else {
          setName('Unknown');
        }
      } catch (error) {
        console.error('Error fetching user name:', error);
        setName('Error');
      }
    }
    fetchUserName();
  }, [userId]);

  return <Text>{name || 'Loading...'}</Text>;
}

// Helper component to automatically fetch and display the founder's email if the request is approved
function FounderContact({ founderId }) {
  const [founderEmail, setFounderEmail] = useState(null);

  useEffect(() => {
    async function fetchFounderContact() {
      try {
        const founderRef = doc(db, 'users', founderId);
        const founderSnap = await getDoc(founderRef);
        if (founderSnap.exists()) {
          const email = founderSnap.data().email;
          setFounderEmail(email || 'No email found');
        } else {
          setFounderEmail('Founder not found');
        }
      } catch (error) {
        console.error('Error fetching founder contact:', error);
        setFounderEmail('Error fetching contact');
      }
    }
    fetchFounderContact();
  }, [founderId]);

  if (!founderEmail) {
    return <Text>Loading contact...</Text>;
  }
  return <Text style={styles.contactText}>{founderEmail}</Text>;
}

export default function RequestsScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [selectedTab, setSelectedTab] = useState('received'); // 'received' or 'sent'
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRequests() {
      try {
        // Fetch requests sent by the current user
        const sentQuery = query(collection(db, 'requests'), where('senderId', '==', user.uid));
        const sentSnapshot = await getDocs(sentQuery);
        const sentData = [];
        sentSnapshot.forEach(doc => {
          sentData.push({ id: doc.id, ...doc.data() });
        });

        // Fetch requests received by the current user
        const receivedQuery = query(collection(db, 'requests'), where('founderId', '==', user.uid));
        const receivedSnapshot = await getDocs(receivedQuery);
        const receivedData = [];
        receivedSnapshot.forEach(doc => {
          receivedData.push({ id: doc.id, ...doc.data() });
        });

        setSentRequests(sentData);
        setReceivedRequests(receivedData);
      } catch (error) {
        console.error('Error fetching requests:', error);
        Alert.alert('Error', error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, [user.uid]);

  // Renders a sent request item (the user is the requester)
  // If approved, automatically shows founder's contact
  const renderSentItem = ({ item }) => (
    <View style={styles.requestContainer}>
      <Text style={styles.requestText}>Message: {item.description}</Text>
      <Text style={styles.requestText}>Status: {item.status}</Text>
      {item.status === 'approved' && (
        <View style={styles.contactContainer}>
          <Text style={styles.requestText}>Founder Contact:</Text>
          <FounderContact founderId={item.founderId} />
        </View>
      )}
    </View>
  );

  // Renders a received request item (the user is the founder)
  // If pending, shows "Approve Request" button; if approved, displays "Approved"
  const renderReceivedItem = ({ item }) => (
    <View style={styles.requestContainer}>
      <Text style={styles.requestText}>
        From: <UserName userId={item.senderId} />
      </Text>
      <Text style={styles.requestText}>Message: {item.description}</Text>
      <Text style={styles.requestText}>Status: {item.status}</Text>
      {item.status === 'pending' ? (
        <Button title="Approve Request" onPress={() => handleApprove(item.id)} />
      ) : (
        <Text style={styles.approvedText}>Approved</Text>
      )}
    </View>
  );

  const handleApprove = async (requestId) => {
    try {
      await approveRequest(requestId);
      Alert.alert('Success', 'Request approved.');
      // Update local state
      setReceivedRequests(
        receivedRequests.map(req =>
          req.id === requestId ? { ...req, status: 'approved' } : req
        )
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const renderContent = () => {
    if (selectedTab === 'sent') {
      if (sentRequests.length === 0) {
        return <Text style={styles.noRequestText}>You haven't sent any requests.</Text>;
      }
      return (
        <FlatList
          data={sentRequests}
          keyExtractor={(item) => item.id}
          renderItem={renderSentItem}
        />
      );
    } else {
      if (receivedRequests.length === 0) {
        return <Text style={styles.noRequestText}>You haven't received any requests.</Text>;
      }
      return (
        <FlatList
          data={receivedRequests}
          keyExtractor={(item) => item.id}
          renderItem={renderReceivedItem}
        />
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'received' && styles.activeTab]}
          onPress={() => setSelectedTab('received')}
        >
          <Text style={styles.tabText}>Received</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'sent' && styles.activeTab]}
          onPress={() => setSelectedTab('sent')}
        >
          <Text style={styles.tabText}>Sent</Text>
        </TouchableOpacity>
      </View>
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  requestContainer: { marginBottom: 15, padding: 10, borderWidth: 1, borderColor: 'gray' },
  requestText: { fontSize: 16, marginBottom: 5 },
  approvedText: { fontSize: 16, fontWeight: 'bold', color: 'green' },
  noRequestText: { textAlign: 'center', marginTop: 20, fontSize: 16 },
  tabContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  tabButton: { padding: 10 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: 'blue' },
  tabText: { fontSize: 16 },
  contactContainer: { flexDirection: 'row', alignItems: 'center' },
  contactText: { marginLeft: 5, color: 'green', fontWeight: 'bold' },
});
