import { Component } from '@angular/core';
import { AuthService } from '../../servicios/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  nombre = '';
  correo = '';
  password = '';
  pregunta = '¿Cuál es tu color favorito?';
  respuesta = '';
  mensaje = '';
  preguntasList: string[] = [];

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.preguntasList = this.auth.getSecurityQuestions();
    if (!this.pregunta && this.preguntasList.length) this.pregunta = this.preguntasList[0];
  }

  registrar() {
    if (!this.nombre || !this.correo || !this.password) {
      this.mensaje = "Por favor completa Nombre, Correo y Contraseña";
      return;
    }

    if (!this.respuesta) {
      this.mensaje = 'Por favor responde la pregunta de seguridad seleccionada';
      return;
    }

    const data: any = { nombre: this.nombre, correo: this.correo, password: this.password, pregunta: this.pregunta, respuesta: this.respuesta };

    this.auth.register(data).subscribe({
      next: () => {
        setTimeout(() => this.router.navigate(['/login']), 500);
      },
      error: err => this.mensaje = err?.error?.message || "Ocurrió un error al registrar"
    });
  }
}
