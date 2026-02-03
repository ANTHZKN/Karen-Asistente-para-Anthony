
import React from 'react';
import { 
  MessageSquare, 
  Network, 
  BookOpen, 
  Settings as SettingsIcon,
  Mic,
  MicOff,
  Send,
  Plus,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX
} from 'lucide-react';

export const ICONS = {
  Chat: <MessageSquare size={20} />,
  Projects: <Network size={20} />,
  Study: <BookOpen size={20} />,
  Settings: <SettingsIcon size={20} />,
  Mic: <Mic size={20} />,
  MicOff: <MicOff size={20} />,
  Send: <Send size={20} />,
  Plus: <Plus size={16} />,
  Trash: <Trash2 size={16} />,
  Play: <Play size={16} />,
  Pause: <Pause size={16} />,
  Reset: <RotateCcw size={16} />,
  VolumeOn: <Volume2 size={20} />,
  VolumeOff: <VolumeX size={20} />
};

export const INITIAL_SETTINGS = {
  language: 'es',
  voiceSpeed: 1,
  voicePitch: 1,
  notifications: true,
  theme: 'dark' as const,
  voiceEnabled: true
};
