# 🎤 GUION DE PRESENTACIÓN — Propuestas de Proyecto de Grado

**Carrera:** Ingeniería en Informática
**Duración:** 5 minutos
**Objetivo:** Convencer al jurado de aprobar la **Propuesta 1** como proyecto principal

---

## 📋 RESUMEN EJECUTIVO (lo que debo recordar siempre)

| # | Propuesta | Enfoque tecnológico | Estado actual |
|---|-----------|---------------------|---------------|
| ⭐ 1 | Billetera Estudiantil con Blockchain | Web3, Solidity, criptografía | **Prototipo funcional** |
| 2 | Mensajería Confidencial Institucional (LAN) | Seguridad, redes, criptografía | Idea con arquitectura definida |
| 3 | Videojuego Educativo de Lógica de Programación | Unity, algoritmos, gamificación | Idea con diseño definido |

**Frase ganadora:** *"No es una idea: es un prototipo ejecutando."*

---

# 🟢 PROPUESTA 1 — BILLETERA ESTUDIANTIL CON BLOCKCHAIN ⭐

## Título formal sugerido
> *"Plataforma de incentivos estudiantiles basada en blockchain para la carrera de Ingeniería en Informática"*

## Guion para decir en voz alta

> "Mi primera propuesta es una **billetera estudiantil basada en blockchain** con un **programa de incentivos on-chain** para los estudiantes de Ingeniería en Informática.
>
> Funciona así: el estudiante gana tokens **ZAM** por notas, asistencia, tareas y participación académica, y los canjea por beneficios reales del campus. Todo se registra en la **red Base Sepolia**, usando **contratos inteligentes escritos en Solidity** y desplegados con **Hardhat**.
>
> Técnicamente, la arquitectura es **híbrida**: solo el **hash** de cada transacción va **on-chain**, y los datos sensibles viven en **Supabase (PostgreSQL)** protegidos con **Row Level Security** por roles. Esto garantiza **inmutabilidad** donde importa y **privacidad** donde es obligatoria.
>
> Un punto técnico diferenciador: el sistema es **gasless**. El estudiante **no necesita ETH ni firma transacciones** — un **relayer** en el backend ejecuta cada operación mediante **permits EIP-2612**, autenticado con firmas **EIP-191**. Es decir: cero fricción criptográfica para el usuario.
>
> Los certificados se emiten como **Soulbound Tokens (SBT)** — **ERC-721 no transferibles** — verificables públicamente sin intermediarios. El frontend está construido en **Next.js 15 con React 19 y TypeScript**, con autenticación vía **thirdweb In-App Wallet**.
>
> **Estado actual:** 6 contratos inteligentes, **24 pruebas automatizadas con Hardhat**, esquema de base de datos con políticas RLS y 3 paneles funcionales: estudiante, profesor y administrador.
>
> **Por qué elegirla:** une **programación distribuida, criptografía aplicada, diseño de sistemas escalables y economía de tokens** — todo lo que un proyecto de grado en Ingeniería en Informática debe demostrar."

## Explicación sencilla (si el jurado no entiende algo)

| Término técnico | Explicación sencilla para decir |
|----------------|--------------------------------|
| Blockchain | "Un registro público que no se puede borrar ni modificar" |
| Token / ZAM | "Una moneda digital del campus que se gana estudiando" |
| Contrato inteligente | "Un programa que vive en la blockchain y ejecuta reglas solo" |
| Gas / Gasless | "Normalmente cada operación cobra una comisión; nosotros la pagamos por el estudiante" |
| Relayer | "Un servidor que hace las transacciones en nombre del estudiante" |
| Hash | "Una huella digital única que representa un dato sin revelarlo" |
| SBT (Soulbound) | "Un certificado digital que no se puede transferir ni falsificar" |
| RLS | "Filtros de seguridad en la base de datos: cada rol ve solo lo que le corresponde" |
| EIP-2612 (Permit) | "Una firma digital que autoriza sin pagar comisiones" |
| Base Sepolia | "Una red de prueba gratuita de Ethereum, ideal para desarrollo" |

## Diagrama mental de la arquitectura (para explicar con las manos)

```
ESTUDIANTE (navegador)
    ↓ solo ve la app
NEXT.JS (interfaz)
    ↓
    ├──→ SUPABASE (datos privados: notas, perfil) ←── protegido por RLS
    │
    └──→ RELAYER (servidor seguro)
              ↓
         BLOCKCHAIN (hash de cada acción: inmutable)
```

