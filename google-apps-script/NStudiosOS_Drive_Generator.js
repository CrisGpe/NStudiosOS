/**
 * ==============================================================================
 * N. STUDIOS OS — GOOGLE DRIVE VAULT AUTO-GENERATOR
 * ==============================================================================
 * Este script crea físicamente la estructura jerárquica completa en tu Google Drive:
 * 
 * Mi unidad > NStudiosOS
 *    └── 🏢 Grupo Empresarial Gonzales
 *           ├── 🌿 Gloss Salon
 *           │      ├── 01_Estrategia_y_Territorios
 *           │      ├── 02_PreProduccion_Cronogramas (Crea la Hoja de Pre-Calendario)
 *           │      ├── 03_Rodajes_Master_Raw
 *           │      ├── 04_PostProduccion_Masters
 *           │      ├── 05_Proxies_Revision_Cliente
 *           │      └── 06_Entregables_Finales_Publicados
 *           ├── 🌿 Gonzales RD
 *           │      └── [6 Subcarpetas]
 *           ├── 🌿 Gonzales AM
 *           │      └── [6 Subcarpetas]
 *           └── 🌿 Luxury Salon
 *                  └── [6 Subcarpetas]
 * 
 * INSTRUCCIONES RÁPIDAS (1 Minuto):
 * 1. Entra a: https://script.google.com/home/start
 * 2. Haz clic en "+ Nuevo proyecto".
 * 3. Borra el código existente y pega este archivo completo.
 * 4. Arriba en el selector de función, asegúrate de que esté seleccionada "crearEstructuraNStudiosOS".
 * 5. Haz clic en "Ejecutar" (▶️ Run). Acepta los permisos de Google Drive cuando te los pida.
 * 6. ¡Listo! En 5 segundos todas las carpetas aparecerán en tu Google Drive dentro de NStudiosOS.
 * ==============================================================================
 */

function crearEstructuraNStudiosOS() {
  const NOMBRE_CARPETA_RAIZ = 'NStudiosOS';

  // 1. Obtener o Crear la carpeta raíz NStudiosOS
  let carpetaRaiz;
  const carpetasExistentes = DriveApp.getFoldersByName(NOMBRE_CARPETA_RAIZ);
  if (carpetasExistentes.hasNext()) {
    carpetaRaiz = carpetasExistentes.next();
    Logger.log('Carpeta raíz encontrada: ' + carpetaRaiz.getName());
  } else {
    carpetaRaiz = DriveApp.createFolder(NOMBRE_CARPETA_RAIZ);
    Logger.log('Carpeta raíz creada: ' + carpetaRaiz.getName());
  }

  // 2. Definición del Holding y sus Marcas
  const holdings = [
    {
      nombre: '🏢 Grupo Empresarial Gonzales',
      marcas: [
        { id: 'brd_apex', nombre: '🌿 Gloss Salon', industria: 'Belleza & Estilo' },
        { id: 'brd_lumina', nombre: '🌿 Gonzales RD', industria: 'Servicios Profesionales' },
        { id: 'brd_kuro', nombre: '🌿 Gonzales AM', industria: 'Comercial & Retail' },
        { id: 'brd_velox', nombre: '🌿 Luxury Salon', industria: 'Alta Cosmética' }
      ]
    }
  ];

  // 3. Taxonomía de las 6 Subcarpetas Operativas
  const subcarpetasEstandar = [
    '01_Estrategia_y_Territorios',
    '02_PreProduccion_Cronogramas',
    '03_Rodajes_Master_Raw',
    '04_PostProduccion_Masters',
    '05_Proxies_Revision_Cliente',
    '06_Entregables_Finales_Publicados'
  ];

  // 4. Crear estructura recursiva
  holdings.forEach(function(holding) {
    let carpetaHolding = obtenerOCrearSubcarpeta(carpetaRaiz, holding.nombre);
    Logger.log('Holding listo: ' + holding.nombre);

    holding.marcas.forEach(function(marca) {
      let carpetaMarca = obtenerOCrearSubcarpeta(carpetaHolding, marca.nombre);
      Logger.log('  -> Marca lista: ' + marca.nombre);

      subcarpetasEstandar.forEach(function(subNombre) {
        let subCarpeta = obtenerOCrearSubcarpeta(carpetaMarca, subNombre);

        // Crear Hoja de Cálculo oficial en 02_PreProduccion_Cronogramas
        if (subNombre === '02_PreProduccion_Cronogramas') {
          const nombreHoja = '01_Cronograma_PreCalendario_' + marca.nombre.replace(/[^a-zA-Z0-9]/g, '_');
          const archivosExistentes = subCarpeta.getFilesByName(nombreHoja);
          if (!archivosExistentes.hasNext()) {
            const hoja = SpreadsheetApp.create(nombreHoja);
            const sheet = hoja.getActiveSheet();
            sheet.setName('Pre-Calendario');
            
            // Encabezados
            sheet.appendRow([
              'Titulo', 'Territorio', 'Formato', 'Fecha_Rodaje_Inicio', 'Fecha_Rodaje_Fin', 'Fecha_Publicacion', 'Notas'
            ]);
            
            // Formato visual
            sheet.getRange(1, 1, 1, 7).setBackground('#4f46e5').setFontColor('#ffffff').setFontWeight('bold');
            
            // Ejemplos
            sheet.appendRow([
              'Reel Apertura de Mes - ADN ' + marca.nombre, 'Pilar 1 - Identidad', '9:16 Vertical Reel (45s)', '2026-09-05', '2026-09-07', '2026-09-10', 'Gancho inicial 0-3s'
            ]);
            sheet.appendRow([
              'Carrusel Educativo: 5 Tips', 'Pilar 2 - Educacion', '1:1 Feed Post (5 slides)', '2026-09-10', '2026-09-12', '2026-09-15', 'Paleta oficial'
            ]);

            // Mover la hoja creada dentro de la subcarpeta correspondiente
            const archivoHoja = DriveApp.getFileById(hoja.getId());
            subCarpeta.addFile(archivoHoja);
            DriveApp.getRootFolder().removeFile(archivoHoja);
            Logger.log('    ✓ Hoja de cronograma creada en ' + marca.nombre);
          }
        }
      });
    });
  });

  Logger.log('====================================================');
  Logger.log('🎉 ¡Estructura completa de NStudiosOS generada con éxito!');
  Logger.log('====================================================');
}

function obtenerOCrearSubcarpeta(carpetaPadre, nombreSubcarpeta) {
  const iterator = carpetaPadre.getFoldersByName(nombreSubcarpeta);
  if (iterator.hasNext()) {
    return iterator.next();
  }
  return carpetaPadre.createFolder(nombreSubcarpeta);
}
