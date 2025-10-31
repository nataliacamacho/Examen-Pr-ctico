import { Component, inject, OnInit } from '@angular/core';
import { Producto } from '../../models/producto';
import { ProductoService } from '../../servicios/producto.service';
import { CarritoService } from '../../servicios/carrito.service';
import { CurrencyPipe } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './catalogo.component.html'
})
export class CatalogoComponent implements OnInit {
  private carritoService = inject(CarritoService);
  private productoService = inject(ProductoService);
  private router = inject(Router);

  productos: Producto[] = [];

  ngOnInit(): void {
    this.cargarProductos();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.urlAfterRedirects === '/') {
          this.cargarProductos();
        }
      });
  }

  cargarProductos() {
    this.productoService.obtenerProductos().subscribe({
      next: (data: Producto[]) => this.productos = data,
      error: (err: any) => console.error('Error cargando productos:', err)
    });
  }

  agregar(producto: Producto) {
  if (producto.stock > 0) {
    this.carritoService.agregar(producto);
  } else {
    alert('⚠️ Este producto está agotado.');
  }
}


  trackByProductoId(index: number, producto: Producto): number {
    return producto.id;
  }
}
