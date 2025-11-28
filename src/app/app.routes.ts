import { Routes } from '@angular/router';
import { CatalogoComponent } from './componentes/catalogo/catalogo.component';
import { CarritoComponent } from './componentes/carrito/carrito.component';
import { LoginComponent } from './componentes/login/login.component';
import { RegisterComponent } from './componentes/register/register.component';
import { RecoverComponent } from './componentes/recover/recover.component';
import { ResetPasswordComponent } from './componentes/reset/reset-password.component';
import { RecuperarPasswordComponent } from './componentes/recuperar-password/recuperar-password.component';
import { ResetDirectComponent } from './componentes/reset-direct/reset-direct.component';

import { EditarPerfilComponent } from './componentes/editar-perfil/editar-perfil.component';

export const routes: Routes = [
  { path: '', component: CatalogoComponent },
  { path: 'catalogo', component: CatalogoComponent },
  { path: 'carrito', component: CarritoComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'recover', component: ResetDirectComponent },
  { path: 'reset-password/:token', component: ResetPasswordComponent },
  { path: 'perfil', component: EditarPerfilComponent },
  { path: 'recuperar-password', component: RecuperarPasswordComponent },
  { path: 'reset-direct', component: ResetDirectComponent },


  // ADMIN: carga módulo completo
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin-module').then(m => m.AdminModule)
  },

  // fallback
  { path: '**', redirectTo: '' }
];

