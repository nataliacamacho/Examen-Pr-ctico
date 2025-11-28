export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number | string;
  imagen?: string;
  stock: number;
  cantidad?: number;
  estado?: 'activo' | 'inactivo';
  vigencia_id?: number;
}