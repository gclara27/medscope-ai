# Guion completo — vídeo de defensa TFM

Discurso **palabra por palabra** para grabar un vídeo con:

- tu **cara y voz** (cámara),
- **diapositivas**,
- **aplicación en vivo** (compartir pantalla),
- idealmente **picture-in-picture** (tu rostro en una esquina mientras se ve la app).

**Duración total:** 12–14 minutos (versión corta ~10 min en §Final).

**Slides:** [Slides-Presentacion-Video.md](Slides-Presentacion-Video.md)  
**Memoria escrita:** [Memoria-TFM.md](Memoria-TFM.md)

---

## Antes de grabar (checklist técnico)

| Paso | Acción |
|---|---|
| 1 | **24 h antes:** abrir `https://medscope-ai-q8tg.onrender.com/health` varias veces hasta `ml_ready: true` |
| 2 | **Justo antes de grabar:** repetir `/health` y dejar pestaña del login abierta |
| 3 | Credenciales listas en bloc de notas **fuera de pantalla** (no grabar contraseña) |
| 4 | OBS / Zoom / Teams: escena 1 = cámara completa; escena 2 = pantalla + PiP cámara |
| 5 | Micrófono a 15–20 cm; habitación silenciosa |
| 6 | Resolución pantalla 1920×1080; zoom navegador 100 % |
| 7 | Cerrar notificaciones Windows |
| 8 | Ensayo completo 1 vez cronometrando |

**URLs:**

- Login: https://medscope-ai-delta.vercel.app/login  
- Usuario demo: `clinician@medscope.ai`

**Plan B en grabación:** si la API falla, di la frase del §Plan B y muestra capturas `docs/figures/screenshots/` en slide 9.

---

## Leyenda de formatos en este guion

| Etiqueta | Significado |
|---|---|
| **🎥 CÁMARA** | Solo tu rostro (slide opcional o fondo neutro) |
| **📊 SLIDE N** | Mostrar diapositiva N |
| **🖥️ PANTALLA** | Compartir navegador / app (PiP con tu cara recomendado) |
| **⏱** | Tiempo acumulado aproximado |

El texto entre comillas es **lo que debes decir** (puedes adaptar ligeramente, pero mantén términos clave: CDSS, SHAP, recall, no diagnóstico).

---

## 0:00 – 0:45 · Apertura (🎥 CÁMARA)

**Visual:** Slide 1 en fondo difuminado, o solo cámara.

> «Buenos días. Mi nombre es **[tu nombre]** y presento mi Trabajo Fin de Máster: **MedScope AI**, un sistema de apoyo a la decisión clínica basado en inteligencia artificial explicable.
>
> En los próximos minutos voy a explicar el problema que aborda el proyecto, la arquitectura técnica, los resultados del modelo de machine learning, y — lo más importante — una **demostración en vivo** de la plataforma desplegada en la nube.
>
> Antes de empezar, una aclaración importante: MedScope AI **no diagnostica** ni prescribe tratamientos. Es una herramienta de **apoyo a la decisión** para ayudar a equipos clínicos a anticipar el riesgo de readmisión hospitalaria.»

---

## 0:45 – 1:30 · El problema (📊 SLIDE 2)

> «Hoy en día, las readmisiones hospitalarias en los primeros treinta días suponen un coste elevado y, en muchos casos, son prevenibles si se identifica a tiempo al paciente de alto riesgo.
>
> El problema es que los sistemas de información hospitalaria **almacenan** datos, pero no siempre ayudan al clínico a **anticipar** ese riesgo de forma clara.
>
> Y cuando usamos inteligencia artificial, aparece otro problema: la **caja negra**. Un porcentaje sin contexto genera desconfianza. Por eso este proyecto no se queda en un número: añade **explicabilidad** con SHAP y **simulación** de escenarios clínicos hipotéticos.»

---

## 1:30 – 2:15 · La solución (📊 SLIDE 3)

