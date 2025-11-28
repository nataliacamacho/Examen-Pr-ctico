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

    this.productos.update((lista) => {
      const index = lista.findIndex((p) => p.id === limpio.id);
      if (index >= 0) {
        const copia = [...lista];
        const existente = { ...copia[index] } as any;
        const currentQty = Number(existente.cantidad ?? 1);
        existente.cantidad = currentQty + 1;
        copia[index] = existente;
        return copia;
      }
      return [...lista, { ...limpio, cantidad: 1 }];
    });
  }

  quitar(id: number) {
    this.productos.update((lista) => {
      const index = lista.findIndex((p) => p.id === id);
      if (index === -1) return lista;
      const copia = [...lista];
      const existente = { ...copia[index] } as any;
      const currentQty = Number(existente.cantidad ?? 1);
      if (currentQty > 1) {
        existente.cantidad = currentQty - 1;
        copia[index] = existente;
        return copia;
      }
      copia.splice(index, 1);
      return copia;
    });
  }

  quitarTodo(id: number) {
    this.productos.update((lista) => lista.filter((p) => p.id !== id));
  }

  setCantidad(id: number, cantidad: number) {
    this.productos.update((lista) => {
      const index = lista.findIndex((p) => p.id === id);
      if (index === -1) return lista;
      const copia = [...lista];
      const existente = { ...copia[index] } as any;
      const qty = Number(cantidad) || 0;
      if (qty <= 0) {
        copia.splice(index, 1);
        return copia;
      }
      existente.cantidad = qty;
      copia[index] = existente;
      return copia;
    });
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

  exportarXML(data?: {
  carrito: any[],
  subtotal: number,
  iva: number,
  total: number
}) {
  const carrito = data?.carrito ?? this.productos();
  const subtotal = data?.subtotal ?? this.subtotal();
  const iva = data?.iva ?? this.iva();
  const total = data?.total ?? this.totalConIva();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<recibo>\n`;

  for (const p of carrito) {
    xml += `  <producto>\n`;
    xml += `    <id>${p.id}</id>\n`;
    xml += `    <nombre>${p.nombre}</nombre>\n`;
    xml += `    <precio>${Number(p.precio).toFixed(2)}</precio>\n`;
    if (p.descripcion)
      xml += `    <descripcion>${p.descripcion}</descripcion>\n`;
    xml += `    <cantidad>${Number(p.cantidad)}</cantidad>\n`;
    xml += `  </producto>\n`;
  }

  xml += `  <subtotal>${subtotal.toFixed(2)}</subtotal>\n`;
  xml += `  <iva>${iva.toFixed(2)}</iva>\n`;
  xml += `  <total>${total.toFixed(2)}</total>\n`;
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
