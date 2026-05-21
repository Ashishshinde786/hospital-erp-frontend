// src/app/app.component.ts
//
// FIX: The codebase had TWO conflicting AppComponent definitions —
//  one simple (template: `<router-outlet>`) and one with a Signal.
// Merged into a single, clean entry component.

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  // Minimal root template — routing handles everything else.
  template: `<router-outlet></router-outlet>`
})
export class AppComponent {}