import { db } from './firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { About } from '../types/about';

const ABOUT_DOC_ID = 'main';
const ABOUT_COLLECTION = 'about';

export const getAbout = async (): Promise<About | null> => {
  try {
    const docRef = doc(db, ABOUT_COLLECTION, ABOUT_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
      } as About;
    }
    return null;
  } catch (error) {
    console.warn('About section not yet configured:', error);
    return null;
  }
};

export const updateAbout = async (aboutData: Omit<About, 'id' | 'updatedAt'>): Promise<void> => {
  try {
    const docRef = doc(db, ABOUT_COLLECTION, ABOUT_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Update existing document
      await updateDoc(docRef, {
        ...aboutData,
        updatedAt: serverTimestamp(),
      });
    } else {
      // Create new document if it doesn't exist
      await setDoc(docRef, {
        ...aboutData,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error updating about:', error);
    throw error;
  }
};
