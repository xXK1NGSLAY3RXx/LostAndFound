import { addDoc, collection, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

/**
 * Sends a new request for a found post.
 * @param {Object} requestData - Object containing { senderId, founderId, itemId, description }
 */
export async function sendRequest(requestData) {
  try {
    const docRef = await addDoc(collection(db, "requests"), {
      ...requestData,
      createdDate: serverTimestamp(),
      status: "pending",
    });
    return docRef.id;
  } catch (error) {
    throw new Error("Error sending request: " + error.message);
  }
}

/**
 * Approves a request by updating its status to 'approved'.
 * @param {string} requestId - ID of the request to approve.
 */
export async function approveRequest(requestId) {
  try {
    const requestRef = doc(db, "requests", requestId);
    await updateDoc(requestRef, {
      status: "approved",
    });
  } catch (error) {
    throw new Error("Error approving request: " + error.message);
  }
}
