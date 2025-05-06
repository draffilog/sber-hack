import React, { useEffect, useRef } from 'react';

export const BackgroundAnimation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Characters to use for the matrix effect
    const chars = '@#/\\|(){}[]<>-_+*=%$!?:;^&~`.';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    
    // Array to track the Y position of each column
    const drops: number[] = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.floor(Math.random() * -100);
    }

    const draw = () => {
      // Semi-transparent black to create trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set text color and font
      ctx.fillStyle = '#0c8';
      ctx.font = `${fontSize}px monospace`;

      // Loop through each column
      for (let i = 0; i < drops.length; i++) {
        // Get random character
        const char = chars[Math.floor(Math.random() * chars.length)];
        
        // Calculate x position
        const x = i * fontSize;
        // Get current y position
        const y = drops[i] * fontSize;
        
        // Random color variations for some chars
        if (Math.random() > 0.98) {
          ctx.fillStyle = '#2dedc8'; // Brighter cyan
        } else if (Math.random() > 0.95) {
          ctx.fillStyle = '#0a6'; // Darker green
        } else {
          ctx.fillStyle = '#0c8'; // Default green
        }
        
        // Draw the character
        ctx.fillText(char, x, y);
        
        // Reset position if it's at the bottom or randomly
        if (y > canvas.height && Math.random() > 0.98) {
          drops[i] = 0;
        }
        
        // Move the drop down
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full opacity-10"
    />
  );
};