export interface WispTemplate {
  id: string;
  title: string;
  category: "Wizard" | "Dashboard" | "Form" | "Mobile" | "E-Commerce" | "Split View" | "Design System";
  description: string;
  code: string;
}

export const WISP_TEMPLATES: WispTemplate[] = [
  {
    id: "m3-expressive-gallery",
    title: "Material 3 Expressive UI • Master Design System",
    category: "Design System",
    description: "Catálogo exhaustivo de todos los componentes M3 Expressive: botones, campos, controles, tablas tipadas, feedback y layouts.",
    code: `@theme material3

@M3Gallery:screen
  appbar "Material 3 Expressive Design System" icon=palette
    button icon=bell text
    button icon=share-2 text

  breadcrumbs items=["Design System", "Material 3", "Component Gallery"] separator=chevron

  snackbar "Material 3 Expressive Tokens cargados con éxito" action="Explorar" icon=sparkles type=info goto=@M3DialogPreview

  row spacing=16 justify=between
    column spacing=4
      text "Catálogo Universal de Componentes M3" display color=primary
      text "Especificación visual y funcional completa con tipografías fluidas, estados interactivos y tokens M3."
    row spacing=12
      button "Ver Diálogo Modal" filled icon=layers goto=@M3DialogPreview
      button "Hoja Inferior" tonal icon=arrow-up-right goto=@M3SheetPreview

  spacer height=8

  grid cols=4 gap=16
    metric label="Tokens M3" value="48 Tokens" delta="100% Cobertura" icon=palette
    metric label="Componentes" value="28 Widgets" delta="Vibe Ready" icon=box
    metric label="Accesibilidad" value="WCAG AAA" delta="4.5:1 Contrast" icon=shield-check
    metric label="Exportación" value="TSX + WDSL" delta="Direct to Dev" icon=code

  spacer height=12

  tabs items=["Entradas & Formularios", "Acciones & Botones", "Estructura & Tablas", "Superficies & Alertas"]
    tab "Entradas & Formularios"
      split
        left
          card elevated
            text "Campos de Texto y Búsqueda" title
            textfield usuario label="Nombre de Usuario" placeholder="javierdiaz" icon=user
            textfield email label="Correo Corporativo" placeholder="javier@empresa.com" icon=mail
            textfield password label="Contraseña Segura" placeholder="••••••••••••" icon=lock type=password
            searchbar query placeholder="Buscar componentes, tokens o guías..."
            textarea bio label="Biografía Profesional" rows=3 placeholder="Escribe una breve descripción de tu perfil..."

        right
          card elevated
            text "Selectores y Controles Numéricos" title
            grid cols=2 gap=12
              select rol label="Rol en el Sistema" value="Tech Lead"
                option "Tech Lead"
                option "Senior Frontend"
                option "Product Designer"
                option "Fullstack Dev"
              datepicker fechaIngreso label="Fecha de Inicio" value="2026-08-20"
            autocomplete pais label="País de Residencia" placeholder="Escribe para filtrar..."
              option "México"
              option "España"
              option "Colombia"
              option "Argentina"
              option "Chile"
              option "Perú"
            spacer height=4
            slider nivelExperiencia label="Nivel de Experiencia (Años)" min=1 max=20 value=8
            text "Satisfacción con el flujo de trabajo Wisp:" label
            rating csatScore label="Evaluación CSAT" value=5 max=5
            row spacing=16
              switch modoOscuro label="Tema Oscuro Activo" checked=true
              checkbox terminos label="Acepto Términos M3" checked=true

    tab "Acciones & Botones"
      card elevated
        text "Variantes de Botones Material 3" title
        text "Jerarquía de énfasis: Filled (primario), Tonal (secundario), Outlined (medio), Elevated (superficie), Text (bajo)." body
        spacer height=8
        row spacing=12
          button "Filled Button" filled icon=check
          button "Tonal Button" tonal icon=sparkles
          button "Outlined Button" outlined icon=edit-3
          button "Elevated Button" elevated icon=arrow-up
          button "Text Button" text icon=chevron-right
        spacer height=12
        text "Botones Segmentados y Chips de Filtro:" label
        row spacing=12
          segmentedbutton dispositivo options=["Desktop", "Tablet", "Móvil"] selected="Desktop"
        spacer height=8
        row spacing=8
          chip "Filtro Activo" variant=filter selected=true icon=check
          chip "Sugerencia Assist" icon=help-circle
          chip "Alta Prioridad" icon=alert-circle selected=true
          chip "Cloud Native" icon=cloud

    tab "Estructura & Tablas"
      card elevated
        row spacing=16 justify=between
          text "Tabla de Datos Tipados con Búsqueda" title
          button "Nuevo Miembro" filled icon=plus
        table title="Directorio de Equipo" columns=["Miembro:avatar", "Correo:text", "Rol:status", "Progreso:progress", "Último Acceso:date", "Sueldo:currency", "Acción:action"] striped=true searchable=true pageSize=3
          row ["Javier Diaz", "javier@google.com", "Super Admin", "95%", "2026-08-20", "$9,500.00", "Gestionar"]
          row ["Elena Rostova", "elena@empresa.com", "DevOps Lead", "88%", "2026-08-19", "$8,200.00", "Gestionar"]
          row ["Carlos Mendez", "carlos@empresa.com", "QA Lead", "72%", "2026-08-18", "$6,800.00", "Gestionar"]
          row ["Sofia Castro", "sofia@empresa.com", "UX Designer", "100%", "2026-08-20", "$7,400.00", "Gestionar"]

    tab "Superficies & Alertas"
      grid cols=2 gap=16
        card elevated
          text "Retroalimentación y Notificaciones" title
          alert "La sincronización en la nube se ha completado correctamente." type=success title="Operación Exitosa"
          alert "Recuerda configurar los certificados TLS antes del lanzamiento." type=warning title="Advertencia de Seguridad"
          alert "Error al autenticar contra el servidor LDAP." type=error title="Fallo de Conexión"
          alert "Material 3 Expressive utiliza esquemas de color dinámicos HCT." type=info title="Información M3"

        card outlined
          text "Acordeones y Agrupadores" title
          accordion "1. Parámetros de Infraestructura" expanded=true icon=server
            text "Configuración de clústeres Kubernetes y balanceadores de carga." body
            row spacing=12
              switch autoScale label="Auto-escalado HPA" checked=true
              switch ddosProtect label="Protección DDoS Cloud Armor" checked=true
          accordion "2. Políticas de Seguridad Zero Trust" expanded=false icon=shield-check
            text "Autenticación basada en contexto y mTLS estricto." body

  fab "Crear Widget" icon=plus extended=true goto=@M3DialogPreview

@M3DialogPreview:dialog
  card elevated
    text "Diálogo Modal de Confirmación" headline color=primary
    text "¿Deseas aplicar los cambios del sistema de diseño a todo el proyecto?" body
    spacer height=12
    alert "Esta acción generará un nuevo release en el repositorio de GitHub." type=info
    spacer height=12
    row spacing=12 justify=end
      button "Cancelar" text goto=close
      button "Confirmar y Publicar" filled icon=rocket goto=close

@M3SheetPreview:sheet
  card elevated
    row spacing=12 justify=between
      text "Panel Deslizable Inferior (Sheet)" headline color=primary
      button "" text icon=x goto=close
    text "Información contextual complementaria o filtros rápidos sin perder el estado de la pantalla." body
    spacer height=12
    listitem "Documentación Técnica" subtitle="Guía de migración a Material 3" icon=book-open
    listitem "Descarga de Tokens" subtitle="Exportar formato JSON / TSX" icon=download
    spacer height=16
    button "Cerrar Panel" filled goto=close
`,
  },
  {
    id: "kiro-setup-wizard",
    title: "Kiro Setup Wizard (Especificación Oficial)",
    category: "Wizard",
    description: "Flujo paso a paso con layout split, inputs de credenciales y navegación entre steps.",
    code: `@theme material3

@KiroSetup:wizard
  steps: 3

  step "Bienvenida"
    column spacing=24
      card elevated
        text "Configura tu entorno Kiro" headline color=primary
        text "Wisp te permite prototipar flujos completos sin escribir código antes de tiempo. Valida los campos ahora para evitar cambios técnicos futuros."
        spacer height=12
        row spacing=12
          chip "Entorno Cloud" icon=cloud selected=true
          chip "Alta Disponibilidad" icon=shield selected=true
          chip "M3 Expressive" icon=palette
        spacer height=16
        button "Comenzar Configuración" filled icon=arrow-right goto=@KiroSetup(step=2)

  step "Conexión y Parámetros"
    split
      left
        card filled
          text "Guía de Conexión" title
          text "Ingresa los endpoints de tus servicios para conectar la pasarela de datos."
          spacer height=8
          listitem "1. Endpoint API" subtitle="URL pública HTTPS" icon=globe
          listitem "2. Autenticación" subtitle="Token de seguridad Bearer" icon=key
          listitem "3. Timeout" subtitle="Tiempo de espera en ms" icon=clock

      right
        card elevated
          text "Credenciales del Servicio" title color=primary
          textfield endpoint label="URL del servicio" placeholder="https://api.tuempresa.com/v1" icon=globe
          textfield token label="Token de acceso" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." icon=lock type=password
          row spacing=16
            textfield timeout label="Timeout (ms)" placeholder="5000" type=number
            select region label="Región Cloud" options=["us-central1 (Iowa)", "southamerica-east1 (São Paulo)", "europe-west1 (Bélgica)"]
          switch ssl label="Forzar cifrado TLS 1.3" checked=true
          spacer height=12
          row spacing=12 justify=between
            button "Volver" text icon=arrow-left goto=@KiroSetup(step=1)
            button "Validar y Continuar" filled icon=check goto=@KiroSetup(step=3)

  step "Finalizado"
    card elevated
      text "¡Entorno Configurado con Éxito!" headline color=primary
      text "La conexión con los servicios ha sido verificada. Tu espacio de trabajo está listo para usarse."
      spacer height=16
      alert "Todas las credenciales fueron validadas y cifradas en el servidor." type=success title="Listo para Producción"
      spacer height=16
      row spacing=12
        button "Ir al Tablero Principal" filled icon=home goto=@Home
        button "Revisar Ajustes" outlined icon=settings goto=@KiroSetup(step=2)

@Home:screen
  card elevated
    row spacing=16 justify=between
      column spacing=4
        text "Bienvenido a Kiro Console" headline
        text "Resumen general de tus servicios y recursos activos"
      avatar name="Javier Diaz" size=lg
    divider
    grid cols=3 gap=16
      metric label="Servicios Activos" value="12/12" delta="+100% OK" icon=check-circle
      metric label="Peticiones / seg" value="4,820 req/s" delta="+14.2%" icon=trending-up
      metric label="Latencia Promedio" value="38 ms" delta="-12 ms" icon=zap
    spacer height=16
    row spacing=12
      button "Configurar Nuevo Servicio" filled icon=plus goto=@KiroSetup
      button "Ver Auditoría" tonal icon=file-text
`,
  },
  {
    id: "saas-analytics-dashboard",
    title: "SaaS Analytics & Operations Hub",
    category: "Dashboard",
    description: "Dashboard analítico con métricas clave, filtros por segmento, tabla de despliegues y diálogo de acción.",
    code: `@theme material3

@Dashboard:screen
  row spacing=16 justify=between
    column spacing=4
      text "Centro de Operaciones y Métricas" display color=primary
      text "Supervisión en tiempo real de transacciones, APIs y salud de infraestructura"
    row spacing=12
      button "Exportar Reporte" tonal icon=download
      button "Nuevo Despliegue" filled icon=rocket goto=@DeployModal

  spacer height=12

  row spacing=12
    chip "Últimos 30 días" variant=filter selected=true icon=calendar
    chip "Producción (PRD)" variant=filter selected=true icon=server
    chip "Latinoamérica" variant=filter
    chip "Filtrar Errores" variant=filter icon=alert-triangle

  spacer height=12

  grid cols=4 gap=16
    metric label="Ingresos Mensuales" value="$148,250" delta="+18.4%" icon=dollar-sign
    metric label="Usuarios Activos (MAU)" value="24,890" delta="+3,120 nuevos" icon=users
    metric label="Tasa de Conversión" value="4.82%" delta="+0.6%" icon=pie-chart
    metric label="Uptime del Sistema" value="99.98%" delta="Sin incidentes" icon=shield-check

  spacer height=16

  split
    left
      card elevated
        text "Alertas y Notificaciones" title
        listitem "Alta carga en base de datos" subtitle="Uso de CPU al 84% en replica-02" icon=alert-circle badge="Urgente"
        listitem "Certificado SSL renovado" subtitle="Válido hasta Agosto 2027" icon=check-circle badge="OK"
        listitem "Copia de seguridad completada" subtitle="Snapshot de 420 GB guardado" icon=database
        spacer height=8
        button "Ver todas las alertas" text icon=chevron-right

    right
      card elevated
        row spacing=16 justify=between
          text "Despliegues Recientes de Microservicios" title
          segmentedbutton entorno options=["Todos", "PRD", "QAS", "DEV"] selected="PRD"
        table columns=["Servicio", "Versión", "Rama", "Estado", "Acciones"] striped=true searchable=true
          row ["auth-gateway-service", "v2.4.1", "main", "Activo", "Configurar"]
          row ["payment-processor-node", "v1.9.0", "release/1.9", "Activo", "Configurar"]
          row ["notification-dispatcher", "v3.0.0-rc", "feat/push", "Pendiente", "Configurar"]
          row ["analytics-aggregator", "v2.1.2", "main", "Activo", "Configurar"]
          row ["audit-trail-logger", "v1.4.0", "hotfix/sync", "Inactivo", "Configurar"]

@DeployModal:dialog
  card elevated
    text "Confirmar Nuevo Despliegue" headline color=primary
    text "Estás a punto de desplegar la versión v2.4.0 en el clúster de PRODUCCIÓN."
    spacer height=12
    textfield releaseTag label="Versión de Release" placeholder="v2.4.0-stable"
    textarea deployNotes label="Notas del release / Changelog" rows=3 placeholder="Corrección de tipos de columna en MySQL y optimización de índices..."
    switch runMigrations label="Ejecutar migraciones automáticas de base de datos" checked=true
    switch notifySlack label="Notificar canal de ingeniería #ops-prod" checked=true
    spacer height=16
    row spacing=12 justify=end
      button "Cancelar" text goto=back
      button "Confirmar y Desplegar" filled icon=rocket goto=@Dashboard
`,
  },
  {
    id: "ecommerce-checkout",
    title: "E-Commerce Checkout & Summary",
    category: "E-Commerce",
    description: "Prototipo de compra con información de envío, selector de método de pago, resumen y cálculo de descuento.",
    code: `@theme material3

@Checkout:screen
  row spacing=12
    button "Volver a la Tienda" text icon=arrow-left goto=@Store
  
  text "Finalizar Compra" display color=primary
  text "Completa tus datos de envío y pago para procesar tu orden."

  spacer height=16

  split
    left
      column spacing=16
        card elevated
          text "1. Información de Envío" title
          grid cols=2 gap=16
            textfield nombres label="Nombres" placeholder="Javier"
            textfield apellidos label="Apellidos" placeholder="Díaz"
          autocomplete pais label="País de Residencia" placeholder="Escribe para buscar..."
            option "México"
            option "España"
            option "Colombia"
            option "Argentina"
            option "Chile"
            option "Perú"
            option "Costa Rica"
          textfield direccion label="Dirección de Entrega" placeholder="Av. Insurgentes Sur 1450, Depto 4B" icon=map-pin
          grid cols=3 gap=12
            textfield ciudad label="Ciudad" placeholder="Ciudad de México"
            textfield estado label="Estado / Región" placeholder="CDMX"
            textfield cp label="Código Postal" placeholder="03100" type=number
          datepicker fechaEntrega label="Fecha preferida de entrega"
          textfield telefono label="Teléfono de contacto" placeholder="+52 55 1234 5678" icon=phone

        card elevated
          text "2. Método de Pago y Envío" title
          text "Tipo de Entrega:" label
          row spacing=16
            radio envio_std label="Estándar (3-5 días) - Gratis" group="tipoEnvio" checked=true
            radio envio_exp label="Express 24h - $150 MXN" group="tipoEnvio"
          spacer height=8
          segmentedbutton metodoPago options=["Tarjeta de Crédito", "PayPal", "Apple Pay", "Transferencia SPEI"] selected="Tarjeta de Crédito"
          spacer height=8
          textfield numeroTarjeta label="Número de Tarjeta" placeholder="4532 •••• •••• 8821" icon=credit-card
          grid cols=2 gap=16
            textfield expiracion label="Vigencia (MM/AA)" placeholder="08/28"
            textfield cvv label="Código de Seguridad (CVV)" placeholder="821" type=password
          switch guardarTarjeta label="Guardar tarjeta para futuras compras seguras" checked=true

    right
      column spacing=16
        card elevated
          text "Resumen del Pedido (3 artículos)" title
          listitem "Laptop Pro Ultra 16\"" subtitle="32GB RAM / 1TB SSD • Cantidad: 1" badge="$1,899.00" icon=laptop
          listitem "Monitor 4K Ergonómico 27\"" subtitle="IPS / 144Hz • Cantidad: 1" badge="$450.00" icon=monitor
          listitem "Teclado Mecánico Inalámbrico" subtitle="Switches Brown • Cantidad: 1" badge="$120.00" icon=keyboard
          divider
          row spacing=12
            textfield cupon label="Código de Descuento" placeholder="PROMO2026"
            button "Aplicar" tonal
          divider
          row spacing=12 justify=between
            text "Subtotal"
            text "$2,469.00"
          row spacing=12 justify=between
            text "Descuento Especial (10%)" color=primary
            text "-$246.90" color=primary
          row spacing=12 justify=between
            text "Envío Express Prioritario"
            text "Gratis" color=primary
          row spacing=12 justify=between
            text "Total a Pagar (IVA incluido)" headline
            text "$2,222.10" headline color=primary
          spacer height=12
          button "Pagar $2,222.10" filled icon=shield-check goto=@OrderSuccess

@OrderSuccess:dialog
  card elevated
    text "¡Orden Confirmada con Éxito!" headline color=primary
    text "Tu orden #ORD-98421 ha sido procesada correctamente."
    alert "Te enviamos el comprobante y el número de guía a tu correo electrónico." type=success title="Pago Aprobado"
    spacer height=12
    button "Ver Detalle de la Orden" filled goto=@Checkout
`,
  },
  {
    id: "clinic-patient-intake",
    title: "Clínica: Admisión y Cita Médica",
    category: "Form",
    description: "Formulario integral de admisión clínica con validación de alergias, seguros y selección de especialista.",
    code: `@theme material3

@PatientIntake:form
  text "Registro de Paciente y Cita Médica" display color=primary
  text "Formulario de admisión para consulta con especialista. Evita omisiones de antecedentes clínicos."

  spacer height=16

  card elevated
    text "1. Datos Personales del Paciente" title
    grid cols=3 gap=16
      textfield nombreCompleto label="Nombre Completo" placeholder="Dra. Mariana Gomez" icon=user
      textfield curp label="Documento de Identidad / CURP" placeholder="GOMA850412HDF..."
      textfield fechaNac label="Fecha de Nacimiento" placeholder="12/04/1985" icon=calendar
    grid cols=2 gap=16
      textfield email label="Correo Electrónico" placeholder="mariana.gomez@gmail.com" icon=mail
      textfield telefono label="Teléfono Celular" placeholder="+52 55 9876 5432" icon=phone

  card elevated
    text "2. Antecedentes Médicos y Síntomas" title
    text "Selecciona los síntomas o condiciones que presenta actualmente:" label
    row spacing=8
      chip "Fiebre / Cefalea" variant=filter selected=true
      chip "Hipertensión" variant=filter
      chip "Diabetes" variant=filter
      chip "Alergias a Medicamentos" variant=filter selected=true
      chip "Cirugías Previas" variant=filter
    spacer height=8
    textarea alergiasDetalle label="Detalle de Alergias conocidas o Medicación actual" rows=3 placeholder="Alergia a la penicilina y sulfas. Tratamiento con levotiroxina 50mcg..."
    grid cols=2 gap=16
      slider dolorEscala label="Escala de Dolor (1 a 10)" min=1 max=10 value=3
      select especialidad label="Especialidad Médica Solicitada" options=["Medicina General", "Cardiología", "Dermatología", "Neurología", "Pediatría"]

  card elevated
    text "3. Seguro Médico y Términos" title
    switch tieneSeguro label="¿Cuenta con póliza de Gastos Médicos Mayores?" checked=true
    textfield aseguradora label="Nombre de la Aseguradora y No. de Póliza" placeholder="GNP Seguros - Póliza #984210"
    checkbox aceptoAviso label="He leído y acepto el Aviso de Privacidad y Consentimiento Informado" checked=true
    spacer height=12
    row spacing=12 justify=end
      button "Limpiar Formulario" text
      button "Agendar Cita Médica" filled icon=calendar-check goto=@IntakeConfirm

@IntakeConfirm:dialog
  card elevated
    text "Cita Agendada Exitosamente" headline color=primary
    text "Tu cita médica ha sido registrada con el Dr. Carlos Méndez para el 24 de Agosto a las 10:30 AM."
    spacer height=12
    row spacing=12
      button "Descargar Recordatorio PDF" tonal icon=download
      button "Cerrar" filled goto=@PatientIntake
`,
  },
  {
    id: "mobile-banking-transfer",
    title: "Banca Móvil & Transferencia Express",
    category: "Mobile",
    description: "Pantalla móvil optimizada para transferencias inmediatas con contactos frecuentes y límites dinámicos.",
    code: `@theme material3

@MobileWallet:screen
  card elevated
    row spacing=12 justify=between
      row spacing=8
        avatar name="Javier D." size=md
        column spacing=2
          text "Hola, Javier" title
          text "Cuenta Priority ••• 4190" label
      button "" tonal icon=bell

    spacer height=16
    text "Saldo Disponible" label
    text "$48,920.50 MXN" display color=primary
    row spacing=8
      chip "+$3,400 este mes" icon=trending-up selected=true
      chip "Rendimiento 12.5% anual" icon=shield

    spacer height=16
    row spacing=12
      button "Transferir" filled icon=send goto=@QuickTransfer
      button "Ingresar" tonal icon=plus
      button "Pagar Servicios" outlined icon=zap
      button "Retiro sin Tarjeta" text icon=smartphone

  spacer height=16
  card elevated
    row spacing=12 justify=between
      text "Movimientos Recientes" title
      button "Ver todos" text
    listitem "Transferencia a Carlos Méndez" subtitle="Hoy, 10:15 AM • SPEI" badge="-$1,250.00" icon=arrow-up-right
    listitem "Depósito de Nómina Quincenal" subtitle="Ayer, 08:00 AM • Empresa SA" badge="+$24,500.00" icon=arrow-down-left
    listitem "Suscripción Cloud Services" subtitle="18 Ago • Tarjeta Digital" badge="-$45.00" icon=credit-card

@QuickTransfer:sheet
  card elevated
    row spacing=12 justify=between
      text "Nueva Transferencia SPEI" headline color=primary
      button "" text icon=x goto=back
    
    text "Contactos Frecuentes:" label
    row spacing=12
      chip "Carlos M. (BBVA)" icon=user selected=true
      chip "Ana Sofía (Santander)" icon=user
      chip "Rodrigo P. (Banorte)" icon=user
      chip "+ Nuevo Contacto" icon=plus

    spacer height=12
    textfield cuentaDestino label="CLABE Interbancaria (18 dígitos) o Tarjeta" placeholder="012 180 01548291024 8" icon=hash
    textfield beneficiario label="Nombre del Beneficiario" placeholder="Carlos Méndez López"
    textfield monto label="Monto a Transferir ($ MXN)" placeholder="1500.00" type=number icon=dollar-sign
    textfield concepto label="Concepto de Pago" placeholder="Pago de honorarios desarrollo"
    
    spacer height=12
    slider limiteSeguridad label="Monto rápido" min=100 max=10000 value=1500
    
    spacer height=16
    row spacing=12 justify=between
      button "Cancelar" text goto=back
      button "Continuar Transferencia" filled icon=shield-check goto=@TransferSuccess

@TransferSuccess:dialog
  card elevated
    text "¡Transferencia Exitosa!" headline color=primary
    text "Se enviaron $1,500.00 MXN a Carlos Méndez con clave de rastreo SPEI #9842104."
    alert "El dinero ya está disponible en la cuenta del destinatario." type=success title="Operación Inmediata"
    spacer height=12
    button "Volver a la Billetera" filled goto=@MobileWallet
`,
  },
  {
    id: "saas-billing-support",
    title: "SaaS Portal: Facturación & Soporte M3",
    category: "Split View",
    description: "Portal enterprise completo con migas de pan (breadcrumbs), acordeones colapsables, FAB de nuevo ticket, snackbars y calificación CSAT.",
    code: `@theme material3

@FacturacionHub:screen
  breadcrumbs items=["Portal Clientes", "Acme Corporation", "Facturación & Suscripción"] separator=chevron
  
  snackbar "Factura #INV-2024-08 generada y enviada a tesorería@acme.com" action="Ver PDF" icon=check-circle-2 type=success goto=@FacturaDetalleModal
  
  row spacing=16 justify=between
    column spacing=4
      text "Gestión de Facturación y Servicios" display color=primary
      text "Administra tus datos fiscales, historial de cobros y tickets de soporte técnico"
    row spacing=12
      button "Descargar Todo (ZIP)" tonal icon=download
      button "Nuevo Ticket" filled icon=help-circle goto=@NuevoTicketModal

  spacer height=8

  grid cols=3 gap=16
    metric label="Plan Activo" value="Enterprise 24/7" delta="Renovación Sep 1" icon=shield
    metric label="Gasto Acumulado" value="$14,280 USD" delta="+8.2% vs prev" icon=dollar-sign
    metric label="SLA de Respuesta" value="12 mins" delta="Excelente" icon=zap

  spacer height=12

  split
    left
      card elevated
        text "Configuración de Cuenta" title
        text "Despliega cada sección para actualizar la información de tu empresa:" body
        
        accordion "1. Datos Fiscales y Razón Social" expanded=true icon=file-text badge="Requerido"
          textfield rfc label="RFC / Tax ID" placeholder="ACM890124-XX1" icon=hash
          textfield razonSocial label="Razón Social" placeholder="Acme International S.A. de C.V."
          select regimenFiscal label="Régimen Fiscal" options=["601 General de Ley Personas Morales", "626 Régimen Simplificado (RESICO)", "603 Personas Morales sin Fines Lucrativos"]
          button "Actualizar Datos Fiscales" tonal icon=save

        accordion "2. Contacto de Cobranza y Notificaciones" expanded=false icon=mail
          textfield emailCobranza label="Correo de Pagos" placeholder="facturacion@acme.com" icon=mail
          textfield telefono label="Teléfono de Contacto" placeholder="+52 55 1234 5678" icon=phone
          switch autoEnvio label="Enviar facturas XML y PDF en automático" checked=true

        accordion "3. Términos Legales y Contrato SLA" expanded=false icon=shield-check
          text "Tu contrato Enterprise tiene vigencia hasta el 31 de Diciembre de 2026." caption
          alert "Tu nivel de soporte incluye agente dedicado y tiempo de respuesta garantizado < 15 minutos." type=info

    right
      card elevated
        text "Historial de Facturas Emitidas" title
        table columns=["Factura ID", "Fecha", "Monto", "Estado", "Acción"] striped=true
          row ["#FAC-2026-089", "2026-08-15", "$4,850.00", "Pagado", "Descargar"]
          row ["#FAC-2026-074", "2026-07-15", "$4,850.00", "Pagado", "Descargar"]
          row ["#FAC-2026-061", "2026-06-15", "$3,920.00", "Pagado", "Descargar"]
          row ["#FAC-2026-048", "2026-05-15", "$3,920.00", "Pagado", "Descargar"]
        
        spacer height=12
        text "¿Cómo calificarías la atención de tu gestor de cuenta?" label
        rating satisfaccionCSAT label="Satisfacción del Cliente (CSAT)" value=5 max=5

  fab "Crear Nueva Factura" icon=plus extended=true goto=@FacturaDetalleModal

@FacturaDetalleModal:dialog
  card elevated
    text "Emisión de Nueva Factura" headline color=primary
    breadcrumbs items=["Facturas", "Nueva Emisión", "Borrador #1042"]
    textfield cliente label="Cliente / Receptor" placeholder="Acme Corporation" icon=user
    textfield monto label="Total a Facturar ($ USD)" placeholder="2450.00" type=number icon=dollar-sign
    select metodoPago label="Método de Pago" options=["PUE - Pago en una sola exhibición", "PPD - Pago en parcialidades o diferido"]
    textarea concepto label="Descripción del Servicio" rows=2 placeholder="Servicios de desarrollo Wisp UI y consultoría Cloud"
    row spacing=12 justify=between
      button "Cancelar" text goto=close
      button "Timbrar y Enviar Factura" filled icon=send goto=close

@NuevoTicketModal:modal
  card elevated
    text "Nuevo Ticket de Soporte Técnico" headline color=primary
    textfield asunto label="Asunto de la solicitud" placeholder="Duda sobre integración de Webhook"
    select prioridad label="Nivel de Prioridad" options=["Baja - Consulta general", "Media - Inconveniente parcial", "Crítica - Servicio interrumpido"]
    textarea detalle label="Descripción detallada" rows=3
    row spacing=12 justify=between
      button "Cerrar" text goto=close
      button "Enviar Solicitud" filled icon=send goto=close
`,
  },
  {
    id: "data-tables-and-tabs",
    title: "Data Hub: Tablas Dinámicas y Tabuladores M3",
    category: "Dashboard",
    description: "Muestra completa del poder de Wisp DSL para tablas con filas dinámicas, búsqueda, paginación y tabuladores por sección.",
    code: `@theme material3

@DataHub:screen
  row spacing=16 justify=between
    column spacing=4
      text "Centro de Control de Datos e Infraestructura" display color=primary
      text "Tablas dinámicas con búsqueda en tiempo real, estados automáticos y navegación por pestañas"
    row spacing=12
      button "Actualizar Datos" tonal icon=refresh-cw
      button "Nuevo Registro" filled icon=plus

  spacer height=12

  tabs items=["Microservicios", "Usuarios y Accesos", "Auditoría de Transacciones", "Ajustes"]
    tab "Microservicios"
      card elevated
        text "Estado de Servicios del Clúster" title
        table title="Inventario de Nodos Activos" columns=["ID:code", "Servicio:text", "Salud:progress", "Versión:code", "Estado:status", "Acción:action", "Opciones:dropdown"] striped=true searchable=true pageSize=4
          row ["#SRV-101", "Auth Identity Gateway", "98%", "v2.5.0", "Activo", "Configurar", ""]
          row ["#SRV-102", "Payment Settlement Engine", "85%", "v1.8.4", "Activo", "Configurar", ""]
          row ["#SRV-103", "Notification Worker SQS", "35%", "v3.0.0-beta", "Pendiente", "Configurar", ""]
          row ["#SRV-104", "Analytics Stream Sink", "100%", "v4.1.2", "Activo", "Configurar", ""]
          row ["#SRV-105", "Legacy Sync Bridge", "12%", "v0.9.1", "Inactivo", "Configurar", ""]
          row ["#SRV-106", "Search Indexer Service", "92%", "v2.2.0", "Activo", "Configurar", ""]

    tab "Usuarios y Accesos"
      card elevated
        text "Directorio de Miembros de la Organización" title
        table title="Usuarios Asignados" columns=["Miembro:avatar", "Correo:text", "Rol:status", "Último Acceso:date", "Acción:action", "Opciones:dropdown"] striped=true searchable=true
          row ["Javier Diaz", "javier@empresa.com", "Super Admin", "2026-08-20", "Editar", ""]
          row ["Elena Rodriguez", "elena@empresa.com", "DevOps Lead", "2026-08-19", "Editar", ""]
          row ["Carlos Mendoza", "carlos@empresa.com", "QA Engineer", "2026-08-15", "Editar", ""]
          row ["Sofia Castro", "sofia@empresa.com", "Security Lead", "2026-08-18", "Editar", ""]

    tab "Auditoría de Transacciones"
      card elevated
        text "Registro de Operaciones Recientes" title
        table columns=["Tx ID:code", "Fecha:date", "Monto:currency", "Método:text", "Resultado:status"] striped=true searchable=true
          | #TX-98412 | 2026-08-20 14:32 | $1,250.00 USD | Tarjeta Crédito | Activo |
          | #TX-98413 | 2026-08-20 14:35 | $480.00 USD   | SPEI Transfer   | Activo |
          | #TX-98414 | 2026-08-20 14:41 | $2,100.00 USD | PayPal API      | Pendiente |
          | #TX-98415 | 2026-08-20 14:45 | $95.00 USD    | Apple Pay       | Activo |

    tab "Ajustes"
      card elevated
        text "Parámetros del Tablero" title
        row spacing=16
          switch autoRefresh label="Refresco automático cada 30 segundos" checked=true
          switch notifyAlerts label="Alertas sonoras en caso de fallo" checked=false
        spacer height=12
        button "Guardar Preferencias" filled icon=save
`,
  },
];