**Frase para decirlo:** *"La información privada se queda en la base de datos; solo la huella (hash) va a la blockchain. Así cumplimos con privacidad Y con transparencia a la vez."*

## Ventajas competitivas (para vender)

1. **Gasless total** — el estudiante nunca paga fees ni necesita criptomonedas
2. **Arquitectura híbrida** — privacidad + transparencia en el mismo sistema
3. **Certificados verificables** — sin intermediarios, sin llamadas a secretaría
4. **Gamificación real** — tokens, rankings, badges y niveles motivan al estudiante
5. **Prototipo funcional** — 6 contratos, 24 tests, 3 paneles de usuario
6. **Escalable** — puede funcionar en otras carreras o universidades

---

# 🔵 PROPUESTA 2 — SISTEMA DE MENSAJERÍA CONFIDENCIAL EN RED LOCAL

## Título formal sugerido
> *"Sistema de mensajería integral institucional con cifrado de extremo a extremo sobre red local para la comunicación confidencial entre oficinas administrativas"*

## Guion para decir en voz alta

> "Mi segunda propuesta es un **sistema de mensajería integral institucional** para la **comunicación confidencial entre oficinas administrativas**, implementado sobre una **red local (LAN)** — sin dependencia de internet ni de servicios en la nube.
>
> El problema que resuelve es concreto: hoy la información sensible —RRHH, dirección, asuntos legales— circula por correos personales o aplicaciones comerciales que **no garantizan confidencialidad**. Este sistema lo elimina.
>
> En el plano técnico, se trata de una **aplicación cliente-servidor** desplegada en la **red interna de la institución**. El backend está construido con **Node.js y Express**, exponiendo una **API REST**, y la comunicación en tiempo real se maneja con **WebSockets (Socket.io)**.
>
> La confidencialidad se logra con **cifrado de extremo a extremo (E2E)**: cada mensaje se cifra en el cliente con **AES-256 en modo GCM** usando la **clave pública del destinatario (RSA-2048 o ECDH)**, y **solo el destinatario posee la clave privada** para descifrarlo. El servidor únicamente enruta **blobs cifrados** — **nunca ve el contenido en texto plano**.
>
> La autenticación se basa en **tokens JWT con control de acceso por roles (RBAC)**, donde cada oficina tiene políticas de permisos definidas. Todo queda en una **base de datos PostgreSQL local** con **registro de auditoría (audit log)**: quién envió, cuándo, a quién — pero jamás qué dijo.
>
> Además, la **arquitectura sobre red local** elimina el punto único de falla de la nube: si cae internet, la mensajería interna **sigue operativa**. La latencia es **sub-milisegundo** por ser tráfico LAN.
>
> **Por qué elegirla:** es un proyecto con enfoque en **seguridad informática, criptografía aplicada, redes de computadoras y arquitectura cliente-servidor**. Resuelve una necesidad **real y demostrable** de la institución con tecnología consolidada."

## Explicación sencilla (si el jurado no entiende algo)

| Término técnico | Explicación sencilla para decir |
|----------------|--------------------------------|
| LAN (red local) | "Una red interna que solo funciona dentro de la institución, sin internet" |
| Cifrado E2E | "El mensaje sale cifrado de tu computadora y solo se descifra en la del otro" |
| AES-256 | "El estándar de cifrado más usado y seguro del mundo" |
| RSA / ECDH | "La matemática que permite intercambiar claves sin que nadie las vea" |
| Clave pública / privada | "Como un candado y su llave: cualquiera puede candado, solo tú tienes la llave" |
| Cliente-servidor | "Una app en tu PC (cliente) que habla con un servidor local de la institución" |
| API REST | "El lenguaje formal que usan los sistemas para hablar entre sí" |
| WebSockets | "La tecnología que hace que los mensajes lleguen al instante, tipo chat" |
| JWT | "Un pase de acceso temporal que demuestra quién eres" |
| RBAC | "Cada oficina tiene permisos diferentes: RH no ve lo de dirección" |
| Audit log | "Un registro de quién hizo qué, para control y auditoría" |
| PostgreSQL | "El sistema de base de datos más usado y confiable del mercado" |

## Diagrama mental de la arquitectura

