import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-editar-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './editar-perfil.component.html',
  styleUrls: ['./editar-perfil.component.css']
})
export class EditarPerfilComponent implements OnInit {
  id!: number;
  nombre: string = '';
  correo: string = '';
  domicilio: string = '';
  mensaje: string | null = null;
  error: string | null = null;
  cargando = false;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    const usuario = this.auth.getUsuario();
    if (!usuario) {
      this.router.navigate(['/login']);
      return;
    }
    this.id = usuario.id;
    this.nombre = usuario.nombre || '';
    this.correo = usuario.correo || '';
    this.domicilio = usuario.domicilio || '';
  }

  guardar() {
    this.error = null;
    this.mensaje = null;

    if (!this.nombre.trim() || !this.correo.trim()) {
      this.error = 'Nombre y correo son requeridos';
      return;
    }

    const payload: any = { id: this.id };
    payload.nombre = this.nombre;
    payload.correo = this.correo;
    if (this.domicilio) payload.domicilio = this.domicilio;

    this.cargando = true;
    this.auth.updateProfile(payload).subscribe({
      next: (res) => {
        this.cargando = false;
        this.mensaje = 'Perfil actualizado';
      },
      error: (err) => {
        this.cargando = false;
        this.error = err?.error?.message || 'Error al guardar';
      }
    });
  }

  volver() {
    this.router.navigate(['/']);
  }
}
