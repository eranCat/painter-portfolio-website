export interface About {
  id: string;
  description: {
    en: string;
    he: string;
  };
  features: {
    contemporary: {
      title: {
        en: string;
        he: string;
      };
      description: {
        en: string;
        he: string;
      };
    };
    authentic: {
      title: {
        en: string;
        he: string;
      };
      description: {
        en: string;
        he: string;
      };
    };
    accessible: {
      title: {
        en: string;
        he: string;
      };
      description: {
        en: string;
        he: string;
      };
    };
  };
  updatedAt: Date;
}