```
OFICINA A (PC)
    ↓ escribe mensaje
CLIENTE (React) ←→ CIFRA el mensaje (AES-256 + clave pública)
    ↓ solo sale texto cifrado
SERVIDOR LOCAL (Node.js + Express)
    ↓ enruta pero NO descifra
OFICINA B (PC) ←→ DESCIFRA con su clave privada
```

**Frase para decirlo:** *"El servidor es solo un mensajero ciego: recibe el paquete cerrado y lo entrega, pero nunca puede abrirlo. Eso es confidencialidad real."*

## Ventajas competitivas (para vender)

1. **Confidencialidad real** — ni el administrador del sistema puede leer los mensajes
2. **Independencia de internet** — funciona aunque caiga la conexión externa
3. **Baja latencia** — comunicación instantánea por ser red local
4. **Control de acceso** — RBAC por oficina y jerarquía institucional
5. **Auditoría completa** — trazabilidad sin comprometer privacidad
6. **Sin costo de licencias** — software libre, sin mensajeros comerciales

---

# 🟣 PROPUESTA 3 — VIDEOJUEGO EDUCATIVO DE LÓGICA DE PROGRAMACIÓN

## Título formal sugerido
> *"Videojuego de aventura para el aprendizaje de la lógica de programación en estudiantes de Ingeniería en Informática"*

## Guion para decir en voz alta

> "Mi tercera propuesta es un **videojuego de aventura para el aprendizaje de la lógica de programación** dirigido a los estudiantes de Ingeniería en Informática.
>
> El concepto: el estudiante avanza por niveles resolviendo desafíos donde **su código es la mecánica del juego**. Para abrir una puerta, necesita un **ciclo for**. Para derrotar a un enemigo, necesita una **condicional**. Para escalar, una **función**. La lógica de programación deja de ser teoría y se convierte en supervivencia.
>
> Técnicamente, el desarrollo se apoya en **Unity con C#** para el motor de juego — o **Phaser.js con TypeScript** si se opta por una versión **web sin instalación**. El **editor de código embebido** usa **Monaco Editor**, el mismo motor que impulsa **Visual Studio Code**, integrado directamente en la interfaz del juego.
>
> Cada solución enviada pasa por un **motor de evaluación automático**: el código del estudiante se ejecuta en un **sandbox aislado** con **pruebas unitarias**, y el sistema califica **correctitud, eficiencia y complejidad algorítmica** en tiempo real. Esto permite **feedback inmediato**, clave para el aprendizaje significativo.
>
> La plataforma incluye un **portal web con React y Node.js** para registro, **ranking de jugadores**, seguimiento de progreso y **analítica de aprendizaje**: el profesor ve en qué conceptos el curso tiene más debilidad.
>
> Desde el punto de vista pedagógico, se aplica la **gamificación y el aprendizaje experiencial**: puntos, niveles y recompensas activan la **motivación intrínseca**, atacando el problema de **deserción en las materias de fundamentos**.
>
> **Por qué elegirla:** integra **desarrollo de videojuegos, programación, diseño de algoritmos y tecnología educativa**. Es medible y tiene **alto impacto demostrable**."

## Explicación sencilla (si el jurado no entiende algo)

| Término técnico | Explicación sencilla para decir |
|----------------|--------------------------------|
| Unity | "El motor de videojuegos más usado del mundo profesional" |
| C# / TypeScript | "Los lenguajes con los que se construye el juego y el código del estudiante" |
| Phaser.js | "Una librería para hacer juegos directamente en el navegador, sin instalar nada" |
| Monaco Editor | "El editor de código del Visual Studio Code, embebido dentro del juego" |
| Sandbox | "Una caja de seguridad donde el código del estudiante se ejecuta sin dañar nada" |
| Pruebas unitarias | "Casos de prueba automáticos que verifican si la solución es correcta" |
| Complejidad algorítmica | "Qué tan eficiente es el código del estudiante, no solo si funciona" |
| Gamificación | "Aplicar reglas de juego (puntos, niveles) al aprendizaje" |
| Learning analytics | "Análisis de datos para ver dónde el curso tiene más dificultades" |
| Aprendizaje experiencial | "Aprender haciendo, no solo memorizando" |

## Diagrama mental de la arquitectura

```
ESTUDIANTE juega
    ↓ encuentra un desafío
MONACO EDITOR (escribe código)
    ↓ envía solución
SANDBOX (ejecuta en aislamiento)
    ↓ pruebas unitarias
RESULTADO: "Correcto ✓" o "Error: necesitas un for"
    ↓
AVANZA DE NIVEL / INTENTA DE NUEVO
```

