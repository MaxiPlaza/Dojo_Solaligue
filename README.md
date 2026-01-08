# Sport Kombat Center - Web Platform

## Descripción
Plataforma web integral para el dojo de artes marciales Sport Kombat Center. Incluye sitio web informativo público, sistema de gestión de usuarios, y plataforma educativa.

## Tecnologías
- **Frontend**: React, Vite, CSS Vanilla (Diseño Premium), React Router DOM.
- **Backend**: Node.js, Express.
- **Base de Datos**: SQLite (Better-SQLite3).
- **Autenticación**: JWT.

## Secciones Nuevas
- **Galería Multimedia**: Sección con videos y fotos de los entrenamientos.
- **Testimonios**: Experiencias reales de alumnos.
- **Horarios**: Tabla detallada por sede, con sección destacada para Karate Okinawense.

## Funcionalidades
1. **Pública**: 
   - Landing Page con estética moderna.
   - Información de Modalidades y Planes.
   - Contacto y Ubicación.
2. **Plataforma Educativa**:
   - **Login/Registro**: Diferenciación de roles (Alumno, Coach, Admin). Los alumnos inician con un Plan Gratuito.
   - **Alumno**: Acceso a PDFs, Videos, Mentoría personalizada.
   - **Coach**: Gestión de alumnos, carga de contenido, envío de mensajes.
   - **Admin**: Control total de dojos, modalidades y usuarios. Gestión de coaches y feedbacks.

## Scripts
- `npm run dev`: Inicia el servidor de desarrollo frontend.
- `node server/index.js`: Inicia el servidor backend.
