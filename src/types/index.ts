export type User = {
  id: string;
  email: string;
  name?: string;
  image?: string;
};

export type Book = {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  epubUrl?: string;
  isPublicDomain: boolean;
  uploadedById?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type BookSection = {
  id: string;
  bookId: string;
  title?: string;
  content: string;
  orderIndex: number;
  startPosition: number;
  endPosition: number;
  createdAt: Date;
};

export type Character = {
  id: string;
  bookId: string;
  name: string;
  description?: string;
  firstAppearance: number;
  createdAt: Date;
};

export type ReadingState = {
  id: string;
  userId: string;
  bookId: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Summary = {
  id: string;
  bookId: string;
  position: number;
  content: string;
  createdAt: Date;
}; 