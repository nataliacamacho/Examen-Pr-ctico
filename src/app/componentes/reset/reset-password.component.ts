import { Component } from '@angular/core';
import { AuthService } from '../../servicios/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent {
  token: string = "";
  nuevaPassword: string = "";
  mensaje: string = "";

  constructor(
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || "";
    });
  }

  resetear() {
    if (!this.nuevaPassword) {
      this.mensaje = "Ingresa una nueva contraseña";
      return;
    }

    this.mensaje = "Actualizando contraseña...";

    this.auth.resetPassword({ token: this.token, nuevaPassword: this.nuevaPassword }).subscribe({
      next: () => {
        this.mensaje = "Contraseña actualizada correctamente";
        this.nuevaPassword = "";
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: err => {
        this.mensaje = err?.error?.message || "Error al actualizar contraseña";
      }
    });
  }
}
