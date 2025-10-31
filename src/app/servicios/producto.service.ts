import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/producto';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = 'http://localhost:3000/api/productos';

  constructor(private http: HttpClient) {}

  obtenerProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl);
  }

  actualizarStock(idProducto: number, cantidadComprada: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/actualizar-stock`, {
      idProducto,
      cantidadComprada
    });
  }
}

