import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Unmount between cases so the document-level theme attribute never leaks
// from one test into the next.
afterEach(cleanup);
