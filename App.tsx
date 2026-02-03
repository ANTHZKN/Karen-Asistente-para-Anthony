
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Message, Project, Subject, Settings } from './types';
import { ICONS, INITIAL_SETTINGS } from './constants';
import { StudyView } from './components/StudyView';
import { ProjectView } from './components/ProjectView';
import { SettingsView } from './components/SettingsView';
import { Waveform } from './components/Waveform';
import { sendKarenMessage } from './services/gemini';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { decode, encode, decodeAudioData, createBlob, generateTTS } from './services/audio';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.CHAT);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [settings, setSettings] = useState<Settings>(INITIAL_SETTINGS);

  // Audio refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());

  const speakText = async (text: string) => {
    if (!settings.voiceEnabled) return;
    
    setIsSpeaking(true);
    if (!outputAudioContextRef.current) {
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }

    const audioData = await generateTTS(text);
    if (audioData) {
      const audioBuffer = await decodeAudioData(decode(audioData), outputAudioContextRef.current, 24000, 1);
      const source = outputAudioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(outputAudioContextRef.current.destination);
      
      source.onended = () => {
        setIsSpeaking(false);
      };

      source.start();
    } else {
      setIsSpeaking(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsProcessing(true);

    const karenResponse = await sendKarenMessage(text);
    
    const modelMsg: Message = { 
      id: (Date.now() + 1).toString(), 
      role: 'model', 
      text: karenResponse.text, 
      timestamp: Date.now() 
    };
    setMessages(prev => [...prev, modelMsg]);
    setIsProcessing(false);

    // KAREN speaks her response
    await speakText(karenResponse.text);
  };

  const toggleListening = async () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    if (!outputAudioContextRef.current) outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    sessionPromiseRef.current = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: () => {
          const source = audioContextRef.current!.createMediaStreamSource(stream);
          const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const pcmBlob = createBlob(inputData);
            sessionPromiseRef.current?.then(session => {
              if (isListening) session.sendRealtimeInput({ media: pcmBlob });
            });
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(audioContextRef.current!.destination);
        },
        onmessage: async (msg: LiveServerMessage) => {
          // Live API handles user audio input -> KAREN audio response
          const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (audioData) {
            setIsSpeaking(true);
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current!.currentTime);
            const audioBuffer = await decodeAudioData(decode(audioData), outputAudioContextRef.current!, 24000, 1);
            const source = outputAudioContextRef.current!.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputAudioContextRef.current!.destination);
            
            source.onended = () => {
              sourcesRef.current.delete(source);
              if (sourcesRef.current.size === 0) setIsSpeaking(false);
            };

            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += audioBuffer.duration;
            sourcesRef.current.add(source);
          }
        },
        onerror: (e) => { console.error('Live Error', e); setIsListening(false); },
        onclose: () => { setIsListening(false); }
      },
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: "Eres KAREN, asistente futurista azul. El usuario es Anthony. Responde con voz clara, juvenil y calmada. Siempre sé servicial y usa el nombre de Anthony."
      }
    });
  };

  return (
    <div className="flex h-screen w-full bg-[#020617] text-slate-200 overflow-hidden">
      {/* Sidebar */}
      <nav className="w-16 md:w-20 glass-effect border-r border-sky-500/20 flex flex-col items-center py-8 space-y-8 z-10">
        <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center border border-sky-400 animate-pulse">
          <span className="font-orbitron font-bold text-sky-400 text-xs">K</span>
        </div>
        <div className="flex-1 flex flex-col items-center space-y-6">
          <button 
            onClick={() => setActiveView(View.CHAT)}
            className={`p-3 rounded-xl transition-all ${activeView === View.CHAT ? 'bg-sky-500/20 text-sky-400 border border-sky-400/30' : 'text-slate-500 hover:text-sky-300'}`}
          >
            {ICONS.Chat}
          </button>
          <button 
            onClick={() => setActiveView(View.PROJECTS)}
            className={`p-3 rounded-xl transition-all ${activeView === View.PROJECTS ? 'bg-sky-500/20 text-sky-400 border border-sky-400/30' : 'text-slate-500 hover:text-sky-300'}`}
          >
            {ICONS.Projects}
          </button>
          <button 
            onClick={() => setActiveView(View.STUDY)}
            className={`p-3 rounded-xl transition-all ${activeView === View.STUDY ? 'bg-sky-500/20 text-sky-400 border border-sky-400/30' : 'text-slate-500 hover:text-sky-300'}`}
          >
            {ICONS.Study}
          </button>
        </div>
        <button 
          onClick={() => setActiveView(View.SETTINGS)}
          className={`p-3 rounded-xl transition-all ${activeView === View.SETTINGS ? 'bg-sky-500/20 text-sky-400 border border-sky-400/30' : 'text-slate-500 hover:text-sky-300'}`}
        >
          {ICONS.Settings}
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative">
        {activeView === View.CHAT && (
          <>
            <div className="flex-1 p-6 overflow-y-auto space-y-6 flex flex-col-reverse">
              <div className="space-y-6 flex flex-col">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4 py-20">
                    <div className="w-32 h-32 rounded-full border-2 border-dashed border-sky-500/20 flex items-center justify-center animate-[spin_10s_linear_infinite]">
                      <div className="w-20 h-20 rounded-full border-2 border-sky-500/30 flex items-center justify-center" />
                    </div>
                    <p className="font-orbitron tracking-widest uppercase text-xs">A la espera de tus órdenes, Anthony.</p>
                  </div>
                )}
                {messages.map(m => (
                  <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl glass-effect ${m.role === 'user' ? 'bg-sky-500/10 border-sky-500/30 text-sky-100 rounded-tr-none' : 'border-white/10 rounded-tl-none'}`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
                      <span className="text-[10px] opacity-40 mt-2 block font-orbitron">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="glass-effect p-3 rounded-xl flex gap-1">
                      <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-sky-500/10 glass-effect relative">
              <div className="max-w-4xl mx-auto flex items-center gap-4">
                <button 
                  onClick={toggleListening}
                  className={`p-4 rounded-full transition-all duration-300 ${isListening ? 'bg-red-500/20 text-red-400 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-sky-500/10 text-sky-400 border border-sky-400/30 hover:shadow-[0_0_15px_rgba(56,189,248,0.3)]'}`}
                >
                  {isListening ? ICONS.MicOff : ICONS.Mic}
                </button>
                <div className="flex-1 relative">
                  <input 
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage(inputText)}
                    placeholder="Escribe un comando, Anthony..."
                    className="w-full bg-slate-900/50 border border-sky-500/30 rounded-full px-6 py-3 outline-none focus:border-sky-400 transition-all placeholder:text-slate-600 font-light"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                    <Waveform active={isListening || isProcessing || isSpeaking} />
                    <button 
                      onClick={() => sendMessage(inputText)}
                      className="text-sky-400 hover:text-sky-300 disabled:opacity-30"
                      disabled={!inputText.trim() || isProcessing}
                    >
                      {ICONS.Send}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeView === View.STUDY && <StudyView subjects={subjects} setSubjects={setSubjects} />}
        {activeView === View.PROJECTS && <ProjectView projects={projects} setProjects={setProjects} />}
        {activeView === View.SETTINGS && <SettingsView settings={settings} setSettings={setSettings} />}
      </main>
    </div>
  );
};

export default App;
