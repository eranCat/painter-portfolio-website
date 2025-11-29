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
  dimensions: string;
  createdAt: Date;
  tags?: string[];
}

export interface PaintingFormData {
  titleEn: string;
  titleHe: string;
  descriptionEn: string;
  descriptionHe: string;
  category: string;
  year: number;
  dimensions: string;
  image: File | null;
  // Form-specific fields for dimension input
  dimensionWidth?: number | string;
  dimensionHeight?: number | string;
  dimensionUnit?: string;
}
