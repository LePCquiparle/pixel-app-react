import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { DEFAULT_PALETTE, RECENT_COLORS_LIMIT } from '../data/mock';

const ColorPicker = ({ currentColor, onColorChange, recentColors, onAddRecentColor, isMobile = false }) => {
  const [hexInput, setHexInput] = useState(currentColor);

  const handleColorSelect = (color) => {
    onColorChange(color);
    setHexInput(color);
    onAddRecentColor(color);
  };

  const handleHexChange = (e) => {
    const value = e.target.value;
    setHexInput(value);
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      onColorChange(value);
      onAddRecentColor(value);
    }
  };

  const handleNativeColorChange = (e) => {
    const color = e.target.value.toUpperCase();
    setHexInput(color);
    onColorChange(color);
    onAddRecentColor(color);
  };

  return (
    <div className="p-4 bg-gray-800/90 backdrop-blur-sm rounded-xl border border-gray-700 shadow-lg space-y-4">
      {/* Current Color Display */}
      <div className="space-y-2">
        <Label className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
          Current Color
        </Label>
        <div className="flex items-center gap-3">
          <div
            className={`${isMobile ? 'w-12 h-12' : 'w-14 h-14'} rounded-lg border-2 border-gray-600 shadow-[0_0_10px_rgba(16,185,129,0.3)]`}
            style={{ backgroundColor: currentColor }}
          />
          <div className="flex-1 space-y-2">
            <Input
              type="text"
              value={hexInput}
              onChange={handleHexChange}
              className="bg-gray-900 border-gray-600 text-emerald-400 font-mono text-sm focus:border-emerald-500"
              placeholder="#000000"
            />
            <input
              type="color"
              value={currentColor}
              onChange={handleNativeColorChange}
              className="w-full h-8 rounded cursor-pointer bg-transparent"
            />
          </div>
        </div>
      </div>

      {/* Recent Colors */}
      {recentColors.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">
            Recent
          </Label>
          <div className={`grid ${isMobile ? 'grid-cols-8' : 'grid-cols-6'} gap-1`}>
            {recentColors.slice(0, RECENT_COLORS_LIMIT).map((color, index) => (
              <Button
                key={`${color}-${index}`}
                variant="ghost"
                className={`${isMobile ? 'w-7 h-7' : 'w-8 h-8'} p-0 rounded border border-gray-600 hover:border-emerald-400 hover:scale-110 transition-all`}
                style={{ backgroundColor: color }}
                onClick={() => handleColorSelect(color)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Default Palette */}
      <div className="space-y-2">
        <Label className="text-xs font-bold text-purple-400 uppercase tracking-wider font-mono">
          Palette
        </Label>
        <div className={`grid ${isMobile ? 'grid-cols-8' : 'grid-cols-6'} gap-1`}>
          {DEFAULT_PALETTE.map((color, index) => (
            <Button
              key={`palette-${index}`}
              variant="ghost"
              className={`${isMobile ? 'w-7 h-7' : 'w-8 h-8'} p-0 rounded border transition-all hover:scale-110 ${
                currentColor === color
                  ? 'border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                  : 'border-gray-600 hover:border-gray-400'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => handleColorSelect(color)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;
