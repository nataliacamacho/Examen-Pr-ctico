import { Component, inject, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { routes } from './app.routes';
import { NavbarComponent } from './componentes/navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AdminModule } from './admin/admin-module';
import { AuthService } from './servicios/auth.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NavbarComponent,
    FormsModule,
    RouterModule,
    AdminModule,
    HttpClientModule 
  ],
  template: `
    <app-navbar></app-navbar>
    <router-outlet></router-outlet>
  `
})
export class App implements OnInit {
  private router = inject(Router);
  private auth = inject(AuthService);

  ngOnInit(): void {
    try {
      const usuario = this.auth.getUsuario();
      const rol = (usuario?.rol || '').toString().toLowerCase();
      const path = window.location.pathname || '/';
      if ((rol === 'admin' || rol === 'administrador') && (path === '/' || path === '/catalogo' || path === '/login')) {
        this.router.navigate(['/admin/productos']);
      }
    } catch (e) {
    }
  }
}

