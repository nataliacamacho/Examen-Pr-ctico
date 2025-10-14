import { Component, inject, OnInit } from '@angular/core';
import { Producto } from '../../models/producto';
import { ProductoService } from '../../servicios/producto.service';
import { CarritoService } from '../../servicios/carrito.service';
import { CarritoComponent } from '../carrito/carrito.component';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CarritoComponent, CurrencyPipe],
  templateUrl: './catalogo.component.html'
})
export class CatalogoComponent implements OnInit {
  private carritoService = inject(CarritoService);
  private productoService = inject(ProductoService);

  productos: Producto[] = []; // Empezamos vacío, se llenará desde la DB

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos() {
    this.productoService.obtenerProductos().subscribe({
      next: (data: any) => this.productos = data as Producto[], // Datos de la DB
      error: (err: any) => console.error('Error cargando productos:', err)
    });
  }

  agregar(producto: Producto) {
    this.carritoService.agregar(producto);
  }

  trackByProductoId(index: number, producto: Producto): number {
    return producto.id;
  }
}




/*import { Component, inject} from '@angular/core';
import { CarritoService, } from '../../servicios/carrito.service';
import { Producto } from '../../models/producto';
import { CarritoComponent } from '../carrito/carrito.component';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CarritoComponent, CurrencyPipe],
  templateUrl: './catalogo.component.html'
})
export class CatalogoComponent {
  private carritoService = inject(CarritoService);

  productos: Producto[] = [];

  /*productos: Producto[] = [
    {
      id: 1,
      nombre: 'Pinceles',
      descripcion: 'Juego de pinceles de diferentes tamaños',
      precio: 250.00,
      imagen: 'assets/images/pinceles.jpg'
    },
    {
      id: 2,
      nombre: 'Caballetes',
      descripcion: 'Caballete de madera ajustable para pintura',
      precio: 145.00,
      imagen: 'assets/images/caballetes.jpg'
    },
    {
      id: 3,
      nombre: 'Paleta',
      descripcion: 'Paleta de mezclas para pinturas',
      precio: 40.00,
      imagen: 'assets/images/paleta.jpg'
    },
    {
      id: 4,
      nombre: 'Acrilicos',
      descripcion: 'Set de pinturas acrílicas de 12 colores',
      precio: 280.00,
      imagen: 'assets/images/acrilicos.jpg'
    },
    {
      id: 5,
      nombre: 'Lienzo',
      descripcion: 'Lienzo para pintura 50x70 cm',
      precio: 40.00,
      imagen: 'assets/images/lienzo.jpg'
    },
  ];

   agregar(producto: Producto) {
    this.carritoService.agregar(producto);
  }
 
  trackByProductoId(index: number, producto: Producto): number {
    return producto.id;
  }
  
}*/