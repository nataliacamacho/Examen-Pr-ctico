import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = 'http://localhost:4000/api/catalogo';

  constructor(private http: HttpClient) {}

  obtenerProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/productos`);
  }
}


/*export class ProductoService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  async getProductos(): Promise<Producto[]> {
    if (!isPlatformBrowser(this.platformId)) {
      // Evita ejecutar DOMParser en Node
      return [];
    }

    try {
      const response = await fetch('assets/productos.xml');
      const xmlText = await response.text();

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
      const productos: Producto[] = [];

      const productosNodes = xmlDoc.getElementsByTagName('producto');
      for (let i = 0; i < productosNodes.length; i++) {
        const nodo = productosNodes[i];
        productos.push({
          id: Number(nodo.getElementsByTagName('id')[0].textContent),
          nombre: nodo.getElementsByTagName('nombre')[0].textContent || '',
          descripcion: nodo.getElementsByTagName('descripcion')[0].textContent || '',
          precio: Number(nodo.getElementsByTagName('precio')[0].textContent),
          imagen: nodo.getElementsByTagName('imagen')[0].textContent || ''
        });
      }

      return productos;
    } catch (error) {
      console.error('Error cargando XML:', error);
      return [];
    }
  }
}*/
