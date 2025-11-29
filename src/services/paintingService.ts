import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Painting, PaintingFormData } from '../types/painting';

const PAINTINGS_COLLECTION = 'paintings';

// Add a new painting
export const addPainting = async (paintingData: PaintingFormData, imageUrl: string) => {
  try {
    const docRef = await addDoc(collection(db, PAINTINGS_COLLECTION), {
      title: {
        en: paintingData.titleEn,
        he: paintingData.titleHe,
      },
      description: {
        en: paintingData.descriptionEn,
        he: paintingData.descriptionHe,
      },
      imageUrl,
      category: 'uncategorized',
      year: paintingData.year,
      dimensions: paintingData.dimensions,
      createdAt: Timestamp.now(),
      tags: [],
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding painting:', error);
    throw error;
  }
};

// Get all paintings
export const getPaintings = async (): Promise<Painting[]> => {
  try {
    // First try to query with orderBy
    try {
      const q = query(
        collection(db, PAINTINGS_COLLECTION),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const paintings: Painting[] = [];

      querySnapshot.forEach((doc) => {
        paintings.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        } as Painting);
      });

      console.log('Fetched paintings:', paintings);
      return paintings;
    } catch (orderByError: any) {
      // If orderBy fails (e.g., no index), fall back to unordered query
      if (orderByError?.code === 'failed-precondition') {
        console.warn('OrderBy index not available, fetching without order:', orderByError);
        const querySnapshot = await getDocs(collection(db, PAINTINGS_COLLECTION));
        const paintings: Painting[] = [];

        querySnapshot.forEach((doc) => {
          paintings.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          } as Painting);
        });

        // Sort client-side if we couldn't do it server-side
        paintings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        console.log('Fetched paintings (client-sorted):', paintings);
        return paintings;
      }
      throw orderByError;
    }
  } catch (error) {
    console.error('Error fetching paintings:', error);
    return [];
  }
};

// Get featured paintings
export const getFeaturedPaintings = async (): Promise<Painting[]> => {
  try {
    try {
      const q = query(
        collection(db, PAINTINGS_COLLECTION),
        where('featured', '==', true),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const paintings: Painting[] = [];

      querySnapshot.forEach((doc) => {
        paintings.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        } as Painting);
      });

      return paintings;
    } catch (orderByError: any) {
      // If orderBy fails, fall back to unordered query
      if (orderByError?.code === 'failed-precondition') {
        console.warn('OrderBy index not available, fetching without order:', orderByError);
        const q = query(
          collection(db, PAINTINGS_COLLECTION),
          where('featured', '==', true)
        );
        const querySnapshot = await getDocs(q);
        const paintings: Painting[] = [];

        querySnapshot.forEach((doc) => {
          paintings.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          } as Painting);
        });

        // Sort client-side
        paintings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return paintings;
      }
      throw orderByError;
    }
  } catch (error) {
    console.error('Error fetching featured paintings:', error);
    return [];
  }
};

// Get a single painting by ID
export const getPaintingById = async (id: string): Promise<Painting | null> => {
  try {
    const docRef = doc(db, PAINTINGS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date(),
      } as Painting;
    }
    return null;
  } catch (error) {
    console.error('Error fetching painting:', error);
    return null;
  }
};

// Update a painting
export const updatePainting = async (
  id: string,
  paintingData: Partial<Painting>
) => {
  try {
    const docRef = doc(db, PAINTINGS_COLLECTION, id);
    const updateData = { ...paintingData };
    delete updateData.createdAt;
    await updateDoc(docRef, updateData);
    return id;
  } catch (error) {
    console.error('Error updating painting:', error);
    throw error;
  }
};

// Delete a painting
export const deletePainting = async (id: string) => {
  try {
    await deleteDoc(doc(db, PAINTINGS_COLLECTION, id));
    return id;
  } catch (error) {
    console.error('Error deleting painting:', error);
    throw error;
  }
};

