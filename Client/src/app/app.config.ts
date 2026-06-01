import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    // Optimizes change detection cycles by coalescing event microtasks
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Globally enables HttpClient parsing across standalone components
    provideHttpClient()
  ]
};