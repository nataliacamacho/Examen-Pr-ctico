import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-login-admin',
  templateUrl: './login-admin.component.html'
})
export class LoginAdminComponent {
  correo = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.authService.login({ correo: this.correo, password: this.password }).subscribe({
      next: (res) => {
        if (res.usuario && res.usuario.rol === 'admin') {
          this.router.navigate(['/admin/productos']);
        } else {
          alert('No tienes permisos de administrador');
        }
      },
      error: () => alert('Usuario o contraseña incorrectos')
    });
  }
}
