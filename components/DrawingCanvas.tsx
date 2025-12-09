import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';

interface DrawingCanvasProps {
  color: string;
  lineWidth: number;
  onInteractStart?: () => void;
}

export interface DrawingCanvasHandle {
  clear: () => void;
  undo: () => void;
  getDataUrl: () => string;
  hasDrawing: () => boolean;
}

const DrawingCanvas = forwardRef<DrawingCanvasHandle, DrawingCanvasProps>(({ color, lineWidth, onInteractStart }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const historyRef = useRef<ImageData[]>([]);
  const MAX_HISTORY = 20;

  const saveState = () => {
      const canvas = canvasRef.current;
      const ctx = contextRef.current;
      if (canvas && ctx) {
          if (historyRef.current.length >= MAX_HISTORY) historyRef.current.shift();
          historyRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
      }
  };

  useImperativeHandle(ref, () => ({
    clear: () => {
      const canvas = canvasRef.current;
      const ctx = contextRef.current;
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setHasContent(false);
        historyRef.current = [];
      }
    },
    undo: () => {
        const canvas = canvasRef.current;
        const ctx = contextRef.current;
        if (canvas && ctx && historyRef.current.length > 0) {
            const previousState = historyRef.current.pop();
            if (previousState) {
                ctx.putImageData(previousState, 0, 0);
                setHasContent(historyRef.current.length > 0);
            }
        } else if (canvas && ctx && historyRef.current.length === 0) {
             ctx.clearRect(0, 0, canvas.width, canvas.height);
             ctx.fillStyle = "white";
             ctx.fillRect(0, 0, canvas.width, canvas.height);
             setHasContent(false);
        }
    },
    getDataUrl: () => canvasRef.current?.toDataURL("image/png") || "",
    hasDrawing: () => hasContent
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, rect.width, rect.height);
      contextRef.current = ctx;
    }
  }, []);

  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = color;
      contextRef.current.lineWidth = lineWidth;
    }
  }, [color, lineWidth]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (onInteractStart) onInteractStart();
    saveState();
    const { offsetX, offsetY } = getCoordinates(e);
    contextRef.current?.beginPath();
    contextRef.current?.moveTo(offsetX, offsetY);
    setIsDrawing(true);
    setHasContent(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = getCoordinates(e);
    contextRef.current?.lineTo(offsetX, offsetY);
    contextRef.current?.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
        contextRef.current?.closePath();
        setIsDrawing(false);
    }
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { offsetX: 0, offsetY: 0 };
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    const rect = canvas.getBoundingClientRect();
    return { offsetX: clientX - rect.left, offsetY: clientY - rect.top };
  };

  return (
    <div className="w-full h-full touch-none bg-white">
       <canvas
        ref={canvasRef}
        className="w-full h-full touch-none cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
});

DrawingCanvas.displayName = 'DrawingCanvas';

export default DrawingCanvas;