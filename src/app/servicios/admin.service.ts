import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout, catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:3000/api/admin';
  productosSignal = signal<any[]>([]);

  constructor(private http: HttpClient) { }

  getProductos(): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}/productos`).pipe(
      tap(productos => this.productosSignal.set(productos))
    );
  }

  agregarProducto(producto: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/productos`, producto);
  }

  getProductoById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/productos/${id}`);
  }

  modificarProducto(id: number, producto: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/productos/${id}`, producto).pipe(
      timeout(6000),
      tap(res => {
        const productosActuales = this.productosSignal();
        const index = productosActuales.findIndex(p => p.id === id);
        if (index !== -1 && res.producto) {
          const productosActualizados = [...productosActuales];
          productosActualizados[index] = res.producto;
          this.productosSignal.set(productosActualizados);
        }
      }),
      catchError(err => {
        console.error('Error o timeout en modificarProducto:', err);
        return throwError(() => err);
      })
    );
  }

  cambiarVigencia(id: number, estado: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/productos/${id}/vigencia`, { estado });
  }
}
