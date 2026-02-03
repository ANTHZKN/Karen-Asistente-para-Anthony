
import React, { useEffect, useRef } from 'react';

export const Waveform: React.FC<{ active: boolean }> = ({ active }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let offset = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';

      const amplitude = 15;
      const frequency = 0.05;

      for (let x = 0; x < canvas.width; x++) {
        const y = (canvas.height / 2) + Math.sin(x * frequency + offset) * amplitude * (Math.random() * 0.5 + 0.5);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      
      ctx.stroke();
      offset += 0.1;
      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [active]);

  return (
    <canvas 
      ref={canvasRef} 
      width={120} 
      height={40} 
      className={`transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-0'}`}
    />
  );
};
