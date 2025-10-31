import {
  Component,
  AfterViewInit,
  Inject,
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
declare global {
  interface Window {
    paypal: any;
  }
}

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
  total = computed(() => this.carritoService.total());

  // 👇 Effect que reacciona automáticamente a los cambios del carrito
  actualizarPayPal = effect(() => {
    const productos = this.carrito();
    const total = this.total();
    console.log('🧾 Cambio detectado en carrito:', productos.length, 'productos, total:', total);

    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.verificarYRenderizarPayPal(), 250);
    }
  });

  ngAfterViewInit(): void {
    // El effect se encarga de renderizar automáticamente al detectar cambios
  }

  quitar(id: number) {
    this.carritoService.quitar(id);
  }

  vaciar() {
    this.carritoService.vaciar();
  }

  exportarXML() {
    this.carritoService.exportarXML();
  }

  trackByProductoId(index: number, producto: Producto): number {
    return producto.id;
  }

  // ✅ Función para verificar y renderizar el botón de PayPal
  private verificarYRenderizarPayPal() {
    const totalValue = this.total();
    const productos = this.carrito();

    const container = document.getElementById('paypal-button-container');
    if (!container) return;

    // Si no hay productos, elimina el botón
    if (totalValue <= 0 || productos.length === 0) {
      container.innerHTML = '';
      console.log('🧹 Carrito vacío. Botón PayPal eliminado.');
      return;
    }

    // Esperar a que el SDK de PayPal esté listo
    if (!(window as any).paypal) {
      console.log('⏳ SDK de PayPal no listo. Reintentando...');
      setTimeout(() => this.verificarYRenderizarPayPal(), 500);
      return;
    }

    // Limpiar contenedor antes de renderizar
    container.innerHTML = '';

    // Renderizar el botón de PayPal
    paypal.Buttons({
      createOrder: async () => {
        const total = this.total();
        try {
          const res = await firstValueFrom(
            this.http.post<any>('http://localhost:3000/api/paypal/create-order', { total })
          );
          console.log('🆕 Orden creada en PayPal:', res.id);
          return res.id;
        } catch (error) {
          console.error('❌ Error al crear la orden:', error);
          alert('Error al crear la orden de PayPal.');
          throw error;
        }
      },
      onApprove: async (data: any) => {
        try {
          const res = await firstValueFrom(
            this.http.post<any>('http://localhost:3000/api/paypal/capture-order', {
              orderID: data.orderID,
            })
          );
          console.log('✅ Pago capturado con éxito:', res);
          alert('✅ Pago completado con éxito.');
          this.vaciar();
        } catch (error) {
          console.error('⚠️ Error al capturar pago:', error);
          alert('Error al finalizar el pago.');
        }
      },
      onCancel: () => alert('❌ Pago cancelado por el usuario.'),
      onError: (err: any) => {
        console.error('💥 Error en PayPal:', err);
        alert('⚠️ Ocurrió un error en el proceso de pago.');
      },
    }).render('#paypal-button-container');
  }
}
