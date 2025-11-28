import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AdminService } from '../../servicios/admin.service';
import { firstValueFrom } from 'rxjs';
import { timeout } from 'rxjs/operators';

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagen?: string;
  vigencia?: string;
}

@Component({
  selector: 'app-productos-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos-admin.component.html',
  styleUrls: ['./productos-admin.component.css'],
})
export class ProductosAdminComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private adminService = inject(AdminService);

  productos = this.adminService.productosSignal;
  productoEditando: Producto | null = null;
  formVisible = false;
  loading = false;
  mensaje = '';

  formData = {
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    imagen: '',
  };

  async ngOnInit() {
    await this.cargarProductos();
  }

  async cargarProductos() {
    try {
      this.loading = true;
      // Esto dispara el tap() en el servicio que actualiza el signal
      const result = await firstValueFrom(
        this.adminService.getProductos()
      );
      console.log('Productos cargados:', result);
    } catch (error) {
      this.mensaje = 'Error al cargar productos';
      console.error('Error cargando productos:', error);
    } finally {
      this.loading = false;
    }
  }

  abrirFormulario(producto?: Producto) {
    if (producto) {
      this.productoEditando = { ...producto };
      this.formData = {
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: producto.precio,
        stock: producto.stock,
        imagen: producto.imagen || '',
      };
    } else {
      this.productoEditando = null;
      this.formData = {
        nombre: '',
        descripcion: '',
        precio: 0,
        stock: 0,
        imagen: '',
      };
    }
    this.formVisible = true;
  }

  cerrarFormulario() {
    this.formVisible = false;
    this.productoEditando = null;
  }

  async guardarProducto() {
    if (!this.formData.nombre || this.formData.precio <= 0) {
      this.mensaje = 'Por favor completa los campos obligatorios.';
      return;
    }

    try {
      this.loading = true;
      try {
        if (this.productoEditando) {
          // Actualizar con timeout
          await firstValueFrom(
            this.http.put<any>(
              `http://localhost:3000/api/admin/productos/${this.productoEditando.id}`,
              this.formData,
              { withCredentials: true }
            ).pipe(timeout(10000))
          );
          this.mensaje = 'Producto actualizado exitosamente';
        } else {
          // Crear con timeout
          await firstValueFrom(
            this.http.post<any>(
              'http://localhost:3000/api/admin/productos',
              this.formData,
              { withCredentials: true }
            ).pipe(timeout(10000))
          );
          this.mensaje = 'Producto creado exitosamente';
        }
      } catch (err: any) {
        // Mostrar mensaje devuelto por el servidor si está disponible
        const serverMsg = err?.error?.message || err?.error?.error || err?.message;
        if (err && err.name === 'TimeoutError') {
          this.mensaje = 'La operación tardó demasiado. Intenta de nuevo.';
        } else if (serverMsg) {
          this.mensaje = serverMsg;
          console.error('Server error:', err);
        } else {
          this.mensaje = 'Error al guardar producto';
          console.error(err);
        }
      }
      await this.cargarProductos();
      this.cerrarFormulario();
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => {
        this.mensaje = '';
      }, 3000);
    } finally {
      this.loading = false;
    }
  }

  async eliminarProducto(id: number) {
    if (!confirm('¿Seguro que quieres eliminar este producto?')) return;

    try {
      this.loading = true;
      try {
        await firstValueFrom(
          this.http.delete<any>(
            `http://localhost:3000/api/admin/productos/${id}`,
            { withCredentials: true }
          ).pipe(timeout(10000))
        );
        this.mensaje = 'Producto eliminado exitosamente';
        // Optimistic UI update: marcar localmente como inactivo para mostrar cambio inmediato
        const productosActuales = this.productos();
        const idx = productosActuales.findIndex((p: any) => p.id === id);
        if (idx !== -1) {
          const productosActualizados = [...productosActuales];
          productosActualizados[idx].vigencia = 'no activo';
          this.productos.set(productosActualizados);
        }
        // Luego sincronizamos con el servidor
        await this.cargarProductos();
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => {
          this.mensaje = '';
        }, 3000);
      } catch (err: any) {
        const serverMsg = err?.error?.message || err?.error?.error || err?.message;
        if (err && err.name === 'TimeoutError') {
          this.mensaje = 'La eliminación tardó demasiado. Intenta de nuevo.';
        } else if (serverMsg) {
          this.mensaje = serverMsg;
          console.error('Server error:', err);
        } else {
          this.mensaje = 'Error al eliminar producto';
          console.error(err);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      this.loading = false;
    }
  }

  estaInactivo(producto: Producto): boolean {
    return producto.vigencia === 'no activo';
  }

  editarProducto(id: number): void {
    this.router.navigate(['/admin/productos', id, 'editar']);
  }
}
