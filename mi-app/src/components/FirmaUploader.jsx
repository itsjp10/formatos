import React, { useRef, useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

const SignaturePad = ({ onUpload }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [drawing, setDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#222');
  const [lastPoint, setLastPoint] = useState(null);

  const COLORS = ['#222', '#e74c3c', '#3498db', '#16a085'];

  // --- Utils de trazo (velocidad = grosor variable) ---
  const getVelocity = (p1, p2) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dt = (p2.time - p1.time) || 1;
    return Math.sqrt(dx * dx + dy * dy) / dt;
  };

  const getLineWidth = (velocity) => {
    const max = 4.8;
    const min = 2.2;
    const v = Math.max(Math.min(velocity, 3), 0.1);
    return max - ((v / 3) * (max - min));
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

  // --- Resize responsivo + HiDPI ---
  useEffect(() => {
    const setupCanvas = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      // Ancho disponible del contenedor
      const width = container.clientWidth;
      // Mantén proporción 10:3 y limita altura mínima/máxima si quieres
      const height = Math.max(100, Math.round(width * 0.3)); // ~30% del ancho

      const dpr = window.devicePixelRatio || 1;

      // Tamaño interno (pixeles reales)
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);

      // Tamaño CSS visible
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext('2d');
      // Reset transform antes de escalar de nuevo
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctxRef.current = ctx;
    };

    setupCanvas();
    // Redimensiona al cambiar el tamaño de la ventana
    window.addEventListener('resize', setupCanvas);
    return () => window.removeEventListener('resize', setupCanvas);
  }, []);

  // --- Coords en el canvas (coordenadas CSS, no de dispositivo) ---
  const getPointFromEvent = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    // Soporta mouse/touch/pen vía Pointer Events
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return { x, y, time: Date.now() };
  };

  // --- Handlers de dibujo (bloquean scroll/zoom mientras se dibuja) ---
  const handlePointerDown = (e) => {
    // Evita scroll/navegación por gesto
    e.preventDefault();
    canvasRef.current.setPointerCapture?.(e.pointerId);
    setDrawing(true);
    setLastPoint(getPointFromEvent(e));
  };

  const handlePointerMove = (e) => {
    if (!drawing || !lastPoint) return;
    e.preventDefault();
    const newPoint = getPointFromEvent(e);
    drawLine(lastPoint, newPoint);
    setLastPoint(newPoint);
  };

  const handlePointerUp = (e) => {
    e.preventDefault();
    canvasRef.current.releasePointerCapture?.(e.pointerId);
    setDrawing(false);
    setLastPoint(null);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    // Limpia usando tamaño interno (pixeles reales)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveFirma = () => {
    const canvas = canvasRef.current;
    // Exporta en tamaño CSS nítido usando un canvas temporal si quieres recortar/normalizar
    const exportCanvas = document.createElement('canvas');
    // Mantén la misma relación y tamaño visible actual
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    exportCanvas.width = width;
    exportCanvas.height = height;

    const exportCtx = exportCanvas.getContext('2d');
    // Dibuja desde el canvas de alta resolución al tamaño visible para un PNG liviano
    exportCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, width, height);

    const dataUrl = exportCanvas.toDataURL('image/png');
    onUpload(dataUrl);
  };

  return (
    <div className="w-full flex flex-col md:justify-start">
      {/* Contenedor responsive: ocupa todo el ancho disponible en móviles, máx 640px */}
      <div  
        ref={containerRef}
        className="relative w-full max-w-[640px] mt-2 flex flex-wrap items-center gap-2"
      >
        <canvas
          ref={canvasRef}
          // Pointer Events = unifica mouse/touch/pen
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          // Imprescindible para evitar scroll/zoom mientras dibujas
          className="bg-gray-100 rounded border-2 border-blue-500 border-dashed touch-none select-none block w-full"
          // Para navegadores sin Tailwind 'touch-none'
          style={{ touchAction: 'none' }}
        />
        {/* Botón caneca flotante */}
        <button
          onClick={clearCanvas}
          className="absolute top-2 right-2 text-gray-600 hover:text-red-500"
          aria-label="Borrar firma"
          type="button"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="text-sm">Color:</span>
        {COLORS.map((color) => (
          <button
            key={color}
            className={`w-5 h-5 rounded-full border-2 transition ${currentColor === color ? 'border-black' : 'border-white'
              }`}
            style={{ backgroundColor: color }}
            onClick={() => setCurrentColor(color)}
            type="button"
            aria-label={`Seleccionar color ${color}`}
          />
        ))}
        <button
          onClick={saveFirma}
          className="ml-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          type="button"
        >
          Guardar firma
        </button>
      </div>
    </div>
  );
};

export default SignaturePad;
