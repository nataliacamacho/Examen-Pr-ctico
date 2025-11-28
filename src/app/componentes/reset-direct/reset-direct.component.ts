import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-reset-direct',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-direct.component.html',
  styleUrls: ['./reset-direct.component.css']
})
export class ResetDirectComponent implements OnInit {
  correo = '';
  nombre = '';
  pregunta = '';
  respuesta = '';
  password = '';
  confirm = '';
  error: string | null = null;
  success: string | null = null;
  loading = false;
  lookupInProgress = false;
  lookupDone = false;
  serverPregunta: string | null = null;
  serverNombreHint: string | null = null;

  constructor(private auth: AuthService, private router: Router, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
  }

  buscarIdentidad() {
    this.error = null;
    this.success = null;
    if (!this.correo) {
      this.error = 'Introduce el correo para continuar';
      return;
    }
    console.log('[reset-direct] buscarIdentidad called for', this.correo);
    this.lookupInProgress = true;

    this.auth.verifyIdentity(this.correo.trim()).subscribe({
      next: (res: any) => {
        console.log('[reset-direct] verifyIdentity success', res);
        this.lookupInProgress = false;
        this.lookupDone = true;
        this.serverPregunta = res?.pregunta || null;
        this.serverNombreHint = res?.nombre || null;
        console.log('[reset-direct] UI updated - pregunta:', this.serverPregunta, 'nombre:', this.serverNombreHint);
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('[reset-direct] verifyIdentity error', err);
        this.lookupInProgress = false;
        this.lookupDone = false;
        this.error = err?.error?.message || err?.message || 'No se encontró el usuario';
        this.cd.detectChanges();
      }
    });
  }

  submit() {
    this.error = null;
    this.success = null;
    if (!this.correo || !this.password || !this.confirm) {
      this.error = 'Correo y la nueva contraseña son obligatorios';
      return;
    }
    if (this.password !== this.confirm) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }
    if (this.serverPregunta) {
      if (!this.respuesta) {
        this.error = 'Proporciona la respuesta de seguridad';
        return;
      }
      this.pregunta = this.serverPregunta;
    } else {
      if (!this.nombre) {
        this.error = 'Proporciona tu nombre para verificar identidad';
        return;
      }
    }

    this.loading = true;
    const nombreTrim = this.nombre ? this.nombre.trim() : null;
    const preguntaTrim: string | undefined = this.pregunta ? this.pregunta.trim() : undefined;
    const respuestaTrim: string | undefined = this.respuesta ? this.respuesta.trim() : undefined;

    console.log('[submit] sending reset request:', { correo: this.correo, pregunta: preguntaTrim, respuesta: respuestaTrim, nombre: nombreTrim });

    this.auth.resetPasswordDirect(this.correo.trim(), nombreTrim, this.password, preguntaTrim, respuestaTrim).subscribe({
      next: (res) => {
        console.log('[submit] success response:', res);
        this.loading = false;
        this.success = res?.message || 'Contraseña actualizada correctamente';
        this.cd.detectChanges();
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        console.error('[submit] error response:', err);
        this.loading = false;
        this.error = err?.error?.message || err?.message || 'Error al actualizar contraseña';
        this.cd.detectChanges();
      }
    });
  }
}
