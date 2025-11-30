export interface CloseupImage {
  id: string;
  imageUrl: string;
  title?: {
    en: string;
    he: string;
  };
}

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
  closeups?: CloseupImage[];
}

export interface PaintingFormData {
  titleEn: string;
  titleHe: string;
  descriptionEn: string;
  descriptionHe: string;
  year: number;
  dimensions: string;
}
