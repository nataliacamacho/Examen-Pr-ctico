import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing-module';
  import { ProductosAdminComponent } from './productos-admin/productos-admin.component';
import { LoginAdminComponent } from './login-admin/login-admin.component';

@NgModule({
     declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    AdminRoutingModule,
    LoginAdminComponent,
    ProductosAdminComponent
  ],
  exports: [
    ProductosAdminComponent
  ]
})
export class AdminModule { }
