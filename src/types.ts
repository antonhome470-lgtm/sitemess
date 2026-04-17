
export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}

export interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastSeen: string;
  online: boolean;
}

export interface ChatState {
  [contactId: string]: Message[];
}
