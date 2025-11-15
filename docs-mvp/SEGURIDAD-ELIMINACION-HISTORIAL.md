# 🔒 Eliminación de Datos Sensibles del Historial de Git

## ✅ Acciones Completadas

### 1. Eliminación del Archivo del Historial
Se ha eliminado completamente el archivo `backend/src/seed-admin.ts` del historial de Git usando `git-filter-repo`.

**Commits afectados:**
- `8658092d5a0474f791b0cc89e5a8e42100b04cbd` - feat: Add admin dashboard components and services

**Resultado:**
```bash
✅ El archivo ya NO aparece en git log --all --full-history
✅ Historial reescrito exitosamente
✅ Push forzado a GitHub completado
```

### 2. Actualización del .gitignore
Se agregaron reglas para prevenir futuros commits de archivos seed con credenciales:

```gitignore
# Scripts de seeding con credenciales
**/seed-admin.*
**/seed-*.ts
**/seed-*.js
# Excepto ejemplos
!**/seed-*.example.*
```

### 3. Herramientas Utilizadas
1. **git filter-branch** (primer intento - parcialmente exitoso)
2. **git-filter-repo** (solución definitiva) - Herramienta recomendada por GitHub

---

## ⚠️ PASOS ADICIONALES REQUERIDOS

### 🚨 CRÍTICO: Contactar a GitHub Support

Aunque el archivo ha sido eliminado del historial de tu repositorio local y remoto, **GitHub mantiene copias en caché** de los commits antiguos por razones de seguridad.

**Debes hacer lo siguiente:**

1. **Contactar a GitHub Support** en: https://support.github.com/contact

2. **Usar esta plantilla de mensaje:**

```
Subject: Request to purge cached commits containing sensitive data

Hello GitHub Support,

I need to request the purging of cached commits from my repository that contain sensitive credentials.

Repository: https://github.com/Capstone-Grupo3/Monorepo-Magnolias
Commit SHA: 8658092d5a0474f791b0cc89e5a8e42100b04cbd
File path: backend/src/seed-admin.ts

I have already used git-filter-repo to rewrite the repository history and force-pushed the changes. The commit is no longer accessible through the main branch, but it may still be cached by GitHub.

The file contained sensitive administrator credentials (email and password) that should not be publicly accessible.

Could you please purge this commit from your cache?

Thank you for your assistance.
```

3. **Esperar confirmación** de GitHub Support (usualmente 24-48 horas)

---

## 🔐 Cambio Inmediato de Credenciales

Como las credenciales del administrador estuvieron expuestas públicamente, **DEBES cambiarlas inmediatamente**:

### Credenciales Expuestas (del commit eliminado):
- **Email:** admin@magnolias.com
- **Contraseña:** Admin123!

### Acciones Requeridas:

1. **Eliminar el usuario admin actual** de la base de datos (si existe):
```sql
DELETE FROM "Admin" WHERE correo = 'admin@magnolias.com';
```

2. **Crear un nuevo usuario admin** con credenciales diferentes y más seguras:
```bash
# Opción 1: Modificar seed-admin.ts localmente (NO COMMITEAR)
# Cambiar contraseña a algo como: SuperSecureP@ssw0rd2025!

# Opción 2: Crear admin directamente en la base de datos
```

3. **Usar variables de entorno** para las credenciales del admin inicial:
```typescript
// backend/src/seed-admin.ts (ejemplo - NO COMMITEAR)
const adminData = {
  nombre: 'Administrador',
  correo: process.env.ADMIN_EMAIL || 'admin@magnolias.com',
  contrasena: process.env.ADMIN_PASSWORD || 'cambiar-esto',
};
```

4. **Agregar al .env** (que ya está en .gitignore):
```env
ADMIN_EMAIL=nuevo-admin@magnolias.com
ADMIN_PASSWORD=SuperSecureP@ssw0rd2025!
```

---

## 📋 Verificación de Seguridad

### Verificar que el archivo no está accesible:

1. **Verificar localmente:**
```bash
git log --all --full-history -- backend/src/seed-admin.ts
# Debe retornar: (vacío)
```

2. **Verificar en GitHub:**
   - Ir a: https://github.com/Capstone-Grupo3/Monorepo-Magnolias/commit/8658092d5a0474f791b0cc89e5a8e42100b04cbd
   - **ANTES de contactar a GitHub:** El commit puede seguir siendo accesible
   - **DESPUÉS de que GitHub purgue el caché:** Debe mostrar 404 Not Found

3. **Verificar con GitHub API:**
```bash
curl -I https://api.github.com/repos/Capstone-Grupo3/Monorepo-Magnolias/commits/8658092d5a0474f791b0cc89e5a8e42100b04cbd
```

---

## 🛡️ Buenas Prácticas de Seguridad para el Futuro

### 1. **NUNCA commitear credenciales directamente**
- ❌ Contraseñas en código
- ❌ API keys en archivos
- ❌ Tokens de acceso hardcoded

### 2. **Usar variables de entorno**
```typescript
// ✅ CORRECTO
const password = process.env.ADMIN_PASSWORD;

// ❌ INCORRECTO
const password = 'Admin123!';
```

### 3. **Usar archivos .example para plantillas**
```bash
# Commitear
.env.example      # ✅ Con valores placeholder
seed-admin.example.ts  # ✅ Con valores placeholder

# NO commitear
.env              # ❌ Con valores reales
seed-admin.ts     # ❌ Con valores reales
```

### 4. **Pre-commit hooks** para detectar secretos
Instalar `git-secrets` o `truffleHog`:
```bash
npm install --save-dev @commitlint/cli husky
```

### 5. **Revisión de código** antes de push
- Revisar con `git diff --staged`
- Usar GitHub Desktop o VSCode para ver cambios visuales
- Verificar que no hay .env o archivos sensibles

---

## 📞 Soporte y Referencias

### Documentación Oficial:
- [GitHub: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [git-filter-repo](https://github.com/newren/git-filter-repo)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)

### Herramientas de Detección:
- [GitGuardian](https://www.gitguardian.com/)
- [TruffleHog](https://github.com/trufflesecurity/trufflehog)
- [git-secrets](https://github.com/awslabs/git-secrets)

---

## ✅ Checklist Final

- [x] Archivo eliminado del historial local con git-filter-repo
- [x] Force push exitoso a GitHub
- [x] .gitignore actualizado para prevenir futuros commits
- [ ] **PENDIENTE:** Contactar a GitHub Support para purgar caché
- [ ] **PENDIENTE:** Cambiar credenciales del administrador
- [ ] **PENDIENTE:** Verificar que el commit da 404 en GitHub
- [ ] **PENDIENTE:** Implementar variables de entorno para seed scripts
- [ ] **PENDIENTE:** Notificar al equipo sobre las nuevas credenciales

---

**Fecha de eliminación:** 15 de noviembre de 2025  
**Ejecutado por:** Sebitax  
**Herramienta:** git-filter-repo + git filter-branch  
**Estado:** ✅ Eliminado localmente | ⏳ Pendiente purga de GitHub caché
