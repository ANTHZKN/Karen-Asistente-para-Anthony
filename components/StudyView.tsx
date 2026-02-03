
import React, { useState, useEffect } from 'react';
import { Subject, Topic } from '../types';
import { ICONS } from '../constants';

interface StudyViewProps {
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
}

export const StudyView: React.FC<StudyViewProps> = ({ subjects, setSubjects }) => {
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerType, setTimerType] = useState<'pomodoro' | 'break' | 'custom'>('pomodoro');

  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startPomodoro = () => {
    setTimer(25 * 60);
    setTimerType('pomodoro');
    setIsTimerRunning(true);
  };

  const addSubject = () => {
    const name = prompt('Nombre de la materia:');
    if (name) {
      setSubjects(prev => [...prev, { id: Date.now().toString(), name, topics: [] }]);
    }
  };

  const addTopic = (subjectId: string) => {
    const name = prompt('Nombre del tema:');
    if (name) {
      setSubjects(prev => prev.map(s => {
        if (s.id === subjectId) {
          const newTopic: Topic = {
            id: Date.now().toString(),
            name,
            difficulty: 'medium',
            term: 1,
            status: 'learning',
            progress: 0
          };
          return { ...s, topics: [...s.topics, newTopic] };
        }
        return s;
      }));
    }
  };

  return (
    <div className="p-6 h-full overflow-y-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-orbitron neon-text">NÚCLEO DE ESTUDIO</h1>
        <button 
          onClick={addSubject}
          className="glass-effect px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-sky-400/20 transition-all text-sky-400 font-bold"
        >
          {ICONS.Plus} MATERIA
        </button>
      </div>

      {/* Timer Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 glass-effect p-6 rounded-2xl flex flex-col items-center justify-center space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-sky-500/30">
            <div 
              className="h-full bg-sky-400 transition-all duration-1000" 
              style={{ width: `${timer > 0 ? (timer / (timerType === 'pomodoro' ? 1500 : 300)) * 100 : 0}%` }}
            />
          </div>
          <span className="text-sm font-orbitron tracking-widest text-sky-400 uppercase">Timer - {timerType}</span>
          <div className="text-6xl font-orbitron neon-text">{formatTime(timer)}</div>
          <div className="flex gap-4">
            <button 
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="p-3 bg-sky-500/20 rounded-full hover:bg-sky-500/40 transition-colors text-sky-300"
            >
              {isTimerRunning ? ICONS.Pause : ICONS.Play}
            </button>
            <button 
              onClick={() => setTimer(0)}
              className="p-3 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors"
            >
              {ICONS.Reset}
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={startPomodoro} className="text-xs px-2 py-1 glass-effect rounded hover:text-sky-400">Pomodoro</button>
            <button onClick={() => { setTimer(5*60); setTimerType('break'); setIsTimerRunning(true); }} className="text-xs px-2 py-1 glass-effect rounded hover:text-sky-400">Descanso</button>
          </div>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
           {subjects.map(subject => (
             <div key={subject.id} className="glass-effect p-4 rounded-xl space-y-3 relative group">
                <button 
                  onClick={() => setSubjects(prev => prev.filter(s => s.id !== subject.id))}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-400 transition-opacity"
                >
                  {ICONS.Trash}
                </button>
                <div className="flex justify-between items-center border-b border-sky-500/20 pb-2">
                  <h3 className="font-orbitron text-sky-300">{subject.name}</h3>
                  <button onClick={() => addTopic(subject.id)} className="text-sky-400 hover:scale-110 transition-transform">{ICONS.Plus}</button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {subject.topics.length === 0 && <p className="text-xs text-slate-500 italic">Sin temas aún</p>}
                  {subject.topics.map(topic => (
                    <div key={topic.id} className="text-sm flex justify-between items-center bg-white/5 p-2 rounded">
                      <div className="flex flex-col">
                        <span>{topic.name}</span>
                        <span className="text-[10px] opacity-60">T{topic.term} • {topic.difficulty}</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${topic.status === 'mastered' ? 'border-green-500 text-green-400' : 'border-amber-500 text-amber-400'}`}>
                        {topic.status === 'mastered' ? 'DOMINADO' : 'ESTUDIO'}
                      </span>
                    </div>
                  ))}
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};
