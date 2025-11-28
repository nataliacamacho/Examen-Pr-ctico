import {
  Component,
  AfterViewInit,
  PLATFORM_ID,
  computed,
  effect,
  inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarritoService } from '../../servicios/carrito.service';
import { AuthService } from '../../servicios/auth.service';
import { Producto } from '../../models/producto';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import cors from 'cors';



declare var paypal: any;

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './carrito.component.html',
})
export class CarritoComponent implements AfterViewInit {
  private carritoService = inject(CarritoService);
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  carrito = this.carritoService.productos;

  subtotal = computed(() => this.carritoService.subtotal());
  iva = computed(() => this.carritoService.iva());
  totalConIva = computed(() => this.carritoService.totalConIva());

  actualizarPayPal = effect(() => {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.verificarYRenderizarPayPal(), 150);
    }
  });

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.verificarYRenderizarPayPal(), 300);
    }
  }

  quitar(id: number) {
    this.carritoService.quitar(id);
  }

  quitarTodo(id: number) {
    this.carritoService.quitarTodo(id);
  }

  incrementar(id: number) {
    const producto = this.carrito().find((p: any) => p.id === id);
    if (producto) this.carritoService.agregar(producto as Producto);
  }

  decrementar(id: number) {
    this.carritoService.quitar(id);
  }

  vaciar() {
    this.carritoService.vaciar();
  }

  trackByProductoId(index: number, producto: Producto): number {
    return producto.id;
  }

  getCantidad(producto: any): number {
    return Number(producto.cantidad ?? 1);
  }

  lineTotal(producto: any): number {
    return Number(producto.precio) * this.getCantidad(producto);
  }

  actualizarCantidad(id: number, value: any) {
    const n = Number(value) || 0;
    try {
      this.carritoService.setCantidad(id, n);
    } catch (e) {
      console.error('Error actualizando cantidad:', e);
    }
  }

  getStockOptions(producto: any): number[] {
    return Array.from({ length: Number(producto.stock) || 0 }, (_, i) => i + 1);
  }

  finalizarCompra() {
    console.warn('finalizarCompra() deprecated - usar botones de PayPal');
  }

  private verificarYRenderizarPayPal() {
    const totalValue = this.totalConIva();
    const productos = this.carrito();

    const container = document.getElementById('paypal-button-container');
    if (!container) return;

    if (!(window as any).paypal) {
      console.log('SDK PayPal no listo, reintentando...');
      setTimeout(() => this.verificarYRenderizarPayPal(), 300);
      return;
    }

    if (totalValue <= 0 || productos.length === 0) {
      container.innerHTML = '';
      container.removeAttribute('data-paypal-button');
      return;
    }

    if (container.getAttribute('data-paypal-button') === 'true') return;

    container.innerHTML = '';
    container.setAttribute('data-paypal-button', 'true');

    paypal.Buttons({
      style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal' },

      createOrder: async () => {
        try {
          const res = await firstValueFrom(
            this.http.post<any>(
              'http://localhost:3000/api/paypal/create-order',
              { total: totalValue },
              { withCredentials: true }
            )
          );
          return res.id;
        } catch (error) {
          console.error('Error creando la orden:', error);
          alert('Error creando la orden de PayPal.');
          throw error;
        }
      },

      onApprove: async (data: any) => {
        try {
          const usuario = this.authService.getUsuario();
          const payload = {
            orderID: data.orderID,
            usuarioId: usuario?.id ?? null,
            carrito: this.carrito().map((p) => ({
              id: p.id,
              nombre: p.nombre,
              precio: Number(p.precio),
              cantidad: p.cantidad ?? 1,
            })),
          };

          const res = await firstValueFrom(
            this.http.post<any>(
              'http://localhost:3000/api/paypal/capture-order',
              payload,
              { withCredentials: true }
            )
          );

          if (res?.ok) {
            alert('Pago completado con éxito. Se genera recibo...');
            this.carritoService.exportarXML();
            this.carritoService.vaciar();
          } else {
            console.warn('Respuesta inesperada:', res);
            alert('La orden fue procesada pero hubo un problema con el servidor.');
          }
        } catch (error) {
          console.error('Error capturando pago:', error);
          alert('Error al finalizar el pago. Revisa la consola.');
        }
      },

      onCancel: () => alert('Pago cancelado por el usuario.'),
      onError: (err: any) => {
        console.error('Error PayPal:', err);
        alert('Ocurrió un error con PayPal.');
      },
    }).render('#paypal-button-container');
  }
}
