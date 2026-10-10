-- =====================================================================
-- Observatorio Inmobiliario y Territorial Santa Cruz
-- Modelo de datos para PostgreSQL 15+ con PostGIS 3+
--
-- En el prototipo (Fase 2) los datos viven en archivos GeoJSON.
-- Este esquema se usa desde la Fase 4, cuando haya reportes ciudadanos,
-- varios usuarios o más de una comuna.
--
-- Geometrías en EPSG:4326 (lo que usa la web). Áreas y distancias se
-- calculan transformando a EPSG:9377 (MAGNA-SIRGAS 2018 / Origen Nacional).
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS postgis;

-- Tipo de dato: nunca se mezcla lo oficial con lo demostrativo.
CREATE TYPE tipo_dato AS ENUM ('oficial', 'tercero', 'campo', 'demostrativo');

CREATE TABLE fuente (
    id                  TEXT PRIMARY KEY,               -- ej. 'equipamientos'
    nombre              TEXT NOT NULL,
    entidad             TEXT NOT NULL,
    url_servicio        TEXT,
    consulta            TEXT,                           -- URL exacta usada en la descarga
    formato_origen      TEXT,
    cobertura           TEXT,
    licencia            TEXT,
    tipo                tipo_dato NOT NULL,
    fecha_descarga      TIMESTAMPTZ,
    ultima_actualizacion_en_datos DATE,
    estado              TEXT NOT NULL DEFAULT 'sin descargar'  -- ok | error | por verificar
);

-- --------------------------------------------------------------- territorio
CREATE TABLE comuna (
    codigo   TEXT PRIMARY KEY,                          -- '02'
    nombre   TEXT NOT NULL,
    geom     geometry(MultiPolygon, 4326) NOT NULL,
    fuente_id TEXT REFERENCES fuente(id)
);

CREATE TABLE barrio (
    codigo        TEXT PRIMARY KEY,                     -- '0201' ... '0211'
    comuna_codigo TEXT NOT NULL REFERENCES comuna(codigo),
    nombre        TEXT NOT NULL,
    geom          geometry(MultiPolygon, 4326) NOT NULL,
    fuente_id     TEXT REFERENCES fuente(id)
);

CREATE TABLE manzana (
    codigo_dane   TEXT PRIMARY KEY,
    barrio_codigo TEXT REFERENCES barrio(codigo),
    personas      INTEGER,
    viviendas     INTEGER,
    hogares       INTEGER,
    menores_10    INTEGER,
    mayores_60    INTEGER,
    anio_censo    SMALLINT NOT NULL DEFAULT 2018,
    geom          geometry(MultiPolygon, 4326) NOT NULL,
    fuente_id     TEXT REFERENCES fuente(id)
);

-- --------------------------------------------------- equipamientos y espacio
CREATE TABLE equipamiento (
    id            BIGSERIAL PRIMARY KEY,
    nombre        TEXT,
    grupo         TEXT,          -- Educación, Salud, Deporte y recreación, Cultura, Primera infancia...
    categoria     TEXT,          -- categoría oficial de la fuente
    regla_grupo   TEXT,          -- cómo se asignó el grupo (oficial o regla por nombre)
    barrio_codigo TEXT REFERENCES barrio(codigo),
    geom          geometry(Geometry, 4326) NOT NULL,
    fuente_id     TEXT NOT NULL REFERENCES fuente(id),
    tipo_dato     tipo_dato NOT NULL
);

CREATE TABLE espacio_publico (
    id            BIGSERIAL PRIMARY KEY,
    nombre        TEXT,
    categoria     TEXT,
    subcategoria  TEXT,
    situacion     TEXT NOT NULL CHECK (situacion IN ('existente', 'proyectado')),
    barrio_codigo TEXT REFERENCES barrio(codigo),
    geom          geometry(MultiPolygon, 4326) NOT NULL,
    fuente_id     TEXT NOT NULL REFERENCES fuente(id),
    tipo_dato     tipo_dato NOT NULL
);

CREATE TABLE estacion_transporte (
    id        BIGSERIAL PRIMARY KEY,
    nombre    TEXT NOT NULL,
    linea     TEXT,
    modo      TEXT,              -- Metro, Metrocable, Metroplús / bus
    geom      geometry(Point, 4326) NOT NULL,
    fuente_id TEXT NOT NULL REFERENCES fuente(id)
);

-- ------------------------------------------------------------ red peatonal
-- Cada tramo sabe de dónde vino y qué tan completo está.
CREATE TABLE tramo_red (
    id               BIGSERIAL PRIMARY KEY,
    tipo             TEXT NOT NULL,     -- calle, andén, escalera, sendero, puente peatonal
    nombre           TEXT,
    longitud_m       NUMERIC,
    pendiente_pct    NUMERIC,           -- calculada con elevación (Fase 3)
    ancho_anden_m    NUMERIC,           -- levantado en campo
    estado           TEXT,              -- bueno, regular, malo, sin dato
    accesible_silla  BOOLEAN,           -- sin dato = NULL
    geom             geometry(LineString, 4326) NOT NULL,
    fuente_id        TEXT NOT NULL REFERENCES fuente(id),
    tipo_dato        tipo_dato NOT NULL,
    fecha_levantamiento DATE
);

-- --------------------------------------------------------------------- POT
CREATE TABLE zona_pot (
    id          BIGSERIAL PRIMARY KEY,
    capa        TEXT NOT NULL,   -- tratamiento, amenaza_movimiento_masa, riesgo_no_mitigable, instrumento
    codigo      TEXT,            -- ej. Z1_CN2_2
    valor       TEXT,            -- ej. 'Consolidación Nivel 2', 'Alta'
    atributos   JSONB,           -- densidad máxima, índice de construcción, altura...
    geom        geometry(MultiPolygon, 4326) NOT NULL,
    fuente_id   TEXT NOT NULL REFERENCES fuente(id)
);

