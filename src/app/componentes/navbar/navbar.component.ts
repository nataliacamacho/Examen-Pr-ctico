import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CarritoService } from '../../servicios/carrito.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  constructor(
    public carritoService: CarritoService,
    private router: Router
  ) {}

  abrirCarrito() {
    this.router.navigate(['/carrito']);
  }

  irACatalogo() {
    this.router.navigate(['/']);
  }
}
