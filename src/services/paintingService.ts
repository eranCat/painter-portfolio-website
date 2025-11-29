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
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebaseConfig';
import { Painting, PaintingFormData } from '../types/painting';

const PAINTINGS_COLLECTION = 'paintings';

// Upload image to Firebase Storage
export const uploadPaintingImage = async (file: File): Promise<string> => {
  try {
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const storageRef = ref(storage, `paintings/${filename}`);

    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);

    return downloadUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

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
      category: paintingData.category,
      year: paintingData.year,
      price: paintingData.price,
      dimensions: paintingData.dimensions,
      createdAt: Timestamp.now(),
      featured: false,
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

    return paintings;
  } catch (error) {
    console.error('Error fetching paintings:', error);
    return [];
  }
};

// Get featured paintings
export const getFeaturedPaintings = async (): Promise<Painting[]> => {
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
    await updateDoc(docRef, {
      ...paintingData,
      createdAt: paintingData.createdAt ? Timestamp.fromDate(paintingData.createdAt) : undefined,
    });
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

// Toggle featured status
export const toggleFeatured = async (id: string, featured: boolean) => {
  try {
    const docRef = doc(db, PAINTINGS_COLLECTION, id);
    await updateDoc(docRef, { featured: !featured });
    return id;
  } catch (error) {
    console.error('Error toggling featured:', error);
    throw error;
  }
};
