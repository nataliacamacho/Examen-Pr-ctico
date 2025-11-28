import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CarritoService } from '../../servicios/carrito.service';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent implements OnInit {

  constructor(
    public carritoService: CarritoService,
    private router: Router,
    public auth: AuthService
  ) {}

  ngOnInit() {
  }

  abrirCarrito() {
    this.router.navigate(['/carrito']);
  }

  irACatalogo() {
    this.router.navigateByUrl('/catalogo', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/catalogo']);
    }).catch(() => {
      this.router.navigate(['/catalogo']);
    });
  }

  irAInicio() {
    this.router.navigate(['/login']);
  }

  irAAdmin() {
    this.router.navigate(['/admin/productos']);
  }

  irAPerfil() {
    this.router.navigate(['/perfil']);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  getTotalUnidades(): number {
    return this.carritoService.productos().reduce((total, p: any) => {
      return total + (Number(p.cantidad ?? 1) || 1);
    }, 0);
  }

    esAdmin(): boolean {
      const usuario = this.auth.usuarioSignal();
      const rol = (usuario?.rol || '').toString().toLowerCase();
      return rol === 'admin' || rol === 'administrador';
    }
}
