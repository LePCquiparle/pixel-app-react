// Mock data for pixel art app

export const CANVAS_PRESETS = [
  { name: '16x16', width: 16, height: 16, label: 'Tiny Icon' },
  { name: '32x32', width: 32, height: 32, label: 'Small Sprite' },
  { name: '64x64', width: 64, height: 64, label: 'Medium Sprite' },
  { name: '128x128', width: 128, height: 128, label: 'Large Art' },
  { name: 'custom', width: 0, height: 0, label: 'Custom Size' }
];

export const TOOLS = [
  { id: 'pencil', name: 'Pencil', icon: 'Pencil', shortcut: 'P' },
  { id: 'eraser', name: 'Eraser', icon: 'Eraser', shortcut: 'E' },
  { id: 'fill', name: 'Fill Bucket', icon: 'PaintBucket', shortcut: 'F' },
  { id: 'eyedropper', name: 'Color Picker', icon: 'Pipette', shortcut: 'I' },
  { id: 'line', name: 'Line', icon: 'Minus', shortcut: 'L' },
  { id: 'rectangle', name: 'Rectangle', icon: 'Square', shortcut: 'R' },
  { id: 'circle', name: 'Circle', icon: 'Circle', shortcut: 'C' }
];

export const DEFAULT_PALETTE = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
  '#FF00FF', '#00FFFF', '#FF8800', '#88FF00', '#0088FF', '#FF0088',
  '#880000', '#008800', '#000088', '#888800', '#880088', '#008888',
  '#444444', '#888888', '#CCCCCC', '#FF4444', '#44FF44', '#4444FF'
];

export const RECENT_COLORS_LIMIT = 12;

export const ZOOM_LEVELS = [1, 2, 4, 8, 12, 16, 24, 32];

export const DEFAULT_SETTINGS = {
  canvasWidth: 32,
  canvasHeight: 32,
  gridEnabled: true,
  currentColor: '#000000',
  backgroundColor: 'transparent',
  zoomLevel: 12
};
