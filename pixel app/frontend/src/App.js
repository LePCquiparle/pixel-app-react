import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PixelArtEditor from './pages/PixelArtEditor';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PixelArtEditor />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
