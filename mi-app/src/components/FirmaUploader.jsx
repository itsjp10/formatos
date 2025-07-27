import React, { useRef, useState, useEffect } from 'react';

const SignaturePad = () => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#222');
  const [lastPoint, setLastPoint] = useState(null);

  const COLORS = ['#222', '#e74c3c', '#3498db', '#16a085'];

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const scale = window.devicePixelRatio || 1;
    canvas.width = 500 * scale;
    canvas.height = 300 * scale;
    canvas.style.width = '500px';
    canvas.style.height = '300px';
    ctx.scale(scale, scale);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctxRef.current = ctx;
  }, []);

  const getVelocity = (p1, p2) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dt = (p2.time - p1.time) || 1;
    return Math.sqrt(dx * dx + dy * dy) / dt;
  };

  const getLineWidth = (velocity) => {
    const max = 4.8;
    const min = 2.2;
    const velocityClamped = Math.max(Math.min(velocity, 3), 0.1);
    return max - ((velocityClamped / 3) * (max - min));
  };

  const drawLine = (p1, p2) => {
    const ctx = ctxRef.current;
    const velocity = getVelocity(p1, p2);
    const lineWidth = getLineWidth(velocity);

    ctx.beginPath();
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = lineWidth;
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  };

  const handlePointerDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const time = Date.now();

    setLastPoint({ x, y, time });
    setDrawing(true);
  };

  const handlePointerMove = (e) => {
    if (!drawing || !lastPoint) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const time = Date.now();

    const newPoint = { x, y, time };
    drawLine(lastPoint, newPoint);
    setLastPoint(newPoint);
  };

  const handlePointerUp = () => {
    setDrawing(false);
    setLastPoint(null);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="p-4">
      <canvas
        ref={canvasRef}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        className="bg-gray-100 rounded border"
      />
      <div className="mt-2 flex items-center gap-4">
        <span>Color:</span>
        {COLORS.map((color) => (
          <button
            key={color}
            className={`w-6 h-6 rounded-full border-2 ${currentColor === color ? 'border-black' : 'border-white'}`}
            style={{ backgroundColor: color }}
            onClick={() => setCurrentColor(color)}
          />
        ))}
        <button
          onClick={clearCanvas}
          className="ml-4 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
        >
          Limpiar
        </button>
      </div>
    </div>
  );
};

export default SignaturePad;
