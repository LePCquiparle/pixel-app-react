import React from 'react';
import { Pencil, Eraser, PaintBucket, Pipette, Minus, Square, Circle } from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { TOOLS } from '../data/mock';

const iconMap = {
  Pencil: Pencil,
  Eraser: Eraser,
  PaintBucket: PaintBucket,
  Pipette: Pipette,
  Minus: Minus,
  Square: Square,
  Circle: Circle
};

const Toolbar = ({ currentTool, onToolChange, isMobile = false }) => {
  return (
    <TooltipProvider>
      <div className={`flex ${isMobile ? 'flex-row flex-wrap justify-center' : 'flex-col'} gap-2 p-3 bg-gray-800/90 backdrop-blur-sm rounded-xl border border-gray-700 shadow-lg`}>
        {!isMobile && (
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 text-center font-mono">
            Tools
          </div>
        )}
        {TOOLS.map((tool) => {
          const IconComponent = iconMap[tool.icon];
          const isActive = currentTool === tool.id;
          return (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => onToolChange(tool.id)}
                  className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-500 text-gray-900 shadow-[0_0_15px_rgba(16,185,129,0.5)] hover:bg-emerald-400'
                      : 'text-gray-300 hover:text-emerald-400 hover:bg-gray-700'
                  }`}
                >
                  <IconComponent className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side={isMobile ? 'top' : 'right'} className="bg-gray-900 border-emerald-500 text-emerald-400">
                <p className="font-mono">{tool.name} {!isMobile && `[${tool.shortcut}]`}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

export default Toolbar;
