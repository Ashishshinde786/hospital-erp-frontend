import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';

/*
=========================================================
COMPONENT: LayoutComponent
=========================================================

PURPOSE:
--------
This is the MAIN LAYOUT (Shell Component) of the application.

It controls:
- Sidebar (navigation menu)
- Navbar (top header)
- Main content area (router-outlet)

---------------------------------------------------------

ARCHITECTURE ROLE:
------------------
This component acts as a WRAPPER around all feature modules.

Flow:
AppComponent
   ↓
LayoutComponent (this)
   ↓
RouterOutlet → loads feature components

---------------------------------------------------------

RESPONSIBILITIES:
-----------------
- Manage layout state (sidebar collapse/expand)
- Coordinate interaction between Navbar and Sidebar
- Provide consistent UI across all pages

---------------------------------------------------------

KEY CONCEPTS USED:
------------------
- Standalone Component (Angular modern approach)
- Component composition
- Event handling (child → parent)
- State management (UI state)
- Angular Routing (RouterOutlet)

=========================================================
*/

@Component({
  selector: 'app-layout',

  /*
  =========================================================
  STANDALONE COMPONENT IMPORTS
  =========================================================

  Instead of NgModule, we directly import dependencies here
  */
  standalone: true,
  imports: [
    RouterOutlet,      // For dynamic routing
    SidebarComponent,  // Left navigation
    NavbarComponent    // Top header
  ],

  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {

  /*
  =========================================================
  UI STATE: SIDEBAR
  =========================================================

  Controls:
  - Sidebar width (expanded/collapsed)
  - Layout responsiveness

  Default: expanded (false)
  */
  sidebarCollapsed = false;



  /*
  =========================================================
  ACTION: TOGGLE SIDEBAR
  =========================================================

  Triggered from:
  - Navbar button (hamburger icon)

  Flow:
  Navbar → emits event → Layout → updates state → UI updates

  =========================================================
  */
  toggleSidebar(): void {

    /*
    Toggle boolean state
    true  → collapse sidebar
    false → expand sidebar
    */
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}