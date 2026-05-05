# Reporte Técnico: Proyecto Nexus Gastro 📊

Este documento proporciona un análisis exhaustivo de la arquitectura, tecnología y funcionalidades del ecosistema **Nexus Gastro**, un ERP multi-tenant diseñado para la gestión integral de negocios de comida.

---

## 🏗️ 1. Arquitectura del Sistema

El proyecto sigue una arquitectura de aplicaciones desacopladas (Frontend y Backend) con un esquema de base de datos relacional robusto.

### **Backend (NestJS)**
- **Estructura Modular**: Cada dominio (Órdenes, Inventario, Recetas) está encapsulado en su propio módulo, facilitando la escalabilidad.
- **Seguridad en Capas**: 
  - **JWT**: Gestión de sesiones seguras.
  - **TenantGuard**: Filtro global que garantiza que un restaurante no pueda acceder a los datos de otro.
  - **RolesGuard**: Control de acceso basado en roles (`ADMIN`, `KITCHEN`, `WAITER`, etc.).
- **ORM (Prisma)**: Provee una capa de abstracción sobre PostgreSQL que asegura que las consultas sean eficientes y con tipado fuerte.

### **Frontend (Next.js)**
- **App Router**: Utiliza las últimas convenciones de Next.js para mejorar el rendimiento y SEO.
- **Rutas Protegidas**: División clara entre áreas públicas (Menú digital) y administrativas (Dashboard).
- **Diseño Premium**: Implementación con Tailwind CSS enfocada en la experiencia de usuario (UX).

---

## 🗄️ 2. Modelo de Datos (Base de Datos)

El corazón de Nexus Gastro reside en su esquema de PostgreSQL, diseñado para manejar la complejidad operativa de la gastronomía:

| Entidad | Propósito |
| :--- | :--- |
| **Tenant** | Representa al restaurante o negocio raíz. |
| **RawMaterial** | Gestión de materias primas con control de stock mínimo y costos variables. |
| **Recipe** | Definición técnica de los platos, desglosando ingredientes y mermas. |
| **MenuItem** | El producto final ofrecido al cliente, vinculado a una receta y categoría. |
| **Order** | Gestión del ciclo de vida de un pedido (Pendiente -> Cocina -> Listo -> Entregado). |
| **Currency** | Soporta operaciones multi-moneda (BS, USD, EUR) con tasas de cambio dinámicas. |
| **InventoryTransaction** | Auditoría de cada movimiento de stock (Compra, Venta, Ajuste). |

---

## 🔄 3. Flujos de Trabajo Principales

### **Gestión de Inventario e Inteligencia de Costos**
El sistema no solo registra lo que entra y sale, sino que calcula automáticamente el costo de producción de cada plato basado en las fluctuaciones de precios de las materias primas.

### **Órdenes Multicanal**
Soporta pedidos para **Comer en el sitio**, **Delivery** y **Para llevar**, integrando un flujo de estados que notifica a la cocina y al personal de despacho.

### **Menú Digital Público**
Los clientes pueden acceder a una versión pública del menú para ver precios actualizados según la moneda configurada por el restaurante.

---

## 🛠️ 4. Configuración Técnica

Para poner en marcha el proyecto, se siguen estos pasos críticos:
1. **Sincronización de Prisma**: `npx prisma migrate dev` para actualizar el esquema de base de datos.
2. **Carga de Datos Iniciales (Seed)**: `npx prisma db seed` para pre-configurar roles, monedas base y ejemplos.

---

## 🎯 Conclusión
**Nexus Gastro** es una solución empresarial madura que prioriza la integridad de los datos a través de su sistema de multi-tenencia y ofrece herramientas de control financiero avanzado mediante la gestión de recetas y costos en tiempo real.