**Frase para decirlo:** *"El juego no solo entretiene: evalúa automáticamente, da retroalimentación inmediata y le dice al profesor exactamente dónde el curso está fallando."*

## Ventajas competitivas (para vender)

1. **Aprendizaje experiencial** — el estudiante aprende programando, no memorizando
2. **Evaluación automática** — feedback instantáneo sin sobrecargar al profesor
3. **Analítica educativa** — datos concretos sobre el aprendizaje del curso
4. **Alta retención** — gamificación que combate la deserción en fundamentos
5. **Medible** — se puede comparar rendimiento con y sin el juego
6. **Accesible** — versión web (Phaser) sin instalación en laboratorios

---

# 🏁 CIERRE COMÚN PARA LAS TRES (la frase final que vende)

> "Las tres propuestas son técnicamente sólidas, viables en seis meses y alineadas al perfil de Ingeniería en Informática.
>
> - La **Propuesta 1** demuestra dominio de **tecnologías emergentes y arquitecturas híbridas**.
> - La **Propuesta 2** demuestra dominio de **seguridad informática y redes**.
> - La **Propuesta 3** demuestra dominio de **algoritmos, videojuegos y pedagogía**.
>
> Pero solo una tiene **prototipo funcional, contratos con pruebas automatizadas y arquitectura on-chain/off-chain ya implementada**: la **Propuesta 1**.
>
> Es la que puedo defender hoy con **evidencia técnica, no con promesas**.
>
> ¿Hay alguna pregunta?"

---

# ❓ PREGUNTAS PROBABLES DEL JURADO (y cómo responder)

## Propuesta 1 — Blockchain

| Pregunta | Respuesta sugerida |
|----------|-------------------|
| ¿No es excesivo usar blockchain para esto? | "No, porque solo el hash va on-chain. Los datos sensibles quedan en PostgreSQL con RLS. Usamos blockchain únicamente donde aporta valor: inmutabilidad y verificación." |
| ¿Cuánto cuesta el gas al estudiante? | "Cero. El sistema es gasless: un relayer del backend paga el gas mediante permits EIP-2612. El estudiante ni siquiera necesita ETH." |
| ¿Es escalable a otras carreras? | "Sí. La arquitectura es modular: solo se agregan contratos o roles. Está diseñada para extenderse a toda la universidad." |
| ¿Qué pasa si se cae la red blockchain? | "La app sigue funcionando con Supabase; las transacciones on-chain se encolan y se ejecutan cuando la red responda." |
| ¿Cómo garantiza la privacidad de los datos? | "Mediante arquitectura híbrida: solo hashes van a la blockchain, los datos personales están en Supabase con Row Level Security por roles." |
| ¿Por qué no una app tradicional sin blockchain? | "Porque perderíamos verificación pública de certificados, inmutabilidad del historial y transparencia en la economía de incentivos." |

## Propuesta 2 — Mensajería LAN

| Pregunta | Respuesta sugerida |
|----------|-------------------|
| ¿Por qué no usar WhatsApp o correo institucional? | "Porque esos servicios no garantizan confidencialidad: el proveedor puede acceder a los mensajes. Aquí el servidor nunca ve el contenido." |
| ¿Qué pasa si el servidor se compromete? | "Los mensajes están cifrados. Un atacante solo obtendría texto cifrado, no información legible." |
| ¿Cómo se intercambian las claves de forma segura? | "Mediante criptografía asimétrica (RSA o ECDH): la clave pública se comparte abiertamente, la privada nunca sale del cliente." |
| ¿Es viable en una red local real? | "Sí. Es una arquitectura cliente-servidor estándar. Solo requiere un servidor en la LAN de la institución." |
| ¿Cuántos usuarios soporta? | "Una LAN institucional típica maneja cientos de usuarios sin problema. WebSockets escala bien con clustering de Node.js." |
| ¿Cómo se audita sin violar privacidad? | "El audit log registra metadatos (quién, cuándo, a quién) pero nunca el contenido cifrado del mensaje." |

## Propuesta 3 — Videojuego Educativo

