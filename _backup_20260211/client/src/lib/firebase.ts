import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, updateDoc, QuerySnapshot, DocumentData } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Collections
export const patientsCollection = collection(db, 'patients');
export const messagesCollection = collection(db, 'messages');

// Patient request functions
export async function addPatientRequest(patientData: {
  patientName: string;
  symptom: string;
  status: 'pending' | 'replied' | 'urgent';
}) {
  try {
    const docRef = await addDoc(patientsCollection, {
      ...patientData,
      timestamp: serverTimestamp(),
      doctorReply: null
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding patient request:", error);
    throw error;
  }
}

// Update patient request with doctor reply
export async function updatePatientReply(patientId: string, reply: string) {
  try {
    const patientRef = doc(db, 'patients', patientId);
    await updateDoc(patientRef, {
      doctorReply: reply,
      status: 'replied',
      replyTimestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating patient reply:", error);
    throw error;
  }
}

// Listen to patient requests
export function subscribeToPatientRequests(callback: (patients: any[]) => void) {
  const q = query(patientsCollection, orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const patients = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toMillis() || Date.now()
    }));
    callback(patients);
  });
}

// Message functions
export async function addMessage(messageData: {
  sender: 'patient' | 'doctor';
  message: string;
  senderName: string;
  patientId?: string;
}) {
  try {
    const docRef = await addDoc(messagesCollection, {
      ...messageData,
      timestamp: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding message:", error);
    throw error;
  }
}

// Listen to messages
export function subscribeToMessages(callback: (messages: any[]) => void) {
  const q = query(messagesCollection, orderBy('timestamp', 'asc'));
  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toMillis() || Date.now()
    }));
    callback(messages);
  });
}