import { CatalogoComponent } from './componentes/catalogo/catalogo.component';
import { CarritoComponent } from './componentes/carrito/carrito.component';

export const routes = [
  {
    path: '',
    component: CatalogoComponent,
    runGuardsAndResolvers: 'always' as const // 🔹 solución al error de tipo
  },
  { path: 'carrito', component: CarritoComponent }
];
