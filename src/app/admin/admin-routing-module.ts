import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductosAdminComponent } from './productos-admin/productos-admin.component';
import { EditarProductoComponent } from './productos/editar-producto/editar-producto.component';
import { AdminGuard } from '../guards/admin.guard';

const routes: Routes = [
  { path: 'productos', component: ProductosAdminComponent, canActivate: [AdminGuard] },
  { path: 'productos/:id/editar', component: EditarProductoComponent, canActivate: [AdminGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
