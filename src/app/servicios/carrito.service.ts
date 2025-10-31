import { Injectable, signal, inject } from '@angular/core';
import { Producto } from '../models/producto';
import { ProductoService } from './producto.service';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  productos = signal<Producto[]>([]);
  private productoService = inject(ProductoService);

  private parsePrice(value: any): number {
    if (value == null) return 0;
    if (typeof value === 'number') return isFinite(value) ? value : 0;

    if (typeof value !== 'string') {
      const n = Number(value);
      return isFinite(n) ? n : 0;
    }

    let s = value.trim().replace(/[^0-9.,-]/g, '');
    const lastDot = s.lastIndexOf('.');
    const lastComma = s.lastIndexOf(',');

    if (lastComma > lastDot) {
      s = s.replace(/\./g, '').replace(/,/g, '.');
    } else {
      s = s.replace(/,/g, '');
    }

    const n = Number(s);
    return isFinite(n) ? n : 0;
  }

  agregar(producto: Producto) {
    const precioNum = this.parsePrice((producto as any).precio);
    const limpio: Producto = { ...producto, precio: precioNum };
    this.productos.update((lista) => [...lista, limpio]);
  }

  quitar(id: number) {
    this.productos.update((lista) => lista.filter((p) => p.id !== id));
  }

  vaciar() {
    this.productos.set([]);
  }

  subtotal(): number {
    return this.productos().reduce((acc, p) => {
      const precio = this.parsePrice((p as any).precio);
      const cantidad = Number((p as any).cantidad ?? 1);
      const qty = isFinite(cantidad) && cantidad > 0 ? cantidad : 1;
      return acc + precio * qty;
    }, 0);
  }

  iva(): number {
    return this.subtotal() * 0.16;
  }

  totalConIva(): number {
    return this.subtotal() + this.iva();
  }

  exportarXML() {
    const productos = this.productos();
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<recibo>\n`;

    for (const p of productos) {
      const precioNum = this.parsePrice((p as any).precio);
      const cantidad = Number((p as any).cantidad ?? 1);
      xml += `  <producto>\n`;
      xml += `    <id>${p.id}</id>\n`;
      xml += `    <nombre>${p.nombre}</nombre>\n`;
      xml += `    <precio>${precioNum.toFixed(2)}</precio>\n`;
      if (p.descripcion)
        xml += `    <descripcion>${p.descripcion}</descripcion>\n`;
      xml += `    <cantidad>${cantidad}</cantidad>\n`;
      xml += `  </producto>\n`;
    }

    xml += `  <subtotal>${this.subtotal().toFixed(2)}</subtotal>\n`;
    xml += `  <iva>${this.iva().toFixed(2)}</iva>\n`;
    xml += `  <total>${this.totalConIva().toFixed(2)}</total>\n`;
    xml += `</recibo>`;

    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recibo.xml';
    a.click();
    URL.revokeObjectURL(url);
  }

  confirmarCompra() {
    this.exportarXML();
    this.vaciar();
    console.log('Compra confirmada — recibo generado y carrito vacío.');
  }
}
