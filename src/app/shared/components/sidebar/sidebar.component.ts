import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

/*
=========================================================
INTERFACE: NavItem
=========================================================

PURPOSE:
--------
Defines structure of each navigation item.

WHY INTERFACE?
--------------
- Type safety
- Better readability
- Consistent structure

FIELDS:
-------
- label → Display name in UI
- icon  → Icon (emoji here, can be replaced with icon lib)
- route → Router path

=========================================================
*/
interface NavItem {
  label: string;
  icon: string;
  route: string;
}



/*
=========================================================
COMPONENT: SidebarComponent
=========================================================

PURPOSE:
--------
This component renders the LEFT SIDEBAR NAVIGATION.

It handles:
- Navigation links (modules)
- Collapsible UI
- User info display
- Logout action

---------------------------------------------------------

ARCHITECTURE ROLE:
------------------
Child of LayoutComponent

Flow:
LayoutComponent
   ↓ passes collapsed state
SidebarComponent
   ↓ renders navigation UI

---------------------------------------------------------

RELATIONSHIP:
-------------
Connected with:
- Router → navigation
- AuthService → user data + logout

---------------------------------------------------------

KEY CONCEPTS:
-------------
- @Input (parent → child communication)
- Routing (routerLink)
- Getter methods (derived data)
- Dependency Injection
- Interface usage (NavItem)

=========================================================
*/

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {

  /*
  =========================================================
  INPUT: COLLAPSE STATE
  =========================================================

  Comes from LayoutComponent

  true  → collapsed sidebar
  false → expanded sidebar
  */
  @Input() collapsed = false;



  /*
  =========================================================
  NAVIGATION ITEMS
  =========================================================

  Defines all sidebar menu items

  NOTE:
  - This is static for now
  - In production → comes from config / API / role-based logic
  */
  navItems: NavItem[] = [

    {
      label: 'Dashboard',
      icon: '📊',
      route: '/dashboard'
    },

    {
      label: 'Patients',
      icon: '👥',
      route: '/patients'
    },

    {
      label: 'Doctors',
      icon: '👨‍⚕️',
      route: '/doctors'
    },

    {
      label: 'Appointments',
      icon: '📅',
      route: '/appointments'
    },

    {
      label: 'Billing',
      icon: '🧾',
      route: '/billing'
    },

    {
      label: 'Pharmacy',
      icon: '💊',
      route: '/pharmacy'
    }
  ];



  /*
  =========================================================
  DEPENDENCY INJECTION
  =========================================================

  AuthService provides:
  - Username
  - Role
  - Logout functionality
  */
  constructor(public authService: AuthService) {}



  /*
  =========================================================
  GETTER: USERNAME
  =========================================================

  WHY GETTER?
  -----------
  Keeps template clean
  Encapsulates logic

  FALLBACK:
  ---------
  If no username → show "User"
  */
  get username(): string {
    return this.authService.getUsername() || 'User';
  }



  /*
  =========================================================
  GETTER: ROLE
  =========================================================
  */
  get role(): string {
    return this.authService.getRole() || '';
  }



  /*
  =========================================================
  ACTION: LOGOUT
  =========================================================

  Delegates logout logic to AuthService

  Flow:
  Sidebar → AuthService.logout()
          → Clear storage
          → Navigate to login page
  */
  logout(): void {
    this.authService.logout();
  }
}