-- --------------------------------------------------------- seguridad vial
CREATE TABLE siniestro_vial (
    id        BIGSERIAL PRIMARY KEY,
    fecha     DATE,
    anio      SMALLINT,
    clase     TEXT,
    gravedad  TEXT,
    barrio_codigo TEXT REFERENCES barrio(codigo),
    geom      geometry(Point, 4326) NOT NULL,
    fuente_id TEXT NOT NULL REFERENCES fuente(id)
);

-- ------------------------------------------------------------- inmobiliario
-- Solo precios observados con su fecha. Nunca avalúos inventados.
CREATE TABLE oferta_inmobiliaria (
    id          BIGSERIAL PRIMARY KEY,
    operacion   TEXT,            -- Venta, Arriendo
    inmueble    TEXT,
    precio      NUMERIC,
    area_m2     NUMERIC,
    estrato     SMALLINT,
    anio        SMALLINT,
    barrio_codigo TEXT REFERENCES barrio(codigo),
    geom        geometry(Point, 4326) NOT NULL,
    fuente_id   TEXT NOT NULL REFERENCES fuente(id)
);

-- --------------------------------------------------------- intervenciones
CREATE TABLE intervencion (
    id           BIGSERIAL PRIMARY KEY,
    tipo         TEXT NOT NULL,   -- andén, escalera, puente peatonal, cruce, conexión a estación, parque...
    nombre       TEXT NOT NULL,
    descripcion  TEXT,
    origen       TEXT NOT NULL,   -- POT, comunidad, análisis del observatorio
    barrio_codigo TEXT REFERENCES barrio(codigo),
    geom         geometry(Geometry, 4326) NOT NULL,
    fuente_id    TEXT REFERENCES fuente(id),
    tipo_dato    tipo_dato NOT NULL,
    creada       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cada puntaje queda guardado con sus partes y la versión del modelo,
-- para poder explicar por qué una obra quedó arriba o abajo.
CREATE TABLE puntaje_intervencion (
    intervencion_id  BIGINT REFERENCES intervencion(id) ON DELETE CASCADE,
    version_modelo   TEXT NOT NULL,
    criterio         TEXT NOT NULL,      -- personas_beneficiadas, deficit_accesibilidad, ...
    valor_original   NUMERIC,
    valor_normalizado NUMERIC CHECK (valor_normalizado BETWEEN 0 AND 1),
    peso             NUMERIC NOT NULL,
    calculado        TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (intervencion_id, version_modelo, criterio)
);

-- --------------------------------------------------- participación ciudadana
-- Sin nombre, cédula ni teléfono. Si se pide registro, se guarda un
-- identificador cifrado (hash con sal) que no permite saber quién es.
CREATE TYPE estado_reporte AS ENUM ('recibido', 'en_revision', 'validado', 'atendido', 'descartado');

CREATE TABLE reporte_ciudadano (
    id            BIGSERIAL PRIMARY KEY,
    categoria     TEXT NOT NULL,   -- anden_danado, punto_peligroso, barrera_discapacidad, movilidad,
                                   -- parque_deteriorado, nueva_conexion
    descripcion   TEXT NOT NULL CHECK (char_length(descripcion) BETWEEN 10 AND 1000),
    geom          geometry(Point, 4326) NOT NULL,
    barrio_codigo TEXT REFERENCES barrio(codigo),
    estado        estado_reporte NOT NULL DEFAULT 'recibido',
    autor_hash    TEXT,            -- opcional
    posible_duplicado_de BIGINT REFERENCES reporte_ciudadano(id),
    creado        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE estado_reporte_historial (
    id          BIGSERIAL PRIMARY KEY,
    reporte_id  BIGINT NOT NULL REFERENCES reporte_ciudadano(id) ON DELETE CASCADE,
    estado      estado_reporte NOT NULL,
    nota        TEXT,
    cambiado    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE apoyo_intervencion (
    intervencion_id BIGINT NOT NULL REFERENCES intervencion(id) ON DELETE CASCADE,
    autor_hash      TEXT NOT NULL,
    creado          TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (intervencion_id, autor_hash)   -- un apoyo por persona y obra
);

-- ------------------------------------------------------------------ índices
CREATE INDEX ON barrio USING gist (geom);
CREATE INDEX ON manzana USING gist (geom);
CREATE INDEX ON equipamiento USING gist (geom);
CREATE INDEX ON espacio_publico USING gist (geom);
CREATE INDEX ON estacion_transporte USING gist (geom);
CREATE INDEX ON tramo_red USING gist (geom);
CREATE INDEX ON zona_pot USING gist (geom);
CREATE INDEX ON siniestro_vial USING gist (geom);
CREATE INDEX ON oferta_inmobiliaria USING gist (geom);
CREATE INDEX ON intervencion USING gist (geom);
CREATE INDEX ON reporte_ciudadano USING gist (geom);
CREATE INDEX ON reporte_ciudadano (estado);

-- Ejemplo: detectar un posible duplicado (misma categoría, a menos de 30 m, últimas 72 horas).
-- SELECT id FROM reporte_ciudadano r
--  WHERE r.categoria = :categoria
--    AND r.creado > now() - interval '72 hours'
--    AND ST_DWithin(ST_Transform(r.geom, 9377), ST_Transform(ST_SetSRID(ST_Point(:lon, :lat), 4326), 9377), 30);
