export interface IUsuario {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  rol: string;
  role?: string; // Alias del backend, normalizado a 'rol' en el login
}

export interface IProducto {
  id: number;
  sku: string;
  nombre: string;
  descripcion_corta: string;
  descripcion_larga?: string;
  precio_venta: number;
  precio_costo?: number;
  precio_oferta?: number;
  stock_minimo: number;
  categoria_id: number;
  marca_id: number;
  unidad_medida_id: number;
  imagen_principal?: string;
  activo: boolean;
  categoria?: ICategoria;
  marca?: IMarca;
  stock?: {
    stock_fisico: number;
    stock_reservado: number;
    stock_disponible: number;
  };
}

export interface ICategoria {
  id: number;
  nombre: string;
  slug: string;
  padre_id?: number;
}

export interface IMarca {
  id: number;
  nombre: string;
  activo: boolean;
}

export interface IUnidadMedida {
  id: number;
  nombre: string;
  abreviatura: string;
}

export interface IItemCarrito {
  id: number;
  producto_id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen?: string;
  variante?: any;
}

export interface IOrden {
  id: number;
  codigo: string;
  cliente_id: number;
  estado_id: number;
  total: number;
  fecha_orden: string;
  items?: IItemOrden[];
}

export interface IItemOrden {
  id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface ICliente extends IUsuario {
  telefono?: string;
  direcciones?: IDireccion[];
}

export interface IDireccion {
  id: number;
  direccion: string;
  ciudad: string;
  departamento: string;
  codigo_postal: string;
  es_principal: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
}
