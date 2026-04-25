import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/*
=========================================================
COMPONENT: App (ROOT COMPONENT - SIGNAL VERSION)
=========================================================

PURPOSE:
--------
This is the ROOT ENTRY COMPONENT of the Angular application.

It:
- Boots the app
- Hosts the router outlet
- Uses Angular Signals (modern reactive state)

---------------------------------------------------------

DIFFERENCE FROM PREVIOUS VERSION:
---------------------------------
Old:
- Simple AppComponent (no state)

Now:
- Uses Angular Signals (new reactive system)
- Slightly more modern architecture

---------------------------------------------------------

ARCHITECTURE FLOW:
------------------
index.html
   ↓
main.ts → bootstrapApplication(App, appConfig)
   ↓
App (this component)
   ↓
RouterOutlet
   ↓
Feature components load

=========================================================
*/

@Component({
  selector: 'app-root',

  /*
  =========================================================
  STANDALONE STYLE (MODERN ANGULAR)
  =========================================================
  No NgModule required
  */
  standalone: true,

  /*
  =========================================================
  IMPORTS
  =========================================================
  Required for routing to work
  */
  imports: [RouterOutlet],

  /*
  =========================================================
  TEMPLATE
  =========================================================
  External HTML file (clean separation)
  */
  templateUrl: './app.html',

  /*
  =========================================================
  STYLES
  =========================================================
  */
  styleUrls: ['./app.scss']
})
export class App {

  /*
  =========================================================
  SIGNAL STATE (NEW ANGULAR FEATURE)
  =========================================================

  WHAT IS SIGNAL?
  ---------------
  A reactive value that automatically updates UI
  when changed.

  Similar to:
  - React useState
  - RxJS BehaviorSubject (simplified)

  WHY USE?
  --------
  - Better performance
  - Simpler than RxJS for local state
  - Automatic change detection

  =========================================================
  */
  protected readonly title = signal('hospital-erp-frontend');



  /*
  =========================================================
  USAGE IN TEMPLATE:
  =========================================================

  {{ title() }}

  NOTE:
  -----
  Signals are FUNCTIONS, not variables
  */
}