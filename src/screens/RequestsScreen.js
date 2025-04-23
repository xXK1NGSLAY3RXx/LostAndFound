import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Button
} from 'react-native';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { AuthContext } from '../contexts/AuthContext';
import { approveRequest } from '../utils/requestUtils';
import { useTranslation } from 'react-i18next';

// Helper component: fetch and display user's name
function UserName({ userId }) {
  const [name, setName] = useState(null);

  useEffect(() => {
    async function fetchUserName() {
      try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
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

// Helper component: fetch and display founder's contact email
function FounderContact({ founderId }) {
  const [founderEmail, setFounderEmail] = useState(null);

  useEffect(() => {
    async function fetchFounderContact() {
      try {
        const founderRef = doc(db, 'users', founderId);
        const founderSnap = await getDoc(founderRef);
        if (founderSnap.exists()) {
          setFounderEmail(founderSnap.data().email || 'No email found');
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

  const { t } = useTranslation();

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
        Alert.alert(t('requestScreen.requestError'), error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, [user.uid]);

  // Render a sent request item (user is requester)
  const renderSentItem = ({ item }) => (
    <View style={styles.requestContainer}>
      <Text style={styles.requestText}>
        {t('requestScreen.messageLabel', { defaultValue: 'Message:' })} {item.description}
      </Text>
      <Text
        style={[
          styles.requestStatus,
          item.status === 'approved' ? styles.approvedStatus : styles.pendingStatus,
        ]}
      >
        {item.status}
      </Text>
      {item.status === 'approved' && (
        <View style={styles.contactContainer}>
          <Text style={styles.requestText}>
            {t('requestScreen.founderContactLabel', { defaultValue: 'Founder Contact:' })}
          </Text>
          <FounderContact founderId={item.founderId} />
        </View>
      )}
    </View>
  );

  // Render a received request item 
  const renderReceivedItem = ({ item }) => (
    <View style={styles.requestContainer}>
      <Text style={styles.requestText}>
        {t('requestScreen.fromLabel', { defaultValue: 'From:' })} <UserName userId={item.senderId} />
      </Text>
      <Text style={styles.requestText}>
        {t('requestScreen.messageLabel', { defaultValue: 'Message:' })} {item.description}
      </Text>
      <Text
        style={[
          styles.requestStatus,
          item.status === 'approved' ? styles.approvedStatus : styles.pendingStatus,
        ]}
      >
        {item.status}
      </Text>
      {item.status === 'pending' && (
        <TouchableOpacity style={styles.approveButton} onPress={() => handleApprove(item.id)}>
          <Text style={styles.approveButtonText}>{t('requestScreen.approveRequest', { defaultValue: 'Approve Request' })}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const handleApprove = async (requestId) => {
    try {
      await approveRequest(requestId);
      Alert.alert(t('requestScreen.successApprove', { defaultValue: 'Request approved.' }));
      setReceivedRequests(
        receivedRequests.map(req =>
          req.id === requestId ? { ...req, status: 'approved' } : req
        )
      );
    } catch (error) {
      Alert.alert(t('requestScreen.requestError', { defaultValue: 'Error' }), error.message);
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
        return <Text style={styles.noRequestText}>{t('requestScreen.noSentRequests', { defaultValue: "You haven't sent any requests." })}</Text>;
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
        return <Text style={styles.noRequestText}>{t('requestScreen.noReceivedRequests', { defaultValue: "You haven't received any requests." })}</Text>;
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
          <Text style={styles.tabText}>{t('requestScreen.receivedTab', { defaultValue: 'Received' })}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'sent' && styles.activeTab]}
          onPress={() => setSelectedTab('sent')}
        >
          <Text style={styles.tabText}>{t('requestScreen.sentTab', { defaultValue: 'Sent' })}</Text>
        </TouchableOpacity>
      </View>
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9fafb' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  requestContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  requestText: { fontSize: 16, marginBottom: 5 },
  requestStatus: { fontSize: 16, marginBottom: 5 },
  pendingStatus: { color: '#000' },
  approvedStatus: { color: 'green' },
  approveButton: {
    backgroundColor: '#0284c7',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  approveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  noRequestText: { textAlign: 'center', marginTop: 20, fontSize: 16 },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  tabButton: { padding: 10 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#0284c7' },
  tabText: { fontSize: 16 },
  contactContainer: { flexDirection: 'row', alignItems: 'center' },
  contactText: { marginLeft: 5, color: 'green', fontWeight: 'bold' },
});
