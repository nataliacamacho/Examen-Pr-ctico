// src/app/components/carrito/carrito.component.ts
import { Component, OnInit, computed, inject } from '@angular/core';
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
  templateUrl: './carrito.component.html'
})
export class CarritoComponent implements OnInit {
  private carritoService = inject(CarritoService);
  private http = inject(HttpClient);

  carrito = this.carritoService.productos;
  total = computed(() => this.carritoService.total());

  quitar(id: number) { this.carritoService.quitar(id); }
  vaciar() { this.carritoService.vaciar(); }
  exportarXML() { this.carritoService.exportarXML(); }
  trackByProductoId(index: number, producto: Producto): number { return producto.id; }

  ngOnInit(): void {
    const checkPaypal = setInterval(() => {
      if (typeof window !== 'undefined' && (window as any).paypal) {
        clearInterval(checkPaypal);
        this.renderizarBotonPayPal();
      }
    }, 500);
  }

  private renderizarBotonPayPal() {
    if (typeof window === 'undefined') return;

    paypal.Buttons({
      createOrder: async (data: any, actions: any) => {
        const total = this.total();
        if (total <= 0) {
          alert('Tu carrito está vacío. Agrega productos antes de pagar.');
          throw new Error('Carrito vacío');
        }

        try {
          const res = await firstValueFrom(
            this.http.post<any>(
              'http://localhost:3000/api/pago',
              { total }
            )
          );
          return res.id;
        } catch (error) {
          console.error('Error al crear la orden:', error);
          alert('No se pudo crear la orden de pago.');
          throw error;
        }
      },
      onApprove: async (data: any, actions: any) => {
        try {
          const res = await firstValueFrom(
            this.http.post<any>(
              'http://localhost:3000/api/capturar',
              { orderID: data.orderID }
            )
          );
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
      }
    }).render('#paypal-button-container');
  }
}
