# API + frontend — Clínica Veterinaria Huellitas

Servicio web de autenticación con una interfaz adaptable para escritorio y móvil. Permite crear cuentas de personal, iniciar sesión y emitir tokens JWT. Las contraseñas se almacenan como hash bcrypt.

## Requisitos e instalación

Node.js 20 o superior y npm. En esta carpeta ejecuta:

```bash
npm install
```

Copia `.env.example` como `.env` y cambia `JWT_SECRET` por un secreto privado de al menos 32 caracteres. En PowerShell puedes ejecutar:

```powershell
Copy-Item .env.example .env
```

Edita `.env` y luego inicia el servicio:

```bash
npm run dev
```

Abre **http://localhost:3000** para ver el sitio. La base SQLite se crea automáticamente en `data/veterinaria.db`.

## Pruebas desde Postman

Para las peticiones JSON usa `Content-Type: application/json`.

### Registrar usuario

`POST http://localhost:3000/api/auth/registro` — Body > raw > JSON:

```json
{
  "nombre": "Ana Pérez",
  "correo": "ana@huellitas.com",
  "contraseña": "ClaveSegura123"
}
```

Esperado: HTTP `201` y `Registro satisfactorio.`. Un correo repetido da `409`.

### Iniciar sesión

`POST http://localhost:3000/api/auth/login`:

```json
{
  "correo": "ana@huellitas.com",
  "contraseña": "ClaveSegura123"
}
```

Esperado: HTTP `200`, `Autenticación satisfactoria.` y un JWT.

### Credenciales incorrectas

Envía una contraseña incorrecta a la ruta de login. Esperado: HTTP `401` y `Error en la autenticación.`.

### Validar token

`GET http://localhost:3000/api/auth/perfil`. En Authorization selecciona **Bearer Token** y pega el JWT de login. Responde `200` si el token es válido y `401` en caso contrario.

## Rutas

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/` | Interfaz web y estado del servicio |
| POST | `/api/auth/registro` | Crear una cuenta |
| POST | `/api/auth/login` | Validar credenciales y emitir token |
| GET | `/api/auth/perfil` | Comprobar el token JWT |

La colección lista para importar en Postman está en `postman_collection.json`.

## Versionamiento con Git

El proyecto está versionado con Git. Para guardar la versión del frontend:

```bash
git add .
git commit -m "Agrega frontend web para acceso veterinario"
```

`.env`, dependencias instaladas y la base de datos local están excluidos por `.gitignore`.
