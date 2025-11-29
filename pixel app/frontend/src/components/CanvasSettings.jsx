import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Download, Trash2, Grid3X3, ZoomIn, ZoomOut, Plus, Minus as MinusIcon } from 'lucide-react';
import { CANVAS_PRESETS, ZOOM_LEVELS } from '../data/mock';

const CanvasSettings = ({
  canvasWidth,
  canvasHeight,
  onSizeChange,
  gridEnabled,
  onGridToggle,
  zoom,
  onZoomChange,
  onClear,
  onExport,
  backgroundColor,
  onBackgroundChange,
  isMobile = false
}) => {
  const [customWidth, setCustomWidth] = useState(canvasWidth);
  const [customHeight, setCustomHeight] = useState(canvasHeight);
  const [selectedPreset, setSelectedPreset] = useState('32x32');

  const handlePresetChange = (value) => {
    setSelectedPreset(value);
    const preset = CANVAS_PRESETS.find(p => p.name === value);
    if (preset && preset.name !== 'custom') {
      onSizeChange(preset.width, preset.height);
      setCustomWidth(preset.width);
      setCustomHeight(preset.height);
    }
  };

  const handleCustomSize = () => {
    const w = Math.max(8, Math.min(256, parseInt(customWidth) || 32));
    const h = Math.max(8, Math.min(256, parseInt(customHeight) || 32));
    onSizeChange(w, h);
  };

  const zoomIndex = ZOOM_LEVELS.indexOf(zoom);
  
  const handleZoomIn = () => {
    const nextIndex = Math.min(zoomIndex + 1, ZOOM_LEVELS.length - 1);
    onZoomChange(ZOOM_LEVELS[nextIndex]);
  };
  
  const handleZoomOut = () => {
    const prevIndex = Math.max(zoomIndex - 1, 0);
    onZoomChange(ZOOM_LEVELS[prevIndex]);
  };

  return (
    <div className="p-4 bg-gray-800/90 backdrop-blur-sm rounded-xl border border-gray-700 shadow-lg space-y-5">
      {/* Zoom Controls - Prominent */}
      <div className="space-y-3">
        <Label className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
          Zoom: {zoom}x
        </Label>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomOut}
            disabled={zoomIndex === 0}
            className="h-10 w-10 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-emerald-400 disabled:opacity-50"
          >
            <MinusIcon className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <Slider
              value={[zoomIndex]}
              onValueChange={([idx]) => onZoomChange(ZOOM_LEVELS[idx])}
              max={ZOOM_LEVELS.length - 1}
              step={1}
              className="flex-1"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomIn}
            disabled={zoomIndex === ZOOM_LEVELS.length - 1}
            className="h-10 w-10 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-emerald-400 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {/* Quick zoom buttons */}
        <div className="flex gap-1 flex-wrap">
          {[4, 8, 12, 16, 24].map((z) => (
            <Button
              key={z}
              variant={zoom === z ? 'default' : 'outline'}
              size="sm"
              onClick={() => onZoomChange(z)}
              className={`text-xs px-2 py-1 h-7 ${
                zoom === z
                  ? 'bg-emerald-500 text-gray-900 hover:bg-emerald-400'
                  : 'border-gray-600 text-gray-400 hover:text-emerald-400 hover:border-emerald-500'
              }`}
            >
              {z}x
            </Button>
          ))}
        </div>
      </div>

      {/* Canvas Size */}
      <div className="space-y-3">
        <Label className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">
          Canvas Size
        </Label>
        <Select value={selectedPreset} onValueChange={handlePresetChange}>
          <SelectTrigger className="bg-gray-900 border-gray-600 text-gray-200 focus:border-emerald-500">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700">
            {CANVAS_PRESETS.map((preset) => (
              <SelectItem
                key={preset.name}
                value={preset.name}
                className="text-gray-200 focus:bg-emerald-500/20 focus:text-emerald-400"
              >
                {preset.label} {preset.name !== 'custom' && `(${preset.width}x${preset.height})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedPreset === 'custom' && (
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label className="text-xs text-gray-400">Width</Label>
              <Input
                type="number"
                min="8"
                max="256"
                value={customWidth}
                onChange={(e) => setCustomWidth(e.target.value)}
                className="bg-gray-900 border-gray-600 text-gray-200"
              />
            </div>
            <div className="flex-1">
              <Label className="text-xs text-gray-400">Height</Label>
              <Input
                type="number"
                min="8"
                max="256"
                value={customHeight}
                onChange={(e) => setCustomHeight(e.target.value)}
                className="bg-gray-900 border-gray-600 text-gray-200"
              />
            </div>
            <Button
              onClick={handleCustomSize}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              Apply
            </Button>
          </div>
        )}
      </div>

      {/* Background Color */}
      <div className="space-y-2">
        <Label className="text-xs font-bold text-purple-400 uppercase tracking-wider font-mono">
          Background
        </Label>
        <div className="flex items-center gap-2">
          <Button
            variant={backgroundColor === 'transparent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onBackgroundChange('transparent')}
            className={`text-xs ${
              backgroundColor === 'transparent'
                ? 'bg-emerald-500 text-gray-900 hover:bg-emerald-400'
                : 'border-gray-600 text-gray-400 hover:text-emerald-400'
            }`}
          >
            Transparent
          </Button>
          <div className="flex items-center gap-1">
            <input
              type="color"
              value={backgroundColor === 'transparent' ? '#ffffff' : backgroundColor}
              onChange={(e) => onBackgroundChange(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border border-gray-600"
            />
            {backgroundColor !== 'transparent' && (
              <span className="text-gray-400 font-mono text-xs">{backgroundColor}</span>
            )}
          </div>
        </div>
      </div>

      {/* Grid Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Grid3X3 className="w-4 h-4 text-gray-400" />
          <Label className="text-sm text-gray-300">Show Grid</Label>
        </div>
        <Switch
          checked={gridEnabled}
          onCheckedChange={onGridToggle}
          className="data-[state=checked]:bg-emerald-500"
        />
      </div>

      {/* Action Buttons */}
      <div className={`flex gap-2 pt-2 ${isMobile ? 'flex-col' : ''}`}>
        <Button
          variant="outline"
          onClick={onClear}
          className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/20 hover:text-red-300"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear
        </Button>
        <Button
          onClick={onExport}
          className="flex-1 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]"
        >
          <Download className="w-4 h-4 mr-2" />
          Export PNG
        </Button>
      </div>
    </div>
  );
};

export default CanvasSettings;
