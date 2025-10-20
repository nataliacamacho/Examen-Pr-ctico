// src/app/servicios/carrito.service.ts
import { Injectable } from '@angular/core';
import { Producto } from '../models/producto';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  // Productos hardcodeados
  productos: Producto[] = [
  { id: 1, nombre: 'Lienzo', precio: 250, descripcion: 'Lienzo de algodón 50x50', imagen: 'lienzo.jpg' },
  { id: 2, nombre: 'Pinceles', precio: 120, descripcion: 'Juego de pinceles', imagen: 'pinceles.jpg' },
  { id: 3, nombre: 'Acuarelas', precio: 300, descripcion: 'Set de acuarelas básicas', imagen: 'acuarelas.jpg' }
];


  agregar(producto: Producto) {
    this.productos.push(producto);
  }

  quitar(id: number) {
    this.productos = this.productos.filter(p => p.id !== id);
  }

  vaciar() {
    this.productos = [];
  }

  total(): number {
    return this.productos.reduce((sum, p) => sum + p.precio, 0);
  }

  exportarXML() {
    let xml = `<productos>\n`;
    this.productos.forEach(p => {
      xml += `  <producto><id>${p.id}</id><nombre>${p.nombre}</nombre><precio>${p.precio}</precio></producto>\n`;
    });
    xml += `</productos>`;
    const blob = new Blob([xml], { type: 'application/xml' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'carrito.xml';
    link.click();
  }
}
