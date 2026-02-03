
import React from 'react';
import { Settings } from '../types';
import { ICONS } from '../constants';

interface SettingsProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

export const SettingsView: React.FC<SettingsProps> = ({ settings, setSettings }) => {
  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-orbitron neon-text text-center">CONFIGURACIÓN DE NÚCLEO</h1>
      
      <div className="grid gap-6">
        <div className="glass-effect p-6 rounded-2xl space-y-4">
          <h2 className="text-sky-400 font-orbitron text-sm uppercase tracking-widest">Interfaz y Voz</h2>
          
          <div className="flex items-center justify-between">
            <label className="text-sm">Voz de KAREN</label>
            <button 
              onClick={() => setSettings({...settings, voiceEnabled: !settings.voiceEnabled})}
              className={`p-2 rounded-lg transition-all border ${settings.voiceEnabled ? 'bg-sky-500/20 border-sky-400 text-sky-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
            >
              {settings.voiceEnabled ? ICONS.VolumeOn : ICONS.VolumeOff}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm">Idioma del sistema</label>
            <select 
              value={settings.language}
              onChange={(e) => setSettings({...settings, language: e.target.value})}
              className="bg-slate-900 border border-sky-500/30 rounded px-2 py-1 text-sm outline-none"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label>Velocidad de voz</label>
              <span>{settings.voiceSpeed}x</span>
            </div>
            <input 
              type="range" min="0.5" max="2" step="0.1"
              value={settings.voiceSpeed}
              onChange={(e) => setSettings({...settings, voiceSpeed: parseFloat(e.target.value)})}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label>Tono de voz</label>
              <span>{settings.voicePitch}</span>
            </div>
            <input 
              type="range" min="0.5" max="2" step="0.1"
              value={settings.voicePitch}
              onChange={(e) => setSettings({...settings, voicePitch: parseFloat(e.target.value)})}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>
        </div>

        <div className="glass-effect p-6 rounded-2xl space-y-4">
          <h2 className="text-sky-400 font-orbitron text-sm uppercase tracking-widest">Sistema</h2>
          
          <div className="flex items-center justify-between">
            <label className="text-sm">Notificaciones Neuronales</label>
            <input 
              type="checkbox" 
              checked={settings.notifications}
              onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
              className="w-4 h-4 accent-sky-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm">Tema Visual</label>
            <div className="flex bg-slate-900 rounded-lg p-1 border border-sky-500/20">
              <button 
                onClick={() => setSettings({...settings, theme: 'dark'})}
                className={`px-3 py-1 text-xs rounded ${settings.theme === 'dark' ? 'bg-sky-500/20 text-sky-400' : 'text-slate-500'}`}
              >OSCURO</button>
              <button 
                onClick={() => setSettings({...settings, theme: 'light'})}
                className={`px-3 py-1 text-xs rounded ${settings.theme === 'light' ? 'bg-sky-500/20 text-sky-400' : 'text-slate-500'}`}
              >CLARO</button>
            </div>
          </div>
        </div>

        <div className="bg-sky-900/10 border border-sky-500/20 p-4 rounded-xl text-center text-[10px] text-slate-500 uppercase tracking-tighter">
          KAREN v2.6.0 - NÚCLEO VOCAL ACTIVO PARA ANTHONY
        </div>
      </div>
    </div>
  );
};
