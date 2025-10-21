// src/app/components/carrito/carrito.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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
export class CarritoComponent implements OnInit {
  private carritoService = inject(CarritoService);
  private http = inject(HttpClient);

  carrito = this.carritoService.productos; // signal
  total = 0;

  quitar(id: number) {
    this.carritoService.quitar(id);
    this.actualizarTotal();
  }

  vaciar() {
    this.carritoService.vaciar();
    this.actualizarTotal();
  }

  exportarXML() {
    this.carritoService.exportarXML();
  }

  trackByProductoId(index: number, producto: Producto): number {
    return producto.id;
  }

  ngOnInit(): void {
    // Calcular total inicial
    this.actualizarTotal();

    // Observador ligero: comprueba cambios cada 800 ms (menos spam)
    // Si prefieres, más abajo explico cómo suscribirte reactívamente sin interval.
    setInterval(() => this.actualizarTotal(), 800);

    // Espera a que PayPal esté listo
    const checkPaypal = setInterval(() => {
      if (typeof window !== 'undefined' && (window as any).paypal) {
        clearInterval(checkPaypal);
        this.renderizarBotonPayPal();
      }
    }, 500);
  }

  private actualizarTotal() {
    const carritoActual = this.carrito();
    // Sumar ya números (el servicio asegura que precio sea number)
    this.total = carritoActual.reduce((acc, prod) => {
      const precioNum = Number((prod as any).precio ?? 0);
      const cantidad = Number((prod as any).cantidad ?? 1);
      const qty = isFinite(cantidad) && cantidad > 0 ? cantidad : 1;
      return acc + (isFinite(precioNum) ? precioNum * qty : 0);
    }, 0);
    // (opcional) console.log('Total recalculado:', this.total);
  }

  private renderizarBotonPayPal() {
    if (typeof window === 'undefined') return;

    const container = document.getElementById('paypal-button-container');
    if (container) container.innerHTML = '';

    paypal.Buttons({
      createOrder: async () => {
        const total = Number(this.total.toFixed(2));
        if (isNaN(total) || total <= 0) {
          alert('Tu carrito está vacío. Agrega productos antes de pagar.');
          throw new Error('Carrito vacío');
        }

        try {
          const res = await firstValueFrom(
            this.http.post<any>('http://localhost:3000/api/paypal/create-order', { total })
          );
          console.log('Orden creada:', res);
          return res.id;
        } catch (error) {
          console.error('Error al crear la orden:', error);
          alert('No se pudo crear la orden de pago.');
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
          console.log('Pago capturado:', res);
          alert('✅ Pago exitoso');
          this.vaciar();
        } catch (error) {
          console.error('Error al capturar el pago:', error);
          alert('Error al finalizar el pago.');
        }
      },
      onCancel: () => alert('❌ Pago cancelado por el usuario.'),
      onError: (err: any) => {
        console.error('Error con PayPal:', err);
        alert('⚠️ Ocurrió un error al procesar el pago.');
      },
    }).render('#paypal-button-container');
  }
}
