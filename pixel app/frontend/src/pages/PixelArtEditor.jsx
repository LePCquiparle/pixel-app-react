import React, { useState, useCallback, useEffect } from 'react';
import PixelCanvas from '../components/PixelCanvas';
import Toolbar from '../components/Toolbar';
import ColorPicker from '../components/ColorPicker';
import CanvasSettings from '../components/CanvasSettings';
import { DEFAULT_SETTINGS } from '../data/mock';
import { Gamepad2, Sparkles, Menu } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/sheet';

const PixelArtEditor = () => {
  const [canvasWidth, setCanvasWidth] = useState(DEFAULT_SETTINGS.canvasWidth);
  const [canvasHeight, setCanvasHeight] = useState(DEFAULT_SETTINGS.canvasHeight);
  const [pixels, setPixels] = useState(() =>
    Array(DEFAULT_SETTINGS.canvasHeight).fill(null).map(() =>
      Array(DEFAULT_SETTINGS.canvasWidth).fill('transparent')
    )
  );
  const [currentColor, setCurrentColor] = useState(DEFAULT_SETTINGS.currentColor);
  const [backgroundColor, setBackgroundColor] = useState(DEFAULT_SETTINGS.backgroundColor);
  const [currentTool, setCurrentTool] = useState('pencil');
  const [zoom, setZoom] = useState(DEFAULT_SETTINGS.zoomLevel);
  const [gridEnabled, setGridEnabled] = useState(DEFAULT_SETTINGS.gridEnabled);
  const [recentColors, setRecentColors] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize history
  useEffect(() => {
    const initialPixels = Array(canvasHeight).fill(null).map(() =>
      Array(canvasWidth).fill('transparent')
    );
    setHistory([initialPixels]);
    setHistoryIndex(0);
  }, []);

  const handleSizeChange = (width, height) => {
    setCanvasWidth(width);
    setCanvasHeight(height);
    const newPixels = Array(height).fill(null).map(() =>
      Array(width).fill('transparent')
    );
    setPixels(newPixels);
    setHistory([newPixels]);
    setHistoryIndex(0);
  };

  const handlePixelsChange = useCallback((newPixels) => {
    setPixels(newPixels);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newPixels);
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setPixels(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setPixels(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  const handleClear = () => {
    const newPixels = Array(canvasHeight).fill(null).map(() =>
      Array(canvasWidth).fill('transparent')
    );
    handlePixelsChange(newPixels);
  };

  const handleExport = () => {
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');

    // Handle transparent background - don't fill anything, canvas is transparent by default
    if (backgroundColor !== 'transparent') {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    // Draw pixels
    for (let y = 0; y < canvasHeight; y++) {
      for (let x = 0; x < canvasWidth; x++) {
        const color = pixels[y]?.[x];
        if (color && color !== 'transparent') {
          ctx.fillStyle = color;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }

    const link = document.createElement('a');
    link.download = `pixel-art-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleAddRecentColor = (color) => {
    setRecentColors(prev => {
      const filtered = prev.filter(c => c !== color);
      return [color, ...filtered].slice(0, 12);
    });
  };

  const handleColorPick = (color) => {
    setCurrentColor(color);
    handleAddRecentColor(color);
    setCurrentTool('pencil');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return;
      
      const key = e.key.toLowerCase();
      if (key === 'p') setCurrentTool('pencil');
      else if (key === 'e') setCurrentTool('eraser');
      else if (key === 'f') setCurrentTool('fill');
      else if (key === 'i') setCurrentTool('eyedropper');
      else if (key === 'l') setCurrentTool('line');
      else if (key === 'r') setCurrentTool('rectangle');
      else if (key === 'c') setCurrentTool('circle');
      else if (key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      else if ((key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey) ||
               (key === 'y' && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
        {/* Mobile Header */}
        <header className="sticky top-0 z-20 border-b border-gray-800 bg-gray-900/95 backdrop-blur-md px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg">
                <Gamepad2 className="w-5 h-5 text-gray-900" />
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent font-mono">
                PIXEL FORGE
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-mono">{canvasWidth}x{canvasHeight}</span>
              <Sheet open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-300">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] bg-gray-900 border-gray-700 p-0 overflow-y-auto">
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-700 pb-3">
                      <h2 className="text-lg font-bold text-emerald-400 font-mono">Settings</h2>
                    </div>
                    <ColorPicker
                      currentColor={currentColor}
                      onColorChange={setCurrentColor}
                      recentColors={recentColors}
                      onAddRecentColor={handleAddRecentColor}
                      isMobile={true}
                    />
                    <CanvasSettings
                      canvasWidth={canvasWidth}
                      canvasHeight={canvasHeight}
                      onSizeChange={handleSizeChange}
                      gridEnabled={gridEnabled}
                      onGridToggle={setGridEnabled}
                      zoom={zoom}
                      onZoomChange={setZoom}
                      onClear={handleClear}
                      onExport={handleExport}
                      backgroundColor={backgroundColor}
                      onBackgroundChange={setBackgroundColor}
                      isMobile={true}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        {/* Mobile Tools Bar */}
        <div className="sticky top-[53px] z-10 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 px-2 py-2">
          <Toolbar currentTool={currentTool} onToolChange={setCurrentTool} isMobile={true} />
        </div>

        {/* Canvas Area */}
        <main className="flex-1 overflow-auto p-3 flex items-start justify-center">
          <div className="overflow-auto max-w-full">
            <PixelCanvas
              width={canvasWidth}
              height={canvasHeight}
              pixels={pixels}
              setPixels={handlePixelsChange}
              currentColor={currentColor}
              tool={currentTool}
              zoom={zoom}
              gridEnabled={gridEnabled}
              backgroundColor={backgroundColor}
              onColorPick={handleColorPick}
            />
          </div>
        </main>

        {/* Mobile Bottom Bar - Quick Color & Zoom */}
        <div className="sticky bottom-0 z-10 bg-gray-900/95 backdrop-blur-md border-t border-gray-800 px-3 py-2">
          <div className="flex items-center justify-between gap-3">
            {/* Current Color */}
            <div className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-lg border-2 border-gray-600"
                style={{ backgroundColor: currentColor }}
              />
              <input
                type="color"
                value={currentColor}
                onChange={(e) => {
                  setCurrentColor(e.target.value.toUpperCase());
                  handleAddRecentColor(e.target.value.toUpperCase());
                }}
                className="w-10 h-10 rounded cursor-pointer bg-transparent"
              />
            </div>
            
            {/* Zoom Controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const levels = [4, 8, 12, 16, 24, 32];
                  const idx = levels.indexOf(zoom);
                  if (idx > 0) setZoom(levels[idx - 1]);
                }}
                className="h-8 px-2 border-gray-600 text-gray-300"
              >
                -
              </Button>
              <span className="text-sm font-mono text-emerald-400 w-12 text-center">{zoom}x</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const levels = [4, 8, 12, 16, 24, 32];
                  const idx = levels.indexOf(zoom);
                  if (idx < levels.length - 1) setZoom(levels[idx + 1]);
                }}
                className="h-8 px-2 border-gray-600 text-gray-300"
              >
                +
              </Button>
            </div>

            {/* Export Button */}
            <Button
              onClick={handleExport}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              Export
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-gray-800 bg-gray-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                <Gamepad2 className="w-6 h-6 text-gray-900" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent font-mono">
                  PIXEL FORGE
                </h1>
                <p className="text-xs text-gray-500 font-mono">Create • Design • Export</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg border border-gray-700">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-gray-400 font-mono">
                  {canvasWidth}x{canvasHeight}px
                </span>
              </div>
              <div className="text-xs text-gray-500 font-mono">
                <span className="text-emerald-400">Ctrl+Z</span> Undo &nbsp;
                <span className="text-cyan-400">Ctrl+Y</span> Redo
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar - Tools */}
          <aside className="w-20 flex-shrink-0">
            <Toolbar currentTool={currentTool} onToolChange={setCurrentTool} />
          </aside>

          {/* Center - Canvas */}
          <div className="flex-1 flex items-start justify-center overflow-auto">
            <div className="overflow-auto max-w-full p-4 bg-gray-900/50 rounded-2xl border border-gray-800">
              <PixelCanvas
                width={canvasWidth}
                height={canvasHeight}
                pixels={pixels}
                setPixels={handlePixelsChange}
                currentColor={currentColor}
                tool={currentTool}
                zoom={zoom}
                gridEnabled={gridEnabled}
                backgroundColor={backgroundColor}
                onColorPick={handleColorPick}
              />
            </div>
          </div>

          {/* Right Sidebar - Settings */}
          <aside className="w-72 flex-shrink-0 space-y-4">
            <ColorPicker
              currentColor={currentColor}
              onColorChange={setCurrentColor}
              recentColors={recentColors}
              onAddRecentColor={handleAddRecentColor}
            />
            <CanvasSettings
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
              onSizeChange={handleSizeChange}
              gridEnabled={gridEnabled}
              onGridToggle={setGridEnabled}
              zoom={zoom}
              onZoomChange={setZoom}
              onClear={handleClear}
              onExport={handleExport}
              backgroundColor={backgroundColor}
              onBackgroundChange={setBackgroundColor}
            />
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800 bg-gray-900/60 backdrop-blur-sm mt-8">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500 font-mono">
            <span>Use keyboard shortcuts for faster workflow</span>
            <span>•</span>
            <span className="flex gap-4">
              <kbd className="px-2 py-1 bg-gray-800 rounded text-emerald-400">P</kbd> Pencil
              <kbd className="px-2 py-1 bg-gray-800 rounded text-cyan-400">E</kbd> Eraser
              <kbd className="px-2 py-1 bg-gray-800 rounded text-purple-400">F</kbd> Fill
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PixelArtEditor;
