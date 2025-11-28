import { Component, inject, OnInit, ChangeDetectorRef, effect } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Producto } from '../../models/producto';
import { ProductoService } from '../../servicios/producto.service';
import { CarritoService } from '../../servicios/carrito.service';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.css']
})
export class CatalogoComponent implements OnInit {
  private carritoService = inject(CarritoService);
  private productoService = inject(ProductoService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);
  private _loadingProductos = false;

  productos: Producto[] = [];
  cantidades: { [id: number]: number } = {}; 

  ngOnInit(): void {
    console.log('[Catalogo] ngOnInit - cargarProductos inicial');
    this.cargarProductos();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects || (event as any).url;
        console.log('[Catalogo] NavigationEnd', url);
        if (url === '/' || url === '/catalogo' || url.endsWith('/catalogo')) {
          console.log('[Catalogo] navegó a catalogo, recargando productos');
          this.cargarProductos();
        }
      });

    try {
      effect(() => {
        const u = this.authService.getUsuario();
        console.log('[Catalogo] efecto usuario cambiado:', u);
        if (!this._loadingProductos) {
          this.cargarProductos();
        }
      });
    } catch (e) {
    }
  }

  cargarProductos() {
    console.log('[Catalogo] cargarProductos -> solicitando al servicio');
    if (this._loadingProductos) return;
    this._loadingProductos = true;
    this.productoService.obtenerProductos().subscribe({
      next: (data: Producto[]) => {
        console.log('[Catalogo] productos recibidos:', data);
        this.productos = data;
        this.cantidades = {};
        data.forEach(p => {
          this.cantidades[p.id] = 1;
        });
        try { this.cdr.detectChanges(); } catch (e) {  }
        if ((!data || data.length === 0) && !this.esAdmin()) {
          console.log('[Catalogo] no se recibieron productos, reintentando...');
          setTimeout(() => this.productoService.obtenerProductos().subscribe({
            next: (d2: Producto[]) => {
              if (d2 && d2.length > 0) this.productos = d2;
              try { this.cdr.detectChanges(); } catch (e) {}
            },
            error: (err: any) => console.error('Reintento error cargando productos:', err)
          }), 800);
        }
      },
      error: (err: any) => console.error('Error cargando productos:', err),
      complete: () => { this._loadingProductos = false; }
    });
  }

  agregar(producto: Producto) {
    const cantidadSolicitada = this.cantidades[producto.id] || 1;
    const stock = Number(producto.stock) || 0;
    
    const productoEnCarrito = this.carritoService.productos().find(p => p.id === producto.id);
    const cantidadEnCarrito = productoEnCarrito ? Number((productoEnCarrito as any).cantidad ?? 1) : 0;
    
    const stockDisponible = stock - cantidadEnCarrito;
    
    if (stockDisponible <= 0) {
      alert(`No hay más unidades disponibles. Ya tienes ${cantidadEnCarrito} en el carrito.`);
      return;
    }
    
    if (cantidadSolicitada > stockDisponible) {
      alert(`Solo puedes agregar ${stockDisponible} más unidades. Ya tienes ${cantidadEnCarrito} en el carrito.`);
      return;
    }
    
    for (let i = 0; i < cantidadSolicitada; i++) {
      this.carritoService.agregar(producto);
    }
    this.cantidades[producto.id] = 1;
  }

  trackByProductoId(index: number, producto: Producto): number {
    return producto.id;
  }

  getStockDisponible(producto: Producto): number {
    const stock = Number(producto.stock) || 0;
    const productoEnCarrito = this.carritoService.productos().find(p => p.id === producto.id);
    const cantidadEnCarrito = productoEnCarrito ? Number((productoEnCarrito as any).cantidad ?? 1) : 0;
    return Math.max(0, stock - cantidadEnCarrito);
  }

  getStockOptions(producto: Producto): number[] {
    const stock = this.getStockDisponible(producto);
    return Array.from({ length: stock }, (_, i) => i + 1);
  }

    esAdmin(): boolean {
      const usuario = this.authService.getUsuario();
      const rol = (usuario?.rol || '').toString().toLowerCase();
      return rol === 'admin' || rol === 'administrador';
    }
}
