# Guía de Despliegue - Sport Kombat Center

## Requisitos Previos
- Node.js instalado en el servidor (v18+).
- Acceso a terminal.

## Paso 1: Preparación del Servidor
1. Clona el repositorio o sube los archivos al servidor.
2. Navega a la carpeta del proyecto.

## Paso 2: Instalación de Dependencias
1. Instala dependencias del frontend:
   ```bash
   npm install
   ```
2. Instala dependencias del backend:
   ```bash
   cd server
   npm install
   cd ..
   ```

## Paso 3: Configuración de Entorno
1. Crea un archivo `.env` en la carpeta `server/` con:
   ```env
   PORT=3000
   JWT_SECRET=tu_clave_secreta_super_segura
   ```

## Paso 4: Construcción del Frontend
Para producción, Vite debe generar archivos estáticos:
```bash
npm run build
```
Esto creará una carpeta `dist/`.

## Paso 5: Ejecución
Recomendamos usar `pm2` para mantener el servidor activo.

1. **Backend**:
   ```bash
   cd server
   node index.js
   ```
   *Nota: Para que el backend sirva el frontend en producción, se recomienda configurar Nginx o ajustar `server/index.js` para servir la carpeta `../dist` en la ruta `/`.*

   **Ajuste Sugerido para index.js (si no hay Nginx):**
   ```javascript
   // Agregar al final de server/index.js antes de app.listen:
   app.use(express.static(path.join(__dirname, '../dist')));
   app.get('*', (req, res) => {
     res.sendFile(path.join(__dirname, '../dist/index.html'));
   });
   ```

2. **Verificación**:
   Accede a `http://tu-dominio.com` o `http://localhost:3000`.

## Base de Datos
La base de datos SQLite se crea automáticamente en `server/database.sqlite` al iniciar. Asegúrate de que la carpeta `server/` tenga permisos de escritura.