> «MedScope AI es una plataforma web que integra cuatro piezas en un solo flujo de trabajo.
>
> Primero: **predicción** del riesgo de readmisión a treinta días, usando un modelo entrenado con datos clínicos tabulares del dataset público UCI de diabetes.
>
> Segundo: **explicabilidad** — el clínico ve qué variables empujan el riesgo hacia arriba o hacia abajo.
>
> Tercero: **simulación what-if** — podemos preguntar: “si mejoramos el control glucémico o reducimos las admisiones previas, ¿cómo cambia el riesgo?”
>
> Y cuarto: **persistencia e historial** — cada evaluación queda registrada para consulta y analítica posterior.»

---

## 2:15 – 2:50 · Objetivos (📊 SLIDE 4)

> «Los objetivos del TFM han sido, en resumen: construir un pipeline de machine learning **reproducible**; integrarlo en una API segura con autenticación y roles; desarrollar una interfaz clínica profesional; persistir los resultados en PostgreSQL; y desplegar el sistema en **producción real**, no solo en local.
>
> Todo el código vive en un único repositorio modular: frontend, backend y machine learning, sin microservicios, priorizando la claridad y el mantenimiento.»

---

## 2:50 – 3:40 · Arquitectura (📊 SLIDE 5)

> «En esta diapositiva vemos la arquitectura. A la izquierda, el navegador con la aplicación React desplegada en **Vercel**. Las peticiones van por HTTPS al backend **FastAPI**, que corre en **Render** dentro de un contenedor Docker.
>
> Ese backend carga al arrancar el modelo serializado — `model.pkl`, el preprocesador y la muestra de fondo para SHAP — y se conecta a **PostgreSQL** en **Supabase** para guardar predicciones, explicaciones y simulaciones.
>
> El entrenamiento del modelo se hace **offline**, en el módulo `ml/` del repositorio. En inferencia **nunca** reentrenamos: solo predecimos y explicamos. Esto es crítico para un entorno clínico regulado y para la reproducibilidad del TFM.»

---

## 3:40 – 4:30 · Pipeline ML (📊 SLIDE 6)

> «El pipeline de machine learning sigue un flujo claro: datos, preprocesamiento, entrenamiento de varios candidatos, evaluación, selección del modelo final y serialización de artefactos.
>
> Usamos diecinueve variables clínicas derivadas del dataset, con imputación, escalado y codificación one-hot. Evaluamos regresión logística, random forest y, de forma opcional, XGBoost.
>
> El modelo que está hoy en producción es **regresión logística versión 1.0.0**, con explicador SHAP lineal, por una razón clínica deliberada que veremos en la siguiente diapositiva.»

---

## 4:30 – 5:15 · Resultados ML (📊 SLIDE 7)

> «En el conjunto de test — datos que el modelo no vio en entrenamiento — la regresión logística obtiene una accuracy de aproximadamente **sesenta y un por ciento**. El KPI del proyecto pedía setenta y cinco, y **no lo alcanzamos**. Lo documento con transparencia en la memoria.
>
> Sin embargo, en un sistema de apoyo a la decisión priorizamos **recall**: la capacidad de detectar readmisiones reales. Aquí la logística alcanza un recall de **cincuenta y cuatro por ciento**, frente a un veinte por ciento del random forest, que sí tenía más accuracy pero perdía la mayoría de los casos positivos.
>
> En clínica, perder un paciente de alto riesgo suele ser más grave que generar una alerta de más. Por eso esa fue la decisión de producción. La precisión es baja — hay falsas alarmas — y es una limitación explícita del trabajo.»

---

## 5:15 – 5:30 · Puente a la demo (📊 SLIDE 8)

**🎥 CÁMARA breve o slide 8 a pantalla completa.**

> «Ahora paso a la parte central del vídeo: la **demostración en producción**. Voy a compartir pantalla y entrar en la aplicación desplegada. Los casos que verán son **sintéticos y desidentificados**; no hay datos reales de pacientes.»

**Acción:** cambiar escena OBS a **🖥️ PANTALLA + PiP cámara**.

---

## 5:30 – 6:00 · Login y dashboard (🖥️ PANTALLA)

**Acción:** abrir login → autenticar → dashboard.

> «Estoy en la URL de producción en Vercel. Inicio sesión con un usuario de rol **clínico**.
>
> Estamos en el **dashboard**: una vista operativa con indicadores clave, alertas de pacientes de alto riesgo y actividad reciente. Es el punto de entrada diario del profesional sanitario.»

