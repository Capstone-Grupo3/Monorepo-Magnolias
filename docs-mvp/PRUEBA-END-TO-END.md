# 🎯 PRUEBA END-TO-END: INTEGRACIÓN N8N - BACKEND

## ✅ **Estado Actual**

Todos los componentes están listos:
- ✅ **n8n**: Corriendo y respondiendo en puerto 5678
- ✅ **Backend**: Corriendo en puerto 3000 con integración n8n
- ✅ **Webhook**: Endpoint `/webhook/analizar-postulacion` activo
- ✅ **Workflow**: 17 nodos creados manualmente

---

## ⚠️ **PASO CRÍTICO ANTES DE PROBAR**

### **1. Verificar que el workflow esté ACTIVO**

1. Abrir: http://localhost:5678/workflow/BeuCSLEaIhi3GRYU
2. En la esquina superior derecha, verificar que el **switch esté en VERDE** (Active)
3. Si está gris (Inactive), hacer clic para activarlo

### **2. Configurar Credenciales de OpenAI** 🔑

**IMPORTANTE:** Sin esto, el análisis fallará.

1. Ir a: http://localhost:5678/credentials
2. Verificar si existe una credencial llamada **"OpenAI API"** o similar
3. **Si NO existe:**
   - Hacer clic en **"Add Credential"**
   - Buscar **"OpenAI API"**
   - Pegar tu **API Key de OpenAI** (ejemplo: `sk-...`)
   - Hacer clic en **"Save"**

### **3. Vincular la Credencial al Nodo OpenAI**

1. Abrir el workflow: http://localhost:5678/workflow/BeuCSLEaIhi3GRYU
2. Hacer clic en el nodo **"🤖 Analizar con OpenAI"**
3. En el campo **"Credential to connect with"**:
   - Si dice "Select Credential..." → Seleccionar la credencial de OpenAI creada
   - Si ya tiene una seleccionada → Verificar que sea la correcta
4. Verificar que el **Model** sea: `gpt-4o-mini`
5. **Guardar el workflow** (Ctrl+S o botón Save)

---

## 🚀 **FLUJO DE PRUEBA COMPLETO**

### **Paso 1: Obtener Token JWT de Candidato**

Ejecutar:
```powershell
cd n8n-workflows
.\GET-TOKEN.ps1
```

Te pedirá:
- Email del candidato (ejemplo: `candidato@test.com`)
- Password del candidato

**Output esperado:**
```
====================================================
TOKEN JWT (copia esto):
====================================================
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Candidato:
  - ID: 1
  - Nombre: Juan Perez
  - Email: candidato@test.com
```

**Copiar el token JWT** para usarlo en el siguiente paso.

---

### **Paso 2: Crear Postulación de Prueba**

Ejecutar:
```powershell
.\CREAR-POSTULACION.ps1
```

Te pedirá:
- Token JWT (pegar el token del paso anterior)
- ID de la vacante (ejemplo: `1`)

**Lo que sucederá:**

1. **Backend crea la postulación** en la base de datos
2. **Backend llama al webhook** de n8n: `POST http://localhost:5678/webhook/analizar-postulacion`
3. **n8n ejecuta el workflow** (17 nodos):
   - Obtiene datos de postulación, vacante y candidato
   - Prepara datos para análisis
   - Verifica si hay CV
   - Extrae texto del CV (simulado)
   - Combina todos los datos
   - **Llama a OpenAI GPT-4o-mini** para análisis
   - Procesa la respuesta de IA
   - **Actualiza la postulación** con scores y feedback
   - Responde al webhook con el resultado
4. **Script verifica** si la postulación fue actualizada con IA

---

## 📊 **Resultados Esperados**

### **✅ Si todo funciona correctamente:**

```
=====================================================
   ANALISIS COMPLETADO EXITOSAMENTE
=====================================================

RESULTADOS DEL ANALISIS:
  - Score Final: 78/100
  - Estado: EVALUADO

FEEDBACK DE IA:
=== ANÁLISIS DE POSTULACIÓN ===

SCORE FINAL: 78/100
• Compatibilidad: 82/100
• Veracidad: 72/100

RECOMENDACIÓN: RECOMENDAR

--- FORTALEZAS ---
1. Experiencia solida en React y Node.js
2. Liderazgo de equipos demostrado
3. Conocimientos tecnicos completos

--- DEBILIDADES ---
1. No menciona experiencia con testing
2. Falta informacion sobre proyectos especificos

--- ANÁLISIS DETALLADO ---
El candidato presenta un perfil interesante...
```

