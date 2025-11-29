import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Contact, ContactFormData } from '../types/contact';

const CONTACTS_COLLECTION = 'contacts';

// Add a new contact submission
export const addContact = async (contactData: ContactFormData): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, CONTACTS_COLLECTION), {
      name: contactData.name,
      email: contactData.email,
      phone: contactData.phone,
      message: contactData.message,
      timestamp: Timestamp.now(),
      read: false,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding contact:', error);
    throw error;
  }
};

// Get all contacts (admin only)
export const getContacts = async (): Promise<Contact[]> => {
  try {
    const q = query(
      collection(db, CONTACTS_COLLECTION),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const contacts: Contact[] = [];

    querySnapshot.forEach((docSnap) => {
      contacts.push({
        id: docSnap.id,
        name: docSnap.data().name,
        email: docSnap.data().email,
        phone: docSnap.data().phone,
        message: docSnap.data().message,
        timestamp: docSnap.data().timestamp?.toDate() || new Date(),
        read: docSnap.data().read || false,
      } as Contact);
    });

    return contacts;
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return [];
  }
};

// Mark contact as read
export const markContactAsRead = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, CONTACTS_COLLECTION, id);
    await updateDoc(docRef, { read: true });
  } catch (error) {
    console.error('Error marking contact as read:', error);
    throw error;
  }
};

// Delete a contact
export const deleteContact = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, CONTACTS_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting contact:', error);
    throw error;
  }
};

// Get unread contact count
export const getUnreadCount = async (): Promise<number> => {
  try {
    const contacts = await getContacts();
    return contacts.filter((c) => !c.read).length;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};
