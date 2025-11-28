import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private platformId = inject(PLATFORM_ID);
  usuarioSignal = signal<any>(this.cargarUsuarioDelStorage());

  readonly securityQuestions: string[] = [
    '¿Cuál es tu color favorito?',
    '¿Cómo se llamaba tu primera mascota?',
    '¿En qué ciudad naciste?',
    '¿Cuál es el nombre de tu madre?',
    '¿Cuál es tu comida favorita?'
  ];

  getSecurityQuestions(): string[] {
    return [...this.securityQuestions];
  }

  constructor(private http: HttpClient) {}

  private cargarUsuarioDelStorage(): any {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    try {
      const usuario = localStorage.getItem('usuario');
      return usuario ? JSON.parse(usuario) : null;
    } catch (e) {
      console.error('Error al cargar usuario del storage:', e);
      return null;
    }
  }

  register(data: { nombre: string, correo: string, password: string, pregunta?: string, respuesta?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  login(data: { correo: string, password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, data)
      .pipe(
        tap(res => {
          if (res.usuario && isPlatformBrowser(this.platformId)) {
            try {
              localStorage.setItem('usuario', JSON.stringify(res.usuario));
            } catch (e) {
              console.error('Error al guardar usuario en storage:', e);
            }
            this.usuarioSignal.set(res.usuario);
          }
        })
      );
  }

  getUsuario(): any {
    return this.usuarioSignal();
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.removeItem('usuario');
      } catch (e) {
        console.error('Error al remover usuario del storage:', e);
      }
    }
    this.usuarioSignal.set(null);
  }

  recoverPassword(data: { correo: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/recover`, data);
  }

  resetPassword(data: { token: string, nuevaPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, data);
  }

  updateProfile(data: { id: number, nombre?: string, correo?: string, domicilio?: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/profile`, data).pipe(
      timeout(6000),
      catchError(err => {
        console.error('Error o timeout en updateProfile:', err);
        return throwError(() => err);
      }),
      tap(res => {
        if (res.usuario && isPlatformBrowser(this.platformId)) {
          try {
            localStorage.setItem('usuario', JSON.stringify(res.usuario));
          } catch (e) {
            console.error('Error al guardar usuario en storage:', e);
          }
          this.usuarioSignal.set(res.usuario);
        }
      })
    );
  }

  getProfile(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/profile/${id}`);
  }

  verifyIdentity(correo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-identity`, { correo });
  }

  resetPasswordDirect(correo: string, nombre: string | null, password: string, pregunta?: string, respuesta?: string): Observable<any> {
    const payload: any = { correo, password };
    if (nombre) payload.nombre = nombre;
    if (pregunta) payload.pregunta = pregunta;
    if (respuesta) payload.respuesta = respuesta;
    return this.http.post(`${this.apiUrl}/reset-password-direct`, payload);
  }
}
