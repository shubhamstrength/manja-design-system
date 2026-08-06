import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideManjaTheme } from '@manja/angular';
import { App } from './app/app';

bootstrapApplication(App, {
  providers: [provideZonelessChangeDetection(), provideManjaTheme()],
}).catch((error: unknown) => {
  console.error(error);
});
