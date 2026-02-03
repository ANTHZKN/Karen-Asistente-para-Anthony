
export enum View {
  CHAT = 'chat',
  PROJECTS = 'projects',
  STUDY = 'study',
  SETTINGS = 'settings'
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Topic {
  id: string;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  term: 1 | 2 | 3;
  status: 'learning' | 'mastered';
  progress: number;
}

export interface Subject {
  id: string;
  name: string;
  topics: Topic[];
}

export interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  type: 'text' | 'image' | 'link';
  content?: string;
}

export interface Connection {
  from: string;
  to: string;
}

export interface Project {
  id: string;
  name: string;
  nodes: Node[];
  connections: Connection[];
}

export interface StudySession {
  id: string;
  subjectId: string;
  duration: number;
  timestamp: number;
}

export interface Settings {
  language: string;
  voiceSpeed: number;
  voicePitch: number;
  notifications: boolean;
  theme: 'dark' | 'light';
  voiceEnabled: boolean;
}
