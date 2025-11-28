import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-recuperar-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './recuperar-password.component.html',
  styleUrls: ['./recuperar-password.component.css']
})
export class RecuperarPasswordComponent {
  paso = 1;
  correo: string = '';
  nombreBD: string = '';
  nombreConfirm: string = ''; 
  passwordNueva: string = '';
  mensaje: string | null = null;
  error: string | null = null;
  cargando = false;

  constructor(private auth: AuthService, private router: Router) {}

  verificarCorreo() {
    this.error = null;
    this.mensaje = null;
    if (!this.correo) {
      this.error = 'Ingresa un correo';
      return;
    }
    this.cargando = true;
    this.auth.verifyIdentity(this.correo).subscribe({
      next: (res) => {
        this.cargando = false;
        this.nombreBD = res?.nombre || '';
        this.paso = 2; 
        this.mensaje = `Hola, para confirmar tu identidad, ¿cuál es tu nombre?`;
      },
      error: (err) => {
        this.cargando = false;
        this.error = err?.error?.message || 'Correo no encontrado';
      }
    });
  }

  resetPassword() {
    this.error = null;
    this.mensaje = null;
    if (!this.nombreConfirm) {
      this.error = 'Ingresa tu nombre';
      return;
    }
    if (!this.passwordNueva) {
      this.error = 'Ingresa una contraseña nueva';
      return;
    }
    this.cargando = true;
    this.auth.resetPasswordDirect(this.correo, this.nombreConfirm, this.passwordNueva).subscribe({
      next: () => {
        this.cargando = false;
        this.mensaje = 'Contraseña actualizada correctamente. Redirigiendo a login...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.cargando = false;
        this.error = err?.error?.message || 'Error al actualizar contraseña';
      }
    });
  }

  volver() {
    this.router.navigate(['/login']);
  }
}
