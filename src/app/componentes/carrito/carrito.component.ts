import {
  Component,
  AfterViewInit,
  PLATFORM_ID,
  computed,
  effect,
  inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CarritoService } from '../../servicios/carrito.service';
import { Producto } from '../../models/producto';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

declare var paypal: any;

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrito.component.html',
})
export class CarritoComponent implements AfterViewInit {
  private carritoService = inject(CarritoService);
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  carrito = this.carritoService.productos;

  subtotal = computed(() => this.carritoService.subtotal());
  iva = computed(() => this.carritoService.iva());
  totalConIva = computed(() => this.carritoService.totalConIva());

  actualizarPayPal = effect(() => {
    const productos = this.carrito();
    const total = this.totalConIva();
    console.log(
      '🧾 Cambio detectado en carrito:',
      productos.length,
      'productos, total con IVA:',
      total
    );

    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.verificarYRenderizarPayPal(), 250);
    }
  });

  ngAfterViewInit(): void {}

  quitar(id: number) {
    this.carritoService.quitar(id);
  }

  vaciar() {
    this.carritoService.vaciar();
  }

  trackByProductoId(index: number, producto: Producto): number {
    return producto.id;
  }

  finalizarCompra() {
    this.carritoService.confirmarCompra();
    alert('Compra realizada correctamente. Recibo generado.');
  }

  private verificarYRenderizarPayPal() {
    const totalValue = this.totalConIva();
    const productos = this.carrito();

    const container = document.getElementById('paypal-button-container');
    if (!container) return;

    if (totalValue <= 0 || productos.length === 0) {
      container.innerHTML = '';
      console.log('🧹 Carrito vacío. Botón PayPal eliminado.');
      return;
    }

    if (!(window as any).paypal) {
      console.log('⏳ SDK de PayPal no listo. Reintentando...');
      setTimeout(() => this.verificarYRenderizarPayPal(), 500);
      return;
    }

    container.innerHTML = '';

    paypal.Buttons({
      createOrder: async () => {
        const total = this.totalConIva();
        try {
          const res = await firstValueFrom(
            this.http.post<any>('http://localhost:3000/api/paypal/create-order', {
              total,
            })
          );
          console.log('Orden creada en PayPal:', res.id);
          return res.id;
        } catch (error) {
          console.error('Error al crear la orden:', error);
          alert('Error al crear la orden de PayPal.');
          throw error;
        }
      },

      onApprove: async (data: any) => {
        try {
          const payload = {
            orderID: data.orderID,
            carrito: this.carrito().map((p) => ({
              id: p.id,
              nombre: p.nombre,
              precio:
                typeof p.precio === 'string'
                  ? Number(p.precio.replace(/[^0-9.-]+/g, ''))
                  : p.precio,
              cantidad: (p as any).cantidad ?? 1,
            })),
          };

          const res = await firstValueFrom(
            this.http.post<any>(
              'http://localhost:3000/api/paypal/capture-order',
              payload
            )
          );

          console.log('Pago capturado y stock actualizado:', res);
          alert('Pago completado con éxito.');
          this.carritoService.confirmarCompra(); 
          window.location.reload();
        } catch (error) {
          console.error('⚠️ Error al capturar pago:', error);
          alert('Error al finalizar el pago.');
        }
      },

      onCancel: () => alert('Pago cancelado por el usuario.'),
      onError: (err: any) => {
        console.error('Error en PayPal:', err);
        alert('Ocurrió un error en el proceso de pago.');
      },
    }).render('#paypal-button-container');
  }
}
