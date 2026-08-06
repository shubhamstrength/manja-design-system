// The design system stylesheet: tokens, reset, base and utility layers.
import '@manja/styles';
// Playground chrome. Unlayered, so it wins over the design system's layers.
import './playground.css';

import { ThemeProvider } from '@manja/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.js';

const host = document.getElementById('root');
if (!host) throw new Error('#root is missing from index.html');

createRoot(host).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
