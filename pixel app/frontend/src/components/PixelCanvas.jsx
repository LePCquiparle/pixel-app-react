import React, { useRef, useEffect, useState, useCallback } from 'react';

const PixelCanvas = ({
  width,
  height,
  pixels,
  setPixels,
  currentColor,
  tool,
  zoom,
  gridEnabled,
  backgroundColor,
  onColorPick
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState(null);
  const [previewPixels, setPreviewPixels] = useState(null);

  const pixelSize = zoom;
  const canvasWidth = width * pixelSize;
  const canvasHeight = height * pixelSize;

  // Checkerboard pattern for transparent background
  const drawCheckerboard = useCallback((ctx) => {
    const checkSize = Math.max(4, pixelSize / 2);
    for (let y = 0; y < canvasHeight; y += checkSize) {
      for (let x = 0; x < canvasWidth; x += checkSize) {
        const isLight = ((x / checkSize) + (y / checkSize)) % 2 === 0;
        ctx.fillStyle = isLight ? '#ffffff' : '#e0e0e0';
        ctx.fillRect(x, y, checkSize, checkSize);
      }
    }
  }, [canvasWidth, canvasHeight, pixelSize]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Clear and draw background
    if (backgroundColor === 'transparent') {
      drawCheckerboard(ctx);
    } else {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    // Draw pixels
    const pixelsToDraw = previewPixels || pixels;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const color = pixelsToDraw[y]?.[x];
        if (color && color !== 'transparent') {
          ctx.fillStyle = color;
          ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
      }
    }

    // Draw grid
    if (gridEnabled && pixelSize >= 4) {
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= width; x++) {
        ctx.beginPath();
        ctx.moveTo(x * pixelSize, 0);
        ctx.lineTo(x * pixelSize, canvasHeight);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * pixelSize);
        ctx.lineTo(canvasWidth, y * pixelSize);
        ctx.stroke();
      }
    }
  }, [pixels, previewPixels, width, height, pixelSize, gridEnabled, backgroundColor, canvasWidth, canvasHeight, drawCheckerboard]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const getPixelCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Handle both mouse and touch events
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const x = Math.floor((clientX - rect.left) / pixelSize);
    const y = Math.floor((clientY - rect.top) / pixelSize);
    return { x: Math.max(0, Math.min(x, width - 1)), y: Math.max(0, Math.min(y, height - 1)) };
  };

  const setPixel = (x, y, color) => {
    const newPixels = pixels.map(row => [...row]);
    if (x >= 0 && x < width && y >= 0 && y < height) {
      newPixels[y][x] = color;
    }
    return newPixels;
  };

  const floodFill = (startX, startY, fillColor) => {
    const newPixels = pixels.map(row => [...row]);
    const targetColor = newPixels[startY][startX] || 'transparent';
    if (targetColor === fillColor) return pixels;

    const stack = [[startX, startY]];
    const visited = new Set();

    while (stack.length > 0) {
      const [x, y] = stack.pop();
      const key = `${x},${y}`;
      if (visited.has(key)) continue;
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      const currentColor = newPixels[y][x] || 'transparent';
      if (currentColor !== targetColor) continue;

      visited.add(key);
      newPixels[y][x] = fillColor;
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    return newPixels;
  };

  const drawLine = (x0, y0, x1, y1, color, basePixels) => {
    const newPixels = basePixels.map(row => [...row]);
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    while (true) {
      if (x0 >= 0 && x0 < width && y0 >= 0 && y0 < height) {
        newPixels[y0][x0] = color;
      }
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x0 += sx; }
      if (e2 < dx) { err += dx; y0 += sy; }
    }
    return newPixels;
  };

  const drawRectangle = (x0, y0, x1, y1, color, basePixels) => {
    let newPixels = basePixels.map(row => [...row]);
    const minX = Math.min(x0, x1);
    const maxX = Math.max(x0, x1);
    const minY = Math.min(y0, y1);
    const maxY = Math.max(y0, y1);

    for (let x = minX; x <= maxX; x++) {
      if (x >= 0 && x < width) {
        if (minY >= 0 && minY < height) newPixels[minY][x] = color;
        if (maxY >= 0 && maxY < height) newPixels[maxY][x] = color;
      }
    }
    for (let y = minY; y <= maxY; y++) {
      if (y >= 0 && y < height) {
        if (minX >= 0 && minX < width) newPixels[y][minX] = color;
        if (maxX >= 0 && maxX < width) newPixels[y][maxX] = color;
      }
    }
    return newPixels;
  };

  const drawCircle = (cx, cy, ex, ey, color, basePixels) => {
    const newPixels = basePixels.map(row => [...row]);
    const radius = Math.round(Math.sqrt((ex - cx) ** 2 + (ey - cy) ** 2));
    let x = radius;
    let y = 0;
    let err = 0;

    const plot = (px, py) => {
      if (px >= 0 && px < width && py >= 0 && py < height) {
        newPixels[py][px] = color;
      }
    };

    while (x >= y) {
      plot(cx + x, cy + y); plot(cx + y, cy + x);
      plot(cx - y, cy + x); plot(cx - x, cy + y);
      plot(cx - x, cy - y); plot(cx - y, cy - x);
      plot(cx + y, cy - x); plot(cx + x, cy - y);
      y++;
      err += 1 + 2 * y;
      if (2 * (err - x) + 1 > 0) { x--; err += 1 - 2 * x; }
    }
    return newPixels;
  };

  const handleStart = (e) => {
    e.preventDefault();
    const { x, y } = getPixelCoords(e);
    setIsDrawing(true);
    setStartPos({ x, y });

    if (tool === 'pencil') {
      setPixels(setPixel(x, y, currentColor));
    } else if (tool === 'eraser') {
      setPixels(setPixel(x, y, 'transparent'));
    } else if (tool === 'fill') {
      setPixels(floodFill(x, y, currentColor));
    } else if (tool === 'eyedropper') {
      const color = pixels[y]?.[x];
      if (color && color !== 'transparent') {
        onColorPick(color);
      }
    }
  };

  const handleMove = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getPixelCoords(e);

    if (tool === 'pencil') {
      setPixels(setPixel(x, y, currentColor));
    } else if (tool === 'eraser') {
      setPixels(setPixel(x, y, 'transparent'));
    } else if (tool === 'line' && startPos) {
      setPreviewPixels(drawLine(startPos.x, startPos.y, x, y, currentColor, pixels));
    } else if (tool === 'rectangle' && startPos) {
      setPreviewPixels(drawRectangle(startPos.x, startPos.y, x, y, currentColor, pixels));
    } else if (tool === 'circle' && startPos) {
      setPreviewPixels(drawCircle(startPos.x, startPos.y, x, y, currentColor, pixels));
    }
  };

  const handleEnd = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    // For touch events that end, we need to use the last known position
    let coords;
    if (e.changedTouches && e.changedTouches[0]) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const clientX = e.changedTouches[0].clientX;
      const clientY = e.changedTouches[0].clientY;
      const x = Math.floor((clientX - rect.left) / pixelSize);
      const y = Math.floor((clientY - rect.top) / pixelSize);
      coords = { x: Math.max(0, Math.min(x, width - 1)), y: Math.max(0, Math.min(y, height - 1)) };
    } else if (e.clientX !== undefined) {
      coords = getPixelCoords(e);
    } else {
      coords = startPos;
    }

    if (tool === 'line' && startPos) {
      setPixels(drawLine(startPos.x, startPos.y, coords.x, coords.y, currentColor, pixels));
    } else if (tool === 'rectangle' && startPos) {
      setPixels(drawRectangle(startPos.x, startPos.y, coords.x, coords.y, currentColor, pixels));
    } else if (tool === 'circle' && startPos) {
      setPixels(drawCircle(startPos.x, startPos.y, coords.x, coords.y, currentColor, pixels));
    }

    setIsDrawing(false);
    setStartPos(null);
    setPreviewPixels(null);
  };

  return (
    <div 
      ref={containerRef}
      className="relative inline-block border-4 border-gray-700 rounded-lg shadow-[0_0_20px_rgba(0,255,136,0.3)] bg-gray-900 p-2 overflow-auto max-w-full"
    >
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        className="cursor-crosshair block touch-none"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
};

export default PixelCanvas;