| Pregunta | Respuesta sugerida |
|----------|-------------------|
| ¿Un juego es realmente educativo o solo entretenimiento? | "Es un juego serio. Cada nivel evalúa un concepto de lógica con pruebas unitarias automáticas. El objetivo es aprendizaje medible, no solo diversión." |
| ¿Cómo se mide que realmente enseña? | "Con un estudio comparativo: grupo con juego vs. grupo tradicional, midiendo notas y retención antes y después." |
| ¿No es muy ambicioso para un proyecto de grado? | "El alcance está acotado: 10 niveles que cubren variables, condicionales, bucles y funciones. Es viable en seis meses." |
| ¿Qué pasa si el estudiante pega código de internet? | "El sandbox solo valida las soluciones contra nuestros casos de prueba ocultos, y el ranking incentiva la resolución propia." |
| ¿Unity no es pesado para los laboratorios? | "Por eso la opción con Phaser.js: corre en el navegador, sin instalación, ideal para equipos institucionales." |
| ¿Cómo integra con la asignatura real? | "El profesor recibe analítica del juego y puede ajustar su clase. El juego complementa, no reemplaza, la enseñanza." |

---

# 🎯 TIPS DE ENTREGA Y COMUNICACIÓN

## Cronograma sugerido

| Tiempo | Sección |
|--------|---------|
| 0:00 – 0:40 | Apertura y contexto |
| 0:40 – 1:10 | El problema que resuelven las tres |
| 1:10 – 1:40 | Visión general de las tres propuestas |
| 1:40 – 3:20 | Propuesta 1 (la más importante) |
| 3:20 – 4:20 | Propuestas 2 y 3 |
| 4:20 – 5:00 | Cierre y recomendación |

## Lenguaje corporal

- **Mira al jurado**, no a la pantalla ni al papel
- **Gesticula** al contar las razones (usa los dedos: "tres razones...")
- **Habla pausado**: 120-140 palabras por minuto
- **Sonríe** al decir "no es una idea, es un prototipo"
- **Pausa dramática** antes de la recomendación final

## Errores que debo evitar

- ❌ Leer el guion palabra por palabra
- ❌ Usar tecnicismos sin explicarlos primero
- ❌ Nerviosismo al no saber un dato — decir "lo tengo documentado en el proyecto"
- ❌ Pasarme de los 5 minutos — practicar con cronómetro 3 veces
- ❌ Responder agresivamente a objeciones — siempre: "Excelente observación, y aquí está cómo lo resolvemos..."

## Demo recomendada

- Tener la **app de la Propuesta 1** abierta en el navegador (o un video corto de 20 segundos)
- Si el jurado pide verla: login → ganar ZAM → canjear recompensa (ese flujo resume todo)
- Frase: *"Prefiero mostrarlo que explicarlo"*

---

# 🧠 TARJETAS DE MEMORIZACIÓN (flashcards)

## Propuesta 1
- **3 palabras:** Token · Incentivos · Certificados
- **Tecnicismos:** Solidity, ERC-20, SBT, gasless, EIP-2612, RLS, Base Sepolia, thirdweb
- **Cifras:** 6 contratos, 24 tests, 3 paneles
- **Dato clave:** el estudiante nunca paga gas

## Propuesta 2
- **3 palabras:** Confidencial · LAN · Institucional
- **Tecnicismos:** AES-256, RSA/ECDH, JWT, RBAC, WebSockets, audit log, cliente-servidor
- **Dato clave:** el servidor nunca ve el mensaje en texto plano

## Propuesta 3
- **3 palabras:** Aventura · Lógica · Gamificación
- **Tecnicismos:** Unity/C#, Monaco Editor, sandbox, pruebas unitarias, learning analytics
- **Dato clave:** evaluación automática con feedback inmediato

---

# 📊 COMPARATIVA FINAL (para decir si el jurado pide elegir)

| Criterio | Propuesta 1 | Propuesta 2 | Propuesta 3 |
|----------|-------------|-------------|-------------|
| Innovación | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| Viabilidad en 6 meses | ⭐⭐⭐ (ya tiene prototipo) | ⭐⭐⭐ | ⭐⭐ |
| Impacto institucional | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Complejidad técnica | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| Estado actual | Prototipo funcional | Arquitectura definida | Diseño definido |
| Tecnología usada | Web3 + fullstack | Seguridad + redes | Videojuegos + IA educativa |

**Conclusión del comparativo:** "Si el jurado busca el proyecto con mayor evidencia de ejecución y mayor innovación tecnológica, la elección es la **Propuesta 1**."

---

*Guion preparado para la presentación de propuestas de Proyecto de Grado — Ingeniería en Informática*
