// src/app/servicios/carrito.service.ts
import { Injectable, signal } from '@angular/core';
import { Producto } from '../models/producto';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  productos = signal<Producto[]>([]);

  // Normaliza cualquier formato de precio a número (maneja "$1,234.56", "1.234,56", "100", 100)
  private parsePrice(value: any): number {
    if (value == null) return 0;
    if (typeof value === 'number') return isFinite(value) ? value : 0;

    // si no es string, intenta Number
    if (typeof value !== 'string') {
      const n = Number(value);
      return isFinite(n) ? n : 0;
    }

    let s = value.trim();
    // eliminar todo lo que no sea dígito, punto o coma o signo negativo
    s = s.replace(/[^0-9.,-]/g, '');

    // decidir separador decimal: si la última coma está después del último punto -> coma decimal
    const lastDot = s.lastIndexOf('.');
    const lastComma = s.lastIndexOf(',');

    if (lastComma > lastDot) {
      // coma decimal (1.234,56) -> quitar puntos (miles) y convertir coma a punto
      s = s.replace(/\./g, '').replace(/,/g, '.');
    } else {
      // punto decimal (1,234.56) o solo dígitos -> quitar comas (miles)
      s = s.replace(/,/g, '');
    }

    const n = Number(s);
    return isFinite(n) ? n : 0;
  }

  // Al agregar, guardamos precio ya normalizado en número
  agregar(producto: Producto) {
    const precioNum = this.parsePrice((producto as any).precio);
    const limpio: Producto = {
      ...producto,
      precio: precioNum
    };
    this.productos.update(lista => [...lista, limpio]);
  }

  quitar(id: number) {
    this.productos.update(lista => lista.filter(p => p.id !== id));
  }

  vaciar() {
    this.productos.set([]);
  }

  // total considera cantidad si existe, y usa parsePrice por si hay valores inesperados
  total(): number {
    return this.productos().reduce((acc, p) => {
      const precio = this.parsePrice((p as any).precio);
      const cantidad = Number((p as any).cantidad ?? 1);
      const qty = isFinite(cantidad) && cantidad > 0 ? cantidad : 1;
      return acc + precio * qty;
    }, 0);
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
      if (p.descripcion) xml += `    <descripcion>${p.descripcion}</descripcion>\n`;
      if (!isNaN(cantidad)) xml += `    <cantidad>${cantidad}</cantidad>\n`;
      xml += `  </producto>\n`;
    }

    xml += `  <total>${this.total().toFixed(2)}</total>\n`;
    xml += `</recibo>`;

    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recibo.xml';
    a.click();
    URL.revokeObjectURL(url);
  }
}
