export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // base64 data URL for display
  isIdentification?: boolean;
  userImageForIdentification?: string;
}

export interface DiaryEntry {
  id: string;
  date: string; // ISO string
  notes: string;
  image?: string; // base64 data URL
  tags: string[];
}

export interface Plant {
  id: string;
  name: string;
  scientificName?: string;
  description?: string;
  primaryImage: string; // base64 data URL
  addedDate: string; // ISO string
  entries: DiaryEntry[];
}

export interface Reminder {
  id: string;
  plantId: string;
  plantName: string;
  task: string;
  dateTime: string; // ISO string for date and time
  completed: boolean;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
}

export interface ChatSession {
  id: string;
  name: string;
  messages: ChatMessage[];
  createdAt: string;
}

export interface CodexEntry {
  id: string;
  plantId: string;
  name: string;
  scientificName: string;
  image: string; // base64 data URL
  markdownContent: string;
}