---

## 6:00 – 6:45 · Evaluación y escenario alto riesgo (🖥️ PANTALLA)

**Acción:** sidebar **Evaluation** → clic tarjeta **High readmission risk**.

> «En **Evaluation** el clínico introduce variables del paciente. Para la demo, he preparado **escenarios clínicos predefinidos**: casos sintéticos para formación y demostración, que **no sustituyen** el juicio clínico.
>
> Selecciono el escenario de **alto riesgo de readmisión**. El formulario se rellena automáticamente: setenta y dos años, glucosa elevada, cinco admisiones previas. El badge indica la banda **esperada** del escenario; el score real lo calcula el modelo al instante.
>
> Pulso **Generate AI Prediction**.»

**Acción:** esperar resultado (~1–3 s si API caliente).

---

## 6:45 – 7:30 · Resultado y SHAP (🖥️ PANTALLA)

**Acción:** pantalla **Prediction Result** — gauge, categoría, scroll a SHAP.

> «En menos de un segundo tenemos el resultado: aproximadamente **ochenta y dos por ciento** de riesgo, categoría **alta**.
>
> Arriba vemos el **gauge** de riesgo y un resumen en lenguaje clínico neutro.
>
> Si bajo a la sección de **SHAP**, aparece el gráfico de explicabilidad: cada barra muestra qué factores **aumentan** o **reducen** el riesgo. Esto responde a la pregunta clave del clínico: no solo “cuánto riesgo”, sino **por qué**.
>
> MedScope AI no es una caja negra: cada predicción lleva su explicación asociada.»

---

## 7:30 – 8:30 · Simulación what-if (🖥️ PANTALLA)

**Acción:** **Run simulation** → cambiar Previous admissions a **2**, Glucose a **140** → **Recalculate**.

> «El siguiente paso es la **simulación clínica**. Desde el mismo caso, abro **Simulation**.
>
> Imaginemos una intervención hipotética: mejor control glucémico — glucosa a ciento cuarenta — y reducción de admisiones previas de cinco a **dos**.
>
> Pulso **Recalculate**. El sistema no modifica el registro original: compara el riesgo **baseline** con el **simulado**.
>
> Vemos el delta: el riesgo baja en torno a **veintiún puntos porcentuales**. El gauge anima la transición — es feedback visual del impacto de la intervención.
>
> Esto es un **what-if en tiempo real**: explorar decisiones sin tocar la historia clínica real.»

---

## 8:30 – 9:15 · Historial y analytics (🖥️ PANTALLA)

**Acción:** **History** → última fila → opcional **View** → **Analytics**.

> «En **History** queda guardada la predicción que acabamos de generar, con trazabilidad en **PostgreSQL**: quién evaluó, cuándo, qué riesgo, y las explicaciones asociadas.
>
> Puedo abrir el detalle de una evaluación pasada y, desde ahí, relanzar una simulación.
>
> En **Analytics**, la vista de **analista o gestor**: volumen de predicciones, distribución por bandas de riesgo y tendencias agregadas — todo calculado sobre los datos persistidos, sin tablas de reporting precocinadas.»

---

## 9:15 – 9:30 · Cierre de la demo (🖥️ PANTALLA o 🎥 CÁMARA)

**Acción opcional:** mostrar `/health` con `ml_ready: true` en otra pestaña (sin contraseñas).

> «La demo ha corrido contra el stack desplegado: frontend en Vercel, API y modelo en Render, base de datos en Supabase. El endpoint de health confirma que el modelo ML está cargado y listo.
>
> Vuelvo a las diapositivas para resumir.»

**Acción:** volver a escena **📊 SLIDES** o **🎥 CÁMARA**.

---

## 9:30 – 10:15 · Calidad de software (📊 SLIDE 10)

> «Más allá del modelo, el TFM demuestra **ingeniería de software**: más de doscientos quince tests automatizados en backend, tests de machine learning, tests end-to-end con Playwright que recorren el flujo que acaban de ver, integración continua en GitHub Actions, y despliegue automático al hacer push a la rama principal.
>
> Hay autenticación JWT, cuatro roles — administrador, clínico, analista y enfermería — y un esquema relacional normalizado documentado con diagrama entidad-relación.»

