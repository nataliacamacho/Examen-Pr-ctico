import { Component } from '@angular/core';
import { AuthService } from '../../servicios/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CarritoService } from '../../servicios/carrito.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {

  correo: string = "";
  password: string = "";
  mensaje: string = "";

  constructor(private auth: AuthService, private router: Router) {}

  login() {
  if (!this.correo || !this.password) {
    this.mensaje = "Por favor completa todos los campos";
    return;
  }

  this.auth.login({ correo: this.correo, password: this.password }).subscribe({
  next: (res: any) => {
    if (res.usuario) {
      console.log('Login exitoso:', res.usuario);
      if (res.usuario.rol === 'admin' || res.usuario.rol === 'administrador') {
        this.router.navigate(['/admin/productos']); 
      } else {
        this.router.navigate(['/catalogo']); 
      }
    } else {
      this.mensaje = "Credenciales incorrectas";
    }
  },
  error: err => {
    this.mensaje = err?.error?.message || "Usuario o contraseña incorrecta";
  }
});

}
}

