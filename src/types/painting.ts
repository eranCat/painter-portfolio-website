export interface Painting {
  id: string;
  title: {
    en: string;
    he: string;
  };
  description: {
    en: string;
    he: string;
  };
  imageUrl: string;
  category: string;
  year: number;
  price: number;
  dimensions: string;
  createdAt: Date;
  featured: boolean;
  tags?: string[];
}

export interface PaintingFormData {
  titleEn: string;
  titleHe: string;
  descriptionEn: string;
  descriptionHe: string;
  category: string;
  year: number;
  price: number;
  dimensions: string;
  image: File | null;
}
