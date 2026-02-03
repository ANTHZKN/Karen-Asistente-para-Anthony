
import React, { useState } from 'react';
import { Project, Node, Connection } from '../types';
import { ICONS } from '../constants';

interface ProjectViewProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
}

export const ProjectView: React.FC<ProjectViewProps> = ({ projects, setProjects }) => {
  const [activeProject, setActiveProject] = useState<Project | null>(projects[0] || null);
  const [draggingNode, setDraggingNode] = useState<{ id: string, startX: number, startY: number } | null>(null);

  const handleMouseDown = (nodeId: string, e: React.MouseEvent) => {
    setDraggingNode({ id: nodeId, startX: e.clientX, startY: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingNode || !activeProject) return;
    
    const dx = e.clientX - draggingNode.startX;
    const dy = e.clientY - draggingNode.startY;

    setProjects(prev => prev.map(p => {
      if (p.id === activeProject.id) {
        const updatedNodes = p.nodes.map(n => 
          n.id === draggingNode.id ? { ...n, x: n.x + dx, y: n.y + dy } : n
        );
        return { ...p, nodes: updatedNodes };
      }
      return p;
    }));
    
    setDraggingNode({ id: draggingNode.id, startX: e.clientX, startY: e.clientY });
  };

  const handleMouseUp = () => setDraggingNode(null);

  const addNode = () => {
    if (!activeProject) return;
    const label = prompt('Nombre del nodo:');
    if (label) {
      const newNode: Node = {
        id: Date.now().toString(),
        label,
        x: 400,
        y: 200,
        type: 'text'
      };
      setProjects(prev => prev.map(p => {
        if (p.id === activeProject.id) {
          const updated = { ...p, nodes: [...p.nodes, newNode] };
          setActiveProject(updated);
          return updated;
        }
        return p;
      }));
    }
  };

  const createProject = () => {
    const name = prompt('Nombre del proyecto:');
    if (name) {
      const newProj: Project = {
        id: Date.now().toString(),
        name,
        nodes: [{ id: 'root', label: name, x: 400, y: 300, type: 'text' }],
        connections: []
      };
      setProjects(prev => [...prev, newProj]);
      setActiveProject(newProj);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-sky-500/20 flex justify-between items-center glass-effect">
        <div className="flex gap-4 items-center">
          <h1 className="font-orbitron neon-text mr-4">PROYECTOS</h1>
          <select 
            className="bg-slate-900 text-sky-400 text-sm border border-sky-500/30 rounded px-2 py-1 outline-none"
            value={activeProject?.id || ''}
            onChange={(e) => setActiveProject(projects.find(p => p.id === e.target.value) || null)}
          >
            {projects.length === 0 && <option value="">No hay proyectos</option>}
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button onClick={createProject} className="p-1 hover:text-sky-400">{ICONS.Plus}</button>
        </div>
        <button 
          onClick={addNode}
          className="bg-sky-500/20 hover:bg-sky-500/40 text-sky-400 px-4 py-1 rounded-full text-sm font-bold transition-all border border-sky-500/40"
        >
          AÑADIR NODO
        </button>
      </div>

      <div 
        className="flex-1 relative overflow-hidden bg-[#0a0f1e]"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg className="absolute inset-0 pointer-events-none w-full h-full">
           <defs>
             <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
               <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(56, 189, 248, 0.05)" strokeWidth="0.5"/>
             </pattern>
           </defs>
           <rect width="100%" height="100%" fill="url(#grid)" />
           {activeProject?.connections.map((conn, idx) => {
             const from = activeProject.nodes.find(n => n.id === conn.from);
             const to = activeProject.nodes.find(n => n.id === conn.to);
             if (!from || !to) return null;
             return (
               <line 
                key={idx} 
                x1={from.x + 60} y1={from.y + 20} 
                x2={to.x + 60} y2={to.y + 20} 
                stroke="rgba(56, 189, 248, 0.3)" 
                strokeWidth="2"
               />
             );
           })}
        </svg>

        {activeProject?.nodes.map(node => (
          <div 
            key={node.id}
            onMouseDown={(e) => handleMouseDown(node.id, e)}
            className="absolute p-3 rounded-lg glass-effect cursor-move select-none border border-sky-400/30 hover:border-sky-400 transition-colors"
            style={{ left: node.x, top: node.y, width: '120px' }}
          >
            <div className="text-xs font-bold text-center text-sky-200 uppercase truncate">{node.label}</div>
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-sky-400 rounded-full animate-pulse" />
          </div>
        ))}

        {!activeProject && (
          <div className="flex items-center justify-center h-full text-slate-500 italic">
            Selecciona o crea un proyecto para comenzar el mapeo neuronal.
          </div>
        )}
      </div>
    </div>
  );
};