---

## 10:15 – 10:50 · Conclusiones (📊 SLIDE 11)

> «En conclusión: he entregado un **CDSS funcional de extremo a extremo**, desplegado en la nube, que integra predicción, explicabilidad SHAP y simulación en una experiencia de usuario clínica moderna.
>
> El valor del trabajo no reside solo en el porcentaje de accuracy — que es mejorable — sino en la **arquitectura auditable**, la **transparencia** frente al clínico, y la **reproducibilidad** del pipeline completo, desde el dataset público hasta la inferencia en producción.
>
> He sido explícito con las limitaciones: dataset histórico estadounidense, precision baja, generalización no validada externamente.»

---

## 10:50 – 11:30 · Trabajo futuro y despedida (📊 SLIDE 12 → 🎥 CÁMARA)

**Slide 12, luego solo cámara para la última frase.**

> «Como trabajo futuro: validación en otro centro hospitalario, calibración del umbral, integración con estándares como FHIR, y evolución del modelo con más variables clínicas.
>
> También existe una **demo pública** sin login en la ruta barra demo, para que cualquier evaluador pueda probar el flujo guiado sin credenciales.
>
> Muchas gracias por su atención. Quedo a disposición para cualquier aclaración sobre la memoria o el código del repositorio.»

**⏱ Fin ~11:30.** Pausa 2 s, cortar grabación.

---

## Versión corta (~10 min)

Si el límite es estricto, **omitir:**

- Slide 4 (objetivos) — resumir en 15 s dentro de slide 3
- Analytics en demo (§8:30) — solo History
- Slide 10 (calidad) — mencionar una frase en conclusiones
- Slide 9 (grid capturas)

**No omitir:** problema, arquitectura, resultados ML honestos, demo predict + SHAP + simulation.

---

## Plan B (si falla la API durante la grabación)

> «En este momento el servicio cloud de la API está en cold start o no responde — algo documentado en el free tier de Render. Muestro el mismo flujo con capturas tomadas de la aplicación en funcionamiento, que están en la memoria y reproducen exactamente las pantallas que hemos diseñado.»

Mostrar **Slide 9** con las cuatro capturas y narrar el mismo guion de §6:45–8:30 señalando cada imagen.

---

## Configuración OBS recomendada (picture-in-picture)

| Elemento | Ajuste |
|---|---|
| Escena «Intro» | Cámara 1080p + micrófono |
| Escena «Demo» | Captura ventana Chrome + cámara 320×180 esquina inferior derecha |
| Escena «Slides» | Captura PowerPoint en presentación + cámara pequeña opcional |
| Audio | Solo micrófono; desactivar audio del sistema si no es necesario |
| Formato export | MP4 H.264, 1080p, 30 fps |

---

## Tabla de sincronización rápida

| ⏱ | Visual | Tema |
|---|---|---|
| 0:00 | 🎥 | Presentación personal |
| 0:45 | 📊 2–3 | Problema y solución |
| 2:15 | 📊 4–5 | Objetivos y arquitectura |
| 3:40 | 📊 6–7 | ML y resultados |
| 5:15 | 📊 8 | Puente demo |
| 5:30 | 🖥️ | Login → Dashboard |
| 6:00 | 🖥️ | Evaluation → Predict |
| 6:45 | 🖥️ | SHAP |
| 7:30 | 🖥️ | Simulation |
| 8:30 | 🖥️ | History + Analytics |
| 9:30 | 📊 10–12 | Calidad, conclusiones, gracias |

---

## Después de grabar

- [ ] Revisar audio (sin clipping)
- [ ] Verificar que no aparece contraseña en ningún frame
- [ ] Subtítulos opcionales (rev.com, Whisper, CapCut)
- [ ] Exportar 1080p MP4 según normativa universidad
- [ ] Backup en unidad externa (T-905)

---

*Guion para vídeo de defensa — complemento T-810. Ensayar 2–3 veces antes de la toma final.*
