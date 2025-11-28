import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../servicios/admin.service';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html'
})
export class ProductosComponent implements OnInit {
  productos: any[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.adminService.getProductos().subscribe({
      next: (data) => this.productos = data,
      error: (err) => console.error('Error cargando productos:', err)
    });
  }

  nuevoProducto(): void {
    const producto = {
      nombre: prompt('Nombre:') || '',
      descripcion: prompt('Descripción:') || '',
      precio: parseFloat(prompt('Precio:') || '0'),
      stock: parseInt(prompt('Stock:') || '0'),
      imagen: prompt('URL imagen:') || ''
    };

    this.adminService.agregarProducto(producto).subscribe({
      next: () => this.cargarProductos(),
      error: (err) => console.error('Error agregando producto:', err)
    });
  }

  editarProducto(producto: any): void {
    producto.nombre = prompt('Nombre:', producto.nombre) || producto.nombre;
    producto.descripcion = prompt('Descripción:', producto.descripcion) || producto.descripcion;
    producto.precio = parseFloat(prompt('Precio:', producto.precio.toString()) || producto.precio.toString());
    producto.stock = parseInt(prompt('Stock:', producto.stock.toString()) || producto.stock.toString());

    this.adminService.modificarProducto(producto.id, producto).subscribe({
      next: () => this.cargarProductos(),
      error: (err) => console.error('Error modificando producto:', err)
    });
  }

  toggleVigencia(producto: any): void {
    const nuevoEstado = producto.estado === 'activo' ? 'inactivo' : 'activo';
    this.adminService.cambiarVigencia(producto.id, nuevoEstado).subscribe({
      next: () => this.cargarProductos(),
      error: (err) => console.error('Error cambiando vigencia:', err)
    });
  }
}
