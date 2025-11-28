import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../servicios/admin.service';

@Component({
  selector: 'app-editar-producto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editar-producto.component.html',
  styleUrl: './editar-producto.component.css'
})
export class EditarProductoComponent implements OnInit {
  private adminService = inject(AdminService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  id: number = 0;
  nombre: string = '';
  descripcion: string = '';
  precio: number = 0;
  stock: number = 0;
  imagen: string = '';
  estado: string = 'activo';

  mensaje: string = '';
  error: string = '';
  cargando: boolean = false;

  ngOnInit(): void {
    this.id = parseInt(this.route.snapshot.paramMap.get('id') || '0');
    if (this.id) {
      this.cargarProducto();
    }
  }

  cargarProducto(): void {
    this.adminService.getProductoById(this.id).subscribe({
      next: (producto: any) => {
        this.nombre = producto.nombre;
        this.descripcion = producto.descripcion;
        this.precio = producto.precio;
        this.stock = producto.stock;
        this.imagen = producto.imagen || '';
        this.estado = producto.vigencia || 'activo';
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.error = 'Error al cargar producto';
        console.error(err);
        this.cdr.markForCheck();
      }
    });
  }

  onNombreChange(): void {
    this.cdr.markForCheck();
  }

  onDescripcionChange(): void {
    this.cdr.markForCheck();
  }

  onPrecioChange(): void {
    this.cdr.markForCheck();
  }

  onStockChange(): void {
    this.cdr.markForCheck();
  }

  onImagenChange(): void {
    this.cdr.markForCheck();
  }

  guardar(): void {
    if (!this.nombre.trim() || !this.descripcion.trim()) {
      this.error = 'Nombre y descripción son requeridos';
      this.cdr.markForCheck();
      return;
    }

    if (this.precio <= 0) {
      this.error = 'El precio debe ser mayor a 0';
      this.cdr.markForCheck();
      return;
    }

    if (this.stock < 0) {
      this.error = 'El stock no puede ser negativo';
      this.cdr.markForCheck();
      return;
    }

    this.cargando = true;
    this.mensaje = '';
    this.error = '';
    this.cdr.markForCheck();

    const productoActualizado = {
      nombre: this.nombre,
      descripcion: this.descripcion,
      precio: this.precio,
      stock: this.stock,
      imagen: this.imagen,
      estado: this.estado
    };

    console.log('Enviando producto actualizado:', productoActualizado);

    this.adminService.modificarProducto(this.id, productoActualizado).subscribe({
      next: (res: any) => {
        console.log('Respuesta del servidor:', res);
        this.cargando = false;
        this.mensaje = 'Producto guardado correctamente ✓';
        this.cdr.markForCheck();
        setTimeout(() => this.volver(), 800);
      },
      error: (err: any) => {
        console.error('Error en guardar:', err);
        this.cargando = false;
        this.error = 'Error al guardar producto: ' + (err?.error?.error || err?.message || 'Error desconocido');
        this.cdr.markForCheck();
      }
    });
  }

  volver(): void {
    this.router.navigate(['/admin/productos']);
  }
}
