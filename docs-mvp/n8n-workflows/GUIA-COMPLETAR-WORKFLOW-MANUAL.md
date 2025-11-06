# ========================================================================
# GUÍA RÁPIDA: COMPLETAR EL WORKFLOW MANUALMENTE EN N8N
# ========================================================================
# Si prefieres no usar la API, aquí está la guía paso a paso
# ========================================================================

## 🎯 WORKFLOW ACTUAL
✅ Ya creado: "APT - Análisis Completo CV + Respuestas"
✅ Webhook configurado: POST /webhook/analizar-postulacion
📍 URL del workflow: http://localhost:5678/workflow/BeuCSLEaIhi3GRYU

## 📝 NODOS QUE FALTAN POR AGREGAR (16 nodos)

### 1️⃣ NODO: HTTP Request - "Obtener Postulación"
**Tipo:** HTTP Request
**Configuración:**
- Method: GET
- URL: `http://apt-backend:3000/postulaciones/{{ $json.body.postulacionId }}`
- Authentication: None
- Conectar desde: Webhook

### 2️⃣ NODO: HTTP Request - "Obtener Vacante"  
**Tipo:** HTTP Request
**Configuración:**
- Method: GET
- URL: `http://apt-backend:3000/vacantes/{{ $('Obtener Postulación').item.json.idVacante }}`
- Authentication: None
- Conectar desde: Obtener Postulación

### 3️⃣ NODO: HTTP Request - "Obtener Candidato"
**Tipo:** HTTP Request
**Configuración:**
- Method: GET
- URL: `http://apt-backend:3000/candidatos/{{ $('Obtener Postulación').item.json.idCandidato }}`
- Authentication: None
- Conectar desde: Obtener Postulación (en paralelo con Obtener Vacante)

### 4️⃣ NODO: Code - "Preparar Datos"
**Tipo:** Code (JavaScript)
**Conectar desde:** Obtener Vacante Y Obtener Candidato (esperar ambos)
**Código:** (Ver archivo APT-Analisis-Completo-CV-Respuestas.json, nodo "preparar-datos")

### 5️⃣ NODO: If - "¿Tiene CV?"
**Tipo:** If
**Configuración:**
- Condition: `{{ $json.hayCv }}` equals `true`
- Conectar desde: Preparar Datos

### 6️⃣ NODO: HTTP Request - "Descargar CV" (Rama TRUE)
**Tipo:** HTTP Request
**Configuración:**
- Method: GET
- URL: `{{ $json.cvUrl }}`
- Response Format: File
- Conectar desde: ¿Tiene CV? (rama TRUE)

### 7️⃣ NODO: Code - "Extraer Texto CV" (Rama TRUE)
**Tipo:** Code (JavaScript)
**Conectar desde:** Descargar CV
**Código:** (Ver archivo JSON, nodo "extract-cv-text")

### 8️⃣ NODO: Code - "Sin CV" (Rama FALSE)
**Tipo:** Code (JavaScript)
**Conectar desde:** ¿Tiene CV? (rama FALSE)
**Código:**
```javascript
return {
  json: {
    textoExtraidoCV: '[SIN CV SUBIDO]',
    largoTexto: 0,
    extraccionExitosa: false
  }
};
```

### 9️⃣ NODO: Merge - "Merge Datos CV"
**Tipo:** Merge
**Configuración:**
- Mode: Combine
- Combination Mode: Merge By Position
- Conectar Input 1: Extraer Texto CV
- Conectar Input 2: Sin CV

### 🔟 NODO: Code - "Combinar Datos"
**Tipo:** Code (JavaScript)
**Conectar desde:** Merge Datos CV
**Código:** (Ver archivo JSON, nodo "combine-data")

### 1️⃣1️⃣ NODO: OpenAI - "Análisis IA"
**Tipo:** OpenAI (requiere credenciales)
**Configuración:**
- Resource: Text
- Operation: Message
- Model: gpt-4o-mini
- Messages:
  - Role: System
    Content: (Ver archivo JSON, nodo "openai-analysis", message 1)
  - Role: User
    Content: (Ver archivo JSON, nodo "openai-analysis", message 2)
- Temperature: 0.3
- Max Tokens: 2000
- Conectar desde: Combinar Datos

⚠️ **IMPORTANTE:** Necesitas configurar credenciales de OpenAI primero:
- Settings → Credentials → Add New → OpenAI API
- Pegar tu API Key de OpenAI

### 1️⃣2️⃣ NODO: Code - "Procesar Resultado IA"
**Tipo:** Code (JavaScript)
**Conectar desde:** Análisis IA
**Código:** (Ver archivo JSON, nodo "process-ia-result")

### 1️⃣3️⃣ NODO: HTTP Request - "Actualizar Postulación"
**Tipo:** HTTP Request
**Configuración:**
- Method: PATCH
- URL: `http://apt-backend:3000/postulaciones/{{ $json.postulacionId }}`
- Send Body: Yes
- Body Content Type: JSON
- Body Parameters:
  - puntajeIa: `{{ $json.puntajeIa }}`
  - feedbackIa: `{{ $json.feedbackIa }}`
  - estado: `{{ $json.estadoNuevo }}`
- Conectar desde: Procesar Resultado IA

### 1️⃣4️⃣ NODO: Respond to Webhook - "Responder Webhook"
**Tipo:** Respond to Webhook
**Configuración:**
- Respond With: JSON
- Response Body:
```json
{{
  JSON.stringify({
    success: true,
    postulacionId: $('Procesar Resultado IA').item.json.postulacionId,
    analisis: $('Procesar Resultado IA').item.json.analisisCompleto
  }, null, 2)
}}
```
- Status Code: 200
- Conectar desde: Actualizar Postulación

## ⏱️ TIEMPO ESTIMADO
- Crear nodos: ~30 minutos
- Copiar código JavaScript: ~10 minutos
- Configurar OpenAI: ~5 minutos
- Probar workflow: ~10 minutos
**TOTAL: ~55 minutos**

## 🚀 ALTERNATIVA RÁPIDA (RECOMENDADA)
En vez de crear manualmente, puedes:

1. **Importar JSON vía UI:**
   - Menú hamburguesa (☰) → Import from file
   - Seleccionar: `APT-Analisis-Completo-CV-Respuestas.json`
   - Si da error de compatibilidad, ajustar manualmente los nodos problemáticos

2. **Usar API de n8n:**
   - Ejecutar: `.\IMPORTAR-WORKFLOW.ps1`
   - Esto importa todo el workflow en segundos

3. **Duplicar y modificar workflow existente:**
   - Si tienes otro workflow similar, duplicarlo y ajustar

## 📞 WEBHOOK URLS (CUANDO ESTÉ COMPLETO)
- Test URL: `http://localhost:5678/webhook-test/analizar-postulacion`
- Production URL: `http://localhost:5678/webhook/analizar-postulacion`

## ✅ VALIDACIÓN
Cuando termines, verifica que:
- [ ] Todos los nodos están conectados en secuencia
- [ ] No hay nodos con errores (ícono rojo)
- [ ] Las credenciales de OpenAI están configuradas
- [ ] El workflow se guarda correctamente
- [ ] Al activarlo, el switch cambia a verde

## 🧪 PRUEBA RÁPIDA
Ejecuta este comando para probar el webhook:
```powershell
$body = @{ postulacionId = 1 } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5678/webhook-test/analizar-postulacion" -Method Post -Body $body -ContentType "application/json"
```

Deberías recibir un JSON con el análisis completo.