### **⚠️ Si hay problemas:**

El script te dirá qué revisar:

**Problema 1: "Postulación creada pero AUN NO se actualizó con IA"**
- Causa: Workflow tardando más de 8 segundos o falló
- Solución: Revisar ejecuciones en n8n

**Problema 2: "Token inválido o expirado"**
- Causa: Token JWT expiró (duran 1 hora)
- Solución: Ejecutar `GET-TOKEN.ps1` nuevamente

**Problema 3: "Vacante no encontrada"**
- Causa: ID de vacante no existe
- Solución: Verificar IDs en la base de datos

---

## 🔍 **Verificar Resultados en n8n**

### **Ver ejecuciones del workflow:**

1. Abrir: http://localhost:5678/workflow/BeuCSLEaIhi3GRYU/executions
2. Buscar la última ejecución
3. **Si está en verde (✓)**: Todo funcionó correctamente
4. **Si está en rojo (✗)**: Hacer clic para ver qué nodo falló

### **Errores comunes y soluciones:**

| Error | Nodo | Causa | Solución |
|-------|------|-------|----------|
| **401 Unauthorized** | OpenAI | API Key inválida | Verificar credencial de OpenAI |
| **404 Not Found** | HTTP Request | URL incorrecta | Verificar que backend esté en `apt-backend:3000` o `localhost:3000` |
| **Timeout** | OpenAI | Análisis tardó >30s | Normal, reintentar |
| **JSON Parse Error** | Procesar Resultado | OpenAI no devolvió JSON | Verificar system prompt |

---

## 📝 **Verificar en Base de Datos**

Conectar a Supabase o PostgreSQL y ejecutar:

```sql
SELECT 
    id,
    estado,
    puntajeIa,
    LENGTH(feedbackIa) as feedback_length,
    createdAt,
    updatedAt
FROM postulacion
ORDER BY id DESC
LIMIT 1;
```

**Resultado esperado:**
- `estado`: "EVALUADO" o "EN_REVISION"
- `puntajeIa`: Número entre 0-100
- `feedbackIa`: Texto largo (>500 caracteres)
- `updatedAt`: Posterior a `createdAt` (indica que fue actualizado)

---

## 🛠️ **Troubleshooting**

### **Backend no llama al webhook:**

Verificar logs del backend, deberías ver:

```
🔔 Triggereando workflow n8n para postulación ID: 123
📡 Webhook URL: http://localhost:5678/webhook/analizar-postulacion
✅ Workflow n8n ejecutado exitosamente
📊 Score final: 78
💡 Recomendación: RECOMENDAR
```

Si no ves estos logs:
1. Reiniciar backend: `npm run start:dev`
2. Verificar que `.env` tenga `N8N_WEBHOOK_URL`
3. Crear postulación nuevamente

### **n8n no ejecuta el workflow:**

1. Verificar que el workflow esté **ACTIVO** (switch verde)
2. Verificar que el path del webhook sea exactamente: `analizar-postulacion`
3. Probar manualmente el webhook:
   ```powershell
   $body = @{ postulacionId = 1 } | ConvertTo-Json
   Invoke-RestMethod -Uri "http://localhost:5678/webhook/analizar-postulacion" -Method Post -Body $body -ContentType "application/json"
   ```

### **OpenAI falla:**

1. Verificar saldo de la API Key en https://platform.openai.com/usage
2. Verificar que la credencial esté correctamente configurada
3. Verificar que el nodo OpenAI use `gpt-4o-mini` (más barato y rápido)

---

## 📚 **Documentación Adicional**

- **Integración completa**: `backend/INTEGRACION-N8N.md`
- **Guía de workflow**: `n8n-workflows/GUIA-COMPLETAR-WORKFLOW-MANUAL.md`
- **Resumen ejecutivo**: `RESUMEN-INTEGRACION.md`

---

## 🎉 **¡Éxito!**

Una vez que veas el mensaje:

```
=====================================================
   ANALISIS COMPLETADO EXITOSAMENTE
=====================================================
```

¡La integración está funcionando al 100%! 🚀

Ahora cada postulación que se cree desde el frontend será automáticamente analizada por IA y actualizada con scores y feedback.
