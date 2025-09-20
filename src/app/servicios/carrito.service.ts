import { Injectable, signal } from '@angular/core';
import { Producto } from '../models/producto';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private productosSignal = signal<Producto[]>([]);
  productos = this.productosSignal.asReadonly();

  agregar(producto: Producto) {
    this.productosSignal.update(lista => [...lista, producto]);
  }

  quitar(id: number) {
    this.productosSignal.update(lista => lista.filter(p => p.id !== id));
  }

  vaciar() {
    this.productosSignal.set([]);
  }

  total() {
    return this.productosSignal().reduce((acc, p) => acc + p.precio, 0);
  }

  exportarXML() {
    const productos = this.productosSignal();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<recibo>\n`;

    for (const p of productos) {
      xml += `  <producto>\n`;
      xml += `    <id>${p.id}</id>\n`;
      xml += `    <nombre>${p.nombre}</nombre>\n`;
      xml += `    <precio>${p.precio.toFixed(2)}</precio>\n`;
      if (p.descripcion){
        xml += `    <descripcion>${p.descripcion}</descripcion>\n`;
      }
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