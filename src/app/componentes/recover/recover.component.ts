import { Component } from '@angular/core';
import { AuthService } from '../../servicios/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-recover',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './recover.component.html'
})
export class RecoverComponent {
  correo = '';
  mensaje = '';

  constructor(private auth: AuthService) {}

  recuperar() {
  if (!this.correo) { 
    this.mensaje = "Por favor ingresa tu correo"; 
    return; 
  }

  this.auth.recoverPassword({ correo: this.correo }).subscribe({
    next: (res: any) => { 
      this.mensaje = `${res?.message}. Token: ${res?.token}`; 
      this.correo = ''; 
    },
    error: err => { 
      this.mensaje = err?.error?.message || "rror al enviar correo"; 
    }
  });
  }
}
