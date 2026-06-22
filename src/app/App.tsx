import { useState, useCallback, useEffect } from "react";
import type { ReactElement, ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Building2, Plus, Pencil, PowerOff, X, CheckCircle2, AlertTriangle, XCircle,
  Search, ChevronRight, MapPin, Layers, Users, LayoutGrid, Bell, LogOut,
  ChevronDown, Minus, Hash, AlignLeft, Home, FileText, Clock, Package,
  UserCheck, UserMinus, RefreshCw, Smartphone, TrendingUp,
  ArrowUpRight, KeyRound, ClipboardList, Car, Warehouse, Percent,
  BadgeAlert, Eye, EyeOff, Mail, Lock, ShieldCheck as ShieldFill,
  HelpCircle, BookOpen, Zap, BarChart3, ChevronUp, ArrowRight,
} from "lucide-react";
import { clsx } from "clsx";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

type Status        = "Activa" | "Inactiva";
type ToastType     = "success" | "error" | "warning";
type Module        = "dashboard" | "comunidades" | "torres" | "bloques" | "propiedades" | "ocupantes" | "ayuda";
type AppPhase      = "splash" | "login";
type AuthRole      = "operaciones" | "admin_comunidad";
type ResidentTab   = "unidad" | "estructura" | "solicitudes";
type OccupancyT    = "Ocupada" | "Desocupada" | "Reservada";
type PropType      = "Departamento" | "Bodega" | "Estacionamiento";
type OccupantRole  = "Propietario" | "Arrendatario" | "Familiar";
type TimelineKind  = "ingreso" | "salida" | "renovacion" | "modificacion";

interface Community  { id: number; name: string; address: string; rut: string; towers: number; units: number; floors: number; status: Status; }
interface Tower      { id: number; communityId: number; name: string; floors: number; description: string; status: Status; }
interface Block      { id: number; communityId: number; towerId: number; name: string; description: string; floorStart: number; floorEnd: number; units: number; status: Status; }
interface Property   { id: number; communityId: number; towerId: number; blockId: number; code: string; type: PropType; floor: number; area: number; prorrateo: number; occupancy: OccupancyT; status: Status; }
interface Occupant   { id: number; propertyId: number; name: string; rut: string; email: string; phone: string; role: OccupantRole; since: string; status: "Activo" | "Inactivo"; }
interface TimelineEv { id: number; propertyId: number; date: string; kind: TimelineKind; title: string; description: string; actor: string; }
interface ToastItem  { id: string; type: ToastType; title: string; message: string; }

// ═══════════════════════════════════════════════════════════════════════════════
// SEED DATA
// ═══════════════════════════════════════════════════════════════════════════════

const COMMUNITIES: Community[] = [
  { id: 1, name: "Edificio Mirador Norte",  address: "Av. Apoquindo 4500, Las Condes",      rut: "76.123.456-7", towers: 3, units: 13, floors: 18, status: "Activa"   },
  { id: 2, name: "Condominio Los Arrayanes",address: "Calle Los Castaños 890, Vitacura",     rut: "76.234.567-8", towers: 2, units:  8, floors: 12, status: "Activa"   },
  { id: 3, name: "Residencial El Bosque",   address: "Av. Kennedy 7800, Vitacura",           rut: "76.345.678-9", towers: 1, units:  6, floors:  8, status: "Inactiva" },
  { id: 4, name: "Torre Panorámica Sur",    address: "Av. Vicuña Mackenna 2300, Ñuñoa",      rut: "76.456.789-0", towers: 1, units:  7, floors: 22, status: "Activa"   },
  { id: 5, name: "Conjunto Las Lilas",      address: "Los Militares 5890, Las Condes",       rut: "76.567.890-1", towers: 1, units:  6, floors: 15, status: "Activa"   },
];

const TOWERS: Tower[] = [
  { id: 1, communityId: 1, name: "Torre A",        floors: 18, description: "Torre principal, acceso a piscina y estacionamiento cubierto.", status: "Activa"   },
  { id: 2, communityId: 1, name: "Torre B",        floors: 18, description: "Torre secundaria orientada al parque, salón de eventos.",        status: "Activa"   },
  { id: 3, communityId: 1, name: "Torre C",        floors: 16, description: "Torre de uso mixto, residencial en pisos superiores.",            status: "Inactiva" },
  { id: 4, communityId: 2, name: "Torre Norte",    floors: 12, description: "Bloque norte con vista al cerro, 6 unidades por piso.",           status: "Activa"   },
  { id: 5, communityId: 2, name: "Torre Sur",      floors: 12, description: "Bloque sur con acceso directo al lobby y conserjería.",           status: "Activa"   },
  { id: 6, communityId: 4, name: "Torre Principal",floors: 22, description: "Torre de altura con áreas comunes en piso 20.",                   status: "Activa"   },
  { id: 7, communityId: 5, name: "Bloque I",       floors: 15, description: "Primera etapa del conjunto, uso residencial familiar.",            status: "Activa"   },
  { id: 8, communityId: 3, name: "Torre Única",    floors:  8, description: "Estructura residencial única de la comunidad. 4 unidades por piso.", status: "Activa" },
];

const BLOCKS: Block[] = [
  { id: 1, communityId: 1, towerId: 1, name: "Bloque 1 — Pisos 1–6", description: "Sector bajo con conserjería, salón de reuniones y acceso a estacionamiento cubierto.", floorStart: 1, floorEnd: 6, units: 24, status: "Activa" },
  { id: 2, communityId: 1, towerId: 1, name: "Bloque 2 — Pisos 7–12", description: "Sector medio. 4 departamentos por piso, orientación norponiente.", floorStart: 7, floorEnd: 12, units: 24, status: "Activa" },
  { id: 3, communityId: 1, towerId: 1, name: "Bloque 3 — Pisos 13–18", description: "Sector alto con terraza comunitaria en piso 18 y vista panorámica.", floorStart: 13, floorEnd: 18, units: 24, status: "Activa" },
  { id: 4, communityId: 1, towerId: 2, name: "Bloque Norte", description: "Sector norte de la Torre B. Acceso independiente por calle lateral.", floorStart: 1, floorEnd: 9, units: 18, status: "Activa" },
  { id: 5, communityId: 1, towerId: 2, name: "Bloque Sur", description: "Sector sur de la Torre B. Actualmente en proceso de mantención estructural.", floorStart: 10, floorEnd: 18, units: 18, status: "Inactiva" },
  { id: 6, communityId: 2, towerId: 4, name: "Bloque Único", description: "Torre Norte sin subdivisión de bloques. Gestión centralizada desde conserjería.", floorStart: 1, floorEnd: 12, units: 48, status: "Activa" },
  { id: 7, communityId: 4, towerId: 6, name: "Bloque Residencial",   description: "Única división estructural de la Torre Principal. 68 unidades distribuidas en 22 pisos.", floorStart: 1,  floorEnd: 22, units: 68, status: "Activa" },
  { id: 8, communityId: 3, towerId: 8, name: "Bloque Principal",    description: "Bloque único de la Torre Única. 4 departamentos por piso con bodega y estacionamiento.", floorStart: 1, floorEnd: 8,  units: 32, status: "Activa" },
  { id: 9, communityId: 2, towerId: 5, name: "Bloque Único",        description: "Torre Sur sin subdivisión interna. Acceso directo desde lobby central.",                  floorStart: 1, floorEnd: 12, units: 36, status: "Activa" },
  { id: 10, communityId: 5, towerId: 7, name: "Sector Residencial", description: "Sector principal del Bloque I. Incluye áreas verdes en primer piso.",                    floorStart: 1, floorEnd: 15, units: 60, status: "Activa" },
];

const PROPERTIES: Property[] = [
  // ── Edificio Mirador Norte · Torre A · Bloque 1 (pisos 1–6) ──────────────
  { id:  1, communityId: 1, towerId: 1, blockId: 1, code: "A-101", type: "Departamento",    floor:  1, area:  72, prorrateo: 1.42, occupancy: "Ocupada",    status: "Activa"   },
  { id:  2, communityId: 1, towerId: 1, blockId: 1, code: "A-102", type: "Departamento",    floor:  1, area:  65, prorrateo: 1.28, occupancy: "Ocupada",    status: "Activa"   },
  { id:  3, communityId: 1, towerId: 1, blockId: 1, code: "A-201", type: "Departamento",    floor:  2, area:  80, prorrateo: 1.58, occupancy: "Desocupada", status: "Activa"   },
  { id:  4, communityId: 1, towerId: 1, blockId: 1, code: "A-B01", type: "Bodega",          floor: -1, area:  12, prorrateo: 0.24, occupancy: "Ocupada",    status: "Activa"   },
  // ── Edificio Mirador Norte · Torre A · Bloque 2 (pisos 7–12) ─────────────
  { id:  5, communityId: 1, towerId: 1, blockId: 2, code: "A-701", type: "Departamento",    floor:  7, area:  90, prorrateo: 1.77, occupancy: "Reservada",  status: "Activa"   },
  { id:  6, communityId: 1, towerId: 1, blockId: 2, code: "A-702", type: "Departamento",    floor:  7, area:  90, prorrateo: 1.77, occupancy: "Ocupada",    status: "Activa"   },
  { id:  7, communityId: 1, towerId: 1, blockId: 2, code: "A-E01", type: "Estacionamiento", floor: -1, area:  15, prorrateo: 0.30, occupancy: "Ocupada",    status: "Activa"   },
  // ── Condominio Los Arrayanes · Torre Norte · Bloque Único ─────────────────
  { id:  8, communityId: 2, towerId: 4, blockId: 6, code: "N-301", type: "Departamento",    floor:  3, area:  68, prorrateo: 1.35, occupancy: "Ocupada",    status: "Activa"   },
  { id:  9, communityId: 2, towerId: 4, blockId: 6, code: "N-302", type: "Departamento",    floor:  3, area:  68, prorrateo: 1.35, occupancy: "Desocupada", status: "Inactiva" },
  // ── Edificio Mirador Norte · Torre B · Bloque Norte ──────────────────────
  { id: 10, communityId: 1, towerId: 2, blockId: 4, code: "B-101", type: "Departamento",    floor:  1, area:  78, prorrateo: 1.54, occupancy: "Ocupada",    status: "Activa"   },
  { id: 11, communityId: 1, towerId: 2, blockId: 4, code: "B-102", type: "Departamento",    floor:  1, area:  72, prorrateo: 1.42, occupancy: "Desocupada", status: "Activa"   },
  { id: 12, communityId: 1, towerId: 2, blockId: 4, code: "B-201", type: "Departamento",    floor:  2, area:  85, prorrateo: 1.68, occupancy: "Ocupada",    status: "Activa"   },
  { id: 13, communityId: 1, towerId: 2, blockId: 4, code: "B-301", type: "Departamento",    floor:  3, area:  90, prorrateo: 1.78, occupancy: "Reservada",  status: "Activa"   },
  { id: 14, communityId: 1, towerId: 2, blockId: 4, code: "B-B01", type: "Bodega",          floor: -1, area:  10, prorrateo: 0.20, occupancy: "Ocupada",    status: "Activa"   },
  { id: 15, communityId: 1, towerId: 2, blockId: 4, code: "B-E01", type: "Estacionamiento", floor: -1, area:  15, prorrateo: 0.30, occupancy: "Desocupada", status: "Activa"   },
  // ── Condominio Los Arrayanes · Torre Sur · Bloque Único ──────────────────
  { id: 16, communityId: 2, towerId: 5, blockId: 9, code: "S-101", type: "Departamento",    floor:  1, area:  68, prorrateo: 1.35, occupancy: "Ocupada",    status: "Activa"   },
  { id: 17, communityId: 2, towerId: 5, blockId: 9, code: "S-102", type: "Departamento",    floor:  1, area:  68, prorrateo: 1.35, occupancy: "Desocupada", status: "Activa"   },
  { id: 18, communityId: 2, towerId: 5, blockId: 9, code: "S-201", type: "Departamento",    floor:  2, area:  72, prorrateo: 1.42, occupancy: "Ocupada",    status: "Activa"   },
  { id: 19, communityId: 2, towerId: 5, blockId: 9, code: "S-501", type: "Departamento",    floor:  5, area:  76, prorrateo: 1.50, occupancy: "Reservada",  status: "Activa"   },
  { id: 20, communityId: 2, towerId: 5, blockId: 9, code: "S-B01", type: "Bodega",          floor: -1, area:   9, prorrateo: 0.18, occupancy: "Ocupada",    status: "Activa"   },
  { id: 21, communityId: 2, towerId: 5, blockId: 9, code: "S-E01", type: "Estacionamiento", floor: -1, area:  14, prorrateo: 0.28, occupancy: "Desocupada", status: "Activa"   },
  // ── Residencial El Bosque · Torre Única · Bloque Principal ───────────────
  { id: 22, communityId: 3, towerId: 8, blockId: 8, code: "U-101", type: "Departamento",    floor:  1, area:  62, prorrateo: 1.24, occupancy: "Ocupada",    status: "Activa"   },
  { id: 23, communityId: 3, towerId: 8, blockId: 8, code: "U-102", type: "Departamento",    floor:  1, area:  58, prorrateo: 1.16, occupancy: "Desocupada", status: "Activa"   },
  { id: 24, communityId: 3, towerId: 8, blockId: 8, code: "U-201", type: "Departamento",    floor:  2, area:  65, prorrateo: 1.30, occupancy: "Ocupada",    status: "Activa"   },
  { id: 25, communityId: 3, towerId: 8, blockId: 8, code: "U-401", type: "Departamento",    floor:  4, area:  68, prorrateo: 1.36, occupancy: "Reservada",  status: "Activa"   },
  { id: 26, communityId: 3, towerId: 8, blockId: 8, code: "U-B01", type: "Bodega",          floor: -1, area:   8, prorrateo: 0.16, occupancy: "Ocupada",    status: "Activa"   },
  { id: 27, communityId: 3, towerId: 8, blockId: 8, code: "U-E01", type: "Estacionamiento", floor: -1, area:  13, prorrateo: 0.26, occupancy: "Desocupada", status: "Activa"   },
  // ── Torre Panorámica Sur · Torre Principal · Bloque Residencial ──────────
  { id: 28, communityId: 4, towerId: 6, blockId: 7, code: "P-101", type: "Departamento",    floor:  1, area:  85, prorrateo: 1.69, occupancy: "Ocupada",    status: "Activa"   },
  { id: 29, communityId: 4, towerId: 6, blockId: 7, code: "P-102", type: "Departamento",    floor:  1, area:  80, prorrateo: 1.59, occupancy: "Desocupada", status: "Activa"   },
  { id: 30, communityId: 4, towerId: 6, blockId: 7, code: "P-501", type: "Departamento",    floor:  5, area:  92, prorrateo: 1.83, occupancy: "Ocupada",    status: "Activa"   },
  { id: 31, communityId: 4, towerId: 6, blockId: 7, code: "P-B01", type: "Bodega",          floor: -1, area:  11, prorrateo: 0.22, occupancy: "Ocupada",    status: "Activa"   },
  { id: 32, communityId: 4, towerId: 6, blockId: 7, code: "P-E01", type: "Estacionamiento", floor: -1, area:  16, prorrateo: 0.32, occupancy: "Reservada",  status: "Activa"   },
  { id: 33, communityId: 4, towerId: 6, blockId: 7, code: "P-E02", type: "Estacionamiento", floor: -1, area:  16, prorrateo: 0.32, occupancy: "Desocupada", status: "Activa"   },
  { id: 34, communityId: 4, towerId: 6, blockId: 7, code: "P-1501",type: "Departamento",    floor: 15, area: 105, prorrateo: 1.99, occupancy: "Ocupada",    status: "Activa"   },
  // ── Conjunto Las Lilas · Bloque I · Sector Residencial ───────────────────
  { id: 35, communityId: 5, towerId: 7, blockId: 10, code: "L-101", type: "Departamento",    floor:  1, area:  70, prorrateo: 1.39, occupancy: "Ocupada",    status: "Activa"   },
  { id: 36, communityId: 5, towerId: 7, blockId: 10, code: "L-102", type: "Departamento",    floor:  1, area:  70, prorrateo: 1.39, occupancy: "Desocupada", status: "Activa"   },
  { id: 37, communityId: 5, towerId: 7, blockId: 10, code: "L-201", type: "Departamento",    floor:  2, area:  75, prorrateo: 1.49, occupancy: "Ocupada",    status: "Activa"   },
  { id: 38, communityId: 5, towerId: 7, blockId: 10, code: "L-751", type: "Departamento",    floor:  7, area:  80, prorrateo: 1.59, occupancy: "Reservada",  status: "Activa"   },
  { id: 39, communityId: 5, towerId: 7, blockId: 10, code: "L-B01", type: "Bodega",          floor: -1, area:   9, prorrateo: 0.18, occupancy: "Ocupada",    status: "Activa"   },
  { id: 40, communityId: 5, towerId: 7, blockId: 10, code: "L-E01", type: "Estacionamiento", floor: -1, area:  14, prorrateo: 0.28, occupancy: "Desocupada", status: "Activa"   },
];

const OCCUPANTS: Occupant[] = [
  // Edificio Mirador Norte — A-101
  { id: 1, propertyId:  1, name: "Valentina Herrera Soto",  rut: "12.345.678-9", email: "v.herrera@email.cl", phone: "+56 9 8765 4321", role: "Propietario",  since: "2021-03-15", status: "Activo" },
  { id: 2, propertyId:  1, name: "Rodrigo Herrera Mora",    rut: "13.456.789-0", email: "r.herrera@email.cl", phone: "+56 9 8765 4322", role: "Familiar",     since: "2021-03-15", status: "Activo" },
  // Edificio Mirador Norte — A-102
  { id: 3, propertyId:  2, name: "Carlos Mendoza Pérez",    rut: "14.567.890-1", email: "c.mendoza@email.cl", phone: "+56 9 7654 3210", role: "Arrendatario", since: "2023-08-01", status: "Activo" },
  // Edificio Mirador Norte — A-702
  { id: 4, propertyId:  6, name: "Andrea López Fuentes",    rut: "15.678.901-2", email: "a.lopez@email.cl",   phone: "+56 9 6543 2109", role: "Propietario",  since: "2020-11-20", status: "Activo" },
  // Condominio Los Arrayanes — N-301
  { id: 5, propertyId:  8, name: "Felipe Rojas Contreras",  rut: "16.789.012-3", email: "f.rojas@email.cl",   phone: "+56 9 5432 1098", role: "Arrendatario", since: "2024-01-10", status: "Activo" },
  // Torre Panorámica Sur — P-101
  { id: 6, propertyId: 28, name: "Cristóbal Araya Vega",    rut: "17.890.123-4", email: "c.araya@email.cl",   phone: "+56 9 4321 0987", role: "Propietario",  since: "2022-04-15", status: "Activo" },
  // Torre Panorámica Sur — P-1501
  { id: 7, propertyId: 34, name: "Daniela Morales Ríos",    rut: "18.901.234-5", email: "d.morales@email.cl", phone: "+56 9 3210 9876", role: "Propietario",  since: "2023-09-20", status: "Activo" },
  // Torre Panorámica Sur — P-501
  { id: 8, propertyId: 30, name: "Sebastián Fuentes Palma", rut: "19.012.345-6", email: "s.fuentes@email.cl", phone: "+56 9 2109 8765", role: "Arrendatario", since: "2024-03-01", status: "Activo" },
];

const TIMELINE: TimelineEv[] = [
  // A-101 history
  { id:  1, propertyId:  1, date: "15 Mar 2021", kind: "ingreso",      title: "Ingreso de propietaria",        description: "Valentina Herrera Soto ingresa como propietaria. Documentación completa recibida.", actor: "Adm. Juan Soto" },
  { id:  2, propertyId:  1, date: "20 Mar 2021", kind: "modificacion", title: "Registro de familiar",          description: "Se agrega a Rodrigo Herrera como familiar conviviente en la unidad A-101.", actor: "Adm. Juan Soto" },
  { id:  3, propertyId:  1, date: "14 Mar 2022", kind: "renovacion",   title: "Renovación anual",              description: "Validación de datos de contacto y documentos de propiedad al día.", actor: "Sistema Automático" },
  { id:  4, propertyId:  1, date: "01 Ago 2022", kind: "modificacion", title: "Actualización de contacto",     description: "Teléfono principal actualizado a +56 9 8765 4321.", actor: "Valentina Herrera" },
  { id:  5, propertyId:  1, date: "14 Mar 2023", kind: "renovacion",   title: "Renovación anual",              description: "Tercera revisión anual completada sin observaciones.", actor: "Sistema Automático" },
  { id:  6, propertyId:  1, date: "22 Jun 2024", kind: "modificacion", title: "Solicitud de estacionamiento",  description: "Asignación del estacionamiento A-E02 aprobada por administración.", actor: "Adm. Carlos Vera" },
  // P-101 history (Torre Panorámica Sur)
  { id:  7, propertyId: 28, date: "15 Abr 2022", kind: "ingreso",      title: "Ingreso de propietario",        description: "Cristóbal Araya Vega ingresa como propietario. Escritura inscrita ante notario.", actor: "Adm. Rosa Pérez" },
  { id:  8, propertyId: 28, date: "15 Abr 2023", kind: "renovacion",   title: "Renovación anual",              description: "Revisión de documentos y datos de contacto. Sin observaciones.", actor: "Sistema Automático" },
  // P-501 history (Torre Panorámica Sur)
  { id:  9, propertyId: 30, date: "01 Mar 2024", kind: "ingreso",      title: "Ingreso de arrendatario",       description: "Sebastián Fuentes Palma ingresa en arriendo por 24 meses. Contrato firmado ante notario.", actor: "Adm. Carlos Vera" },
  { id: 10, propertyId: 30, date: "15 Mar 2024", kind: "modificacion", title: "Registro de datos bancarios",   description: "Domiciliación bancaria para gastos comunes registrada correctamente.", actor: "Adm. Carlos Vera" },
  // P-1501 history (Torre Panorámica Sur)
  { id: 11, propertyId: 34, date: "20 Sep 2023", kind: "ingreso",      title: "Ingreso de propietaria",        description: "Daniela Morales Ríos ingresa al penthouse P-1501 (piso 15). Llaves y accesos entregados.", actor: "Adm. Rosa Pérez" },
  { id: 12, propertyId: 34, date: "20 Sep 2024", kind: "renovacion",   title: "Renovación anual",              description: "Primera revisión anual. Documentos vigentes. Contribuciones al día.", actor: "Sistema Automático" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════════════════════════════

function uid() { return Math.random().toString(36).slice(2, 9); }

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED UI PRIMITIVES
// ═══════════════════════════════════════════════════════════════════════════════

function StatusBadge({ status }: { status: Status }) {
  const on = status === "Activa";
  return (
    <span className={clsx("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium font-mono tracking-wide select-none", on ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200" : "bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-200")}>
      <span className={clsx("w-1.5 h-1.5 rounded-full", on ? "bg-emerald-500" : "bg-slate-400")} />{status}
    </span>
  );
}

const OCC_STYLE: Record<OccupancyT, string> = {
  Ocupada:    "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
  Desocupada: "bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-200",
  Reservada:  "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
};
function OccupancyBadge({ val }: { val: OccupancyT }) {
  return <span className={clsx("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-mono tracking-wide select-none", OCC_STYLE[val])}>{val}</span>;
}

const TYPE_STYLE: Record<PropType, string> = {
  Departamento:    "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200",
  Bodega:          "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200",
  Estacionamiento: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200",
};
function PropTypeBadge({ val }: { val: PropType }) {
  return <span className={clsx("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-mono tracking-wide select-none", TYPE_STYLE[val])}>{val}</span>;
}

// Toast
const TOAST_ICONS: Record<ToastType, ReactElement> = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
  error:   <XCircle className="w-5 h-5 text-red-500 shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
};
const TOAST_RING: Record<ToastType, string> = { success: "ring-emerald-200", error: "ring-red-200", warning: "ring-amber-200" };

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  return (
    <motion.div layout initial={{ opacity: 0, x: 80, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 80, scale: 0.95 }} transition={{ duration: 0.25, ease: "easeOut" }} className={clsx("flex items-start gap-3 w-80 bg-white rounded-xl px-4 py-3.5 shadow-lg ring-1 ring-inset", TOAST_RING[toast.type])}>
      {TOAST_ICONS[toast.type]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#0D1F36] leading-snug">{toast.title}</p>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{toast.message}</p>
      </div>
      <button onClick={() => onDismiss(toast.id)} className="shrink-0 p-0.5 rounded text-slate-400 hover:text-slate-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]" aria-label="Cerrar">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

function ToastRegion({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: string) => void }) {
  return (
    <div aria-live="polite" aria-atomic="false" className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5">
      <AnimatePresence mode="sync">{toasts.map((t) => <ToastCard key={t.id} toast={t} onDismiss={onDismiss} />)}</AnimatePresence>
    </div>
  );
}

// Field + Inputs
function Field({ label, id, required, error, hint, children }: { label: string; id: string; required?: boolean; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-[#0D1F36] flex items-center gap-1">
        {label}{required && <span className="text-red-500 font-bold" aria-hidden="true">*</span>}
      </label>
      {children}
      <AnimatePresence>
        {error ? (
          <motion.p key="e" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }} id={`${id}-error`} className="flex items-center gap-1 text-xs text-red-600 font-medium" role="alert">
            <AlertTriangle className="w-3 h-3 shrink-0" />{error}
          </motion.p>
        ) : hint ? <p key="h" className="text-xs text-slate-400">{hint}</p> : null}
      </AnimatePresence>
    </div>
  );
}

function TextInput({ id, value, onChange, placeholder, error, type = "text" }: { id: string; value: string; onChange: (v: string) => void; placeholder?: string; error?: string; type?: string }) {
  return (
    <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined}
      className={clsx("w-full px-3 py-2.5 rounded-lg text-sm text-[#0D1F36] placeholder-slate-400 bg-[#F4F7FC] border transition-all duration-150 outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent",
        error ? "border-red-400 ring-1 ring-red-300 bg-red-50 focus:ring-red-400" : "border-[rgba(27,61,114,0.15)] hover:border-[rgba(27,61,114,0.3)]")} />
  );
}

function NumericStepper({ id, value, onChange, min = 1, max = 99, error }: { id: string; value: string; onChange: (v: string) => void; min?: number; max?: number; error?: string }) {
  const n = parseInt(value) || 0;
  const step = (d: number) => onChange(String(Math.min(max, Math.max(min, n + d))));
  return (
    <div className={clsx("flex items-stretch rounded-lg border overflow-hidden transition-all duration-150", error ? "border-red-400 ring-1 ring-red-300 bg-red-50" : "border-[rgba(27,61,114,0.15)] bg-[#F4F7FC] focus-within:ring-2 focus-within:ring-[#3B82F6] focus-within:border-transparent")}>
      <button type="button" onClick={() => step(-1)} disabled={n <= min} className="px-3 text-slate-500 hover:text-[#1B3D72] hover:bg-blue-50 transition-colors disabled:opacity-30 border-r border-[rgba(27,61,114,0.1)]" aria-label="Disminuir"><Minus className="w-3.5 h-3.5" /></button>
      <input id={id} type="number" value={value} min={min} max={max} onChange={(e) => onChange(e.target.value)} className="flex-1 text-center text-sm font-mono font-medium text-[#0D1F36] bg-transparent py-2.5 outline-none w-16 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
      <button type="button" onClick={() => step(1)} disabled={n >= max} className="px-3 text-slate-500 hover:text-[#1B3D72] hover:bg-blue-50 transition-colors disabled:opacity-30 border-l border-[rgba(27,61,114,0.1)]" aria-label="Aumentar"><Plus className="w-3.5 h-3.5" /></button>
    </div>
  );
}

function Spinner() {
  return <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>;
}

// Generic search bar
function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative flex-1 max-w-xs">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input type="search" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm bg-[#F0F4F9] border border-transparent rounded-lg text-[#0D1F36] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] transition-all" />
    </div>
  );
}

// Generic confirm modal
function DangerModal({ open, title, desc, item, itemLabel, onConfirm, onCancel, confirmLabel = "Confirmar" }: {
  open: boolean; title: string; desc: string; item: string; itemLabel: string;
  onConfirm: () => void; onCancel: () => void; confirmLabel?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="db" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50 bg-[#0D1F36]/50 backdrop-blur-[2px]" onClick={onCancel} aria-hidden="true" />
          <motion.div key="dm" initial={{ opacity: 0, scale: 0.94, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 16 }} transition={{ duration: 0.22, ease: "easeOut" }} className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="pointer-events-auto w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden" role="alertdialog" aria-modal="true">
              <div className="h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-red-600" />
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="shrink-0 w-11 h-11 rounded-full bg-red-100 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
                  <div><h2 className="text-base font-semibold text-[#0D1F36] leading-snug">{title}</h2><p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{desc}</p></div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 mb-5">
                  <p className="text-xs font-mono text-amber-600 uppercase tracking-widest mb-0.5">{itemLabel}</p>
                  <p className="text-sm font-semibold text-amber-900">{item}</p>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <button onClick={onCancel} className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">Cancelar</button>
                  <button onClick={onConfirm} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2">{confirmLabel}</button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Slide-over shell
function SlideOver({ open, title, subtitle, onClose, children, footer }: {
  open: boolean; title: string; subtitle: string; onClose: () => void; children: ReactNode; footer: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="sb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-40 bg-[#0D1F36]/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
          <motion.aside key="sp" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 340, damping: 32 }} className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col" role="dialog" aria-modal="true">
            <div className="h-1 bg-gradient-to-r from-[#1B3D72] to-[#2563EB]" />
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(27,61,114,0.1)]">
              <div>
                <p className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-0.5">{subtitle}</p>
                <h2 className="text-lg font-semibold text-[#0D1F36]">{title}</h2>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]" aria-label="Cerrar"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">{children}</div>
            <div className="px-6 py-4 border-t border-[rgba(27,61,114,0.1)] bg-slate-50/60">{footer}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// KPI Card
function KpiCard({ label, value, sub, icon: Icon, color, bg }: { label: string; value: string | number; sub?: string; icon: typeof Building2; color: string; bg: string }) {
  return (
    <div className="bg-white rounded-xl border border-[rgba(27,61,114,0.1)] px-4 py-4 flex items-center gap-3">
      <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", bg)}>
        <Icon className={clsx("w-5 h-5", color)} />
      </div>
      <div>
        <p className="text-[11px] text-slate-400 leading-tight mb-0.5">{label}</p>
        <p className={clsx("text-2xl font-bold leading-none", color)} style={{ fontFamily: "var(--font-display)" }}>{value}</p>
        {sub && <p className="text-[10px] text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// Hierarchical cascading dropdowns helper
function HierarchyBar({ children }: { children: ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[rgba(27,61,114,0.12)] shadow-sm px-5 py-4 mb-5">
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

function SelectFilter({ label, value, onChange, options, icon: Icon }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
  icon?: typeof Building2;
}) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      {Icon && <Icon className="w-4 h-4 text-[#1B3D72] shrink-0" />}
      <p className="text-xs font-medium text-slate-500 whitespace-nowrap">{label}</p>
      <div className="relative">
        <select value={value} onChange={(e) => onChange(e.target.value)} className="pl-3 pr-8 py-2 text-sm font-medium text-[#1B3D72] bg-[#E4ECF8] border-2 border-[#1B3D72]/15 hover:border-[#1B3D72]/35 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6] appearance-none cursor-pointer transition-all">
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#1B3D72]/60 pointer-events-none" />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIMELINE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const TL_CONFIG: Record<TimelineKind, { icon: typeof UserCheck; color: string; bg: string; ring: string }> = {
  ingreso:      { icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-100", ring: "ring-emerald-200" },
  salida:       { icon: UserMinus, color: "text-red-600",     bg: "bg-red-100",     ring: "ring-red-200" },
  renovacion:   { icon: RefreshCw, color: "text-blue-600",    bg: "bg-blue-100",    ring: "ring-blue-200" },
  modificacion: { icon: Pencil,    color: "text-amber-600",   bg: "bg-amber-100",   ring: "ring-amber-200" },
};

function Timeline({ events }: { events: TimelineEv[] }) {
  if (events.length === 0) return (
    <div className="flex flex-col items-center py-12 text-slate-400">
      <Clock className="w-8 h-8 mb-2 opacity-30" />
      <p className="text-sm">Sin eventos registrados.</p>
    </div>
  );
  return (
    <ol className="relative" aria-label="Historial de ocupación">
      {events.map((ev, i) => {
        const cfg = TL_CONFIG[ev.kind];
        const Icon = cfg.icon;
        const isLast = i === events.length - 1;
        return (
          <motion.li key={ev.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.22, delay: i * 0.06 }} className="flex gap-4 pb-6 last:pb-0">
            {/* Stem */}
            <div className="flex flex-col items-center shrink-0">
              <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center ring-2", cfg.bg, cfg.ring)}>
                <Icon className={clsx("w-3.5 h-3.5", cfg.color)} />
              </div>
              {!isLast && <div className="w-px flex-1 mt-2 bg-[rgba(27,61,114,0.1)]" />}
            </div>
            {/* Content */}
            <div className="pb-2 min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <p className="text-sm font-semibold text-[#0D1F36] leading-snug">{ev.title}</p>
                <time className="text-[11px] font-mono text-slate-400 whitespace-nowrap shrink-0">{ev.date}</time>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-1">{ev.description}</p>
              <p className="text-[11px] text-slate-400 font-mono">Por: {ev.actor}</p>
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD MODULE
// ═══════════════════════════════════════════════════════════════════════════════

const ACTIVITY = [
  { icon: UserCheck, color: "text-emerald-500", bg: "bg-emerald-50", text: "Valentina Herrera registrada en unidad A-101 — Mirador Norte", time: "Hace 2 horas" },
  { icon: Building2, color: "text-blue-500",    bg: "bg-blue-50",    text: "Comunidad \"Conjunto Las Lilas\" activada exitosamente", time: "Hace 5 horas" },
  { icon: Layers,    color: "text-violet-500",  bg: "bg-violet-50",  text: "Torre B — Mirador Norte marcada como inactiva", time: "Ayer, 14:30" },
  { icon: Package,   color: "text-orange-500",  bg: "bg-orange-50",  text: "Bloque 2 — Torre A: 24 unidades registradas", time: "Ayer, 11:00" },
  { icon: RefreshCw, color: "text-amber-500",   bg: "bg-amber-50",   text: "Renovación anual procesada para 48 unidades activas", time: "Hace 3 días" },
];


function DashboardModule({ communities, towers, blocks, properties, occupants, onNavigate }: {
  communities: Community[]; towers: Tower[]; blocks: Block[];
  properties: Property[]; occupants: Occupant[];
  onNavigate: (m: Module) => void;
}) {
  // ── Computed KPIs ──────────────────────────────────────────────────────────
  const activeCommunities = communities.filter((c) => c.status === "Activa").length;
  const activeTowers      = towers.filter((t) => t.status === "Activa").length;
  const totalProps        = properties.length;
  const occupiedProps     = properties.filter((p) => p.occupancy === "Ocupada").length;
  const occupancyPct      = totalProps > 0 ? Math.round((occupiedProps / totalProps) * 100) : 0;

  // ── Module quick-access counts (live) ─────────────────────────────────────
  const moduleCards = [
    { icon: Building2, label: "Comunidades", desc: "Entidades y sedes",       module: "comunidades" as Module, count: communities.length },
    { icon: Layers,    label: "Torres",      desc: "Estructuras verticales",   module: "torres"      as Module, count: towers.length },
    { icon: Package,   label: "Bloques",     desc: "Agrupaciones por piso",    module: "bloques"     as Module, count: blocks.length },
    { icon: Home,      label: "Propiedades", desc: "Unidades, bodegas, est.",  module: "propiedades" as Module, count: totalProps },
    { icon: Users,     label: "Ocupantes",   desc: "Residentes e historial",   module: "ocupantes"   as Module, count: occupants.length },
  ];

  // ── Occupancy per active community (computed) ──────────────────────────────
  const occupancyByComm = communities
    .filter((c) => c.status === "Activa")
    .map((c) => {
      const commProps  = properties.filter((p) => p.communityId === c.id);
      const occupied   = commProps.filter((p) => p.occupancy === "Ocupada").length;
      const pct        = commProps.length > 0 ? Math.round((occupied / commProps.length) * 100) : 0;
      return { name: c.name, pct, total: commProps.length, occupied };
    });

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#0D1F36] tracking-tight" style={{ fontFamily: "var(--font-display)" }}>Dashboard de Activos</h1>
        <p className="text-sm text-slate-500 mt-0.5">Resumen global del inventario físico y control de ocupación.</p>
      </div>

      {/* KPIs — fully computed from live state */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Comunidades activas" value={activeCommunities} sub={`de ${communities.length} registradas`} icon={Building2} color="text-[#1B3D72]" bg="bg-blue-50" />
        <KpiCard label="Torres operativas"   value={activeTowers}      sub={`de ${towers.length} en sistema`}       icon={Layers}    color="text-violet-600" bg="bg-violet-50" />
        <KpiCard label="Propiedades totales" value={totalProps}         sub={`en ${activeCommunities} comunidades`}  icon={Home}      color="text-amber-600"  bg="bg-amber-50" />
        <KpiCard label="Tasa de ocupación"   value={`${occupancyPct}%`} sub={`${occupiedProps} unidades ocupadas`}  icon={TrendingUp} color="text-emerald-600" bg="bg-emerald-50" />
      </div>

      <div className="grid lg:grid-cols-5 gap-5 mb-6">
        {/* Recent activity */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-[rgba(27,61,114,0.1)] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[rgba(27,61,114,0.08)] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#1B3D72]" />
            <h2 className="text-sm font-semibold text-[#0D1F36]">Actividad Reciente</h2>
          </div>
          <ul className="divide-y divide-[rgba(27,61,114,0.06)]">
            {ACTIVITY.map((a, i) => (
              <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2, delay: i * 0.05 }} className="flex items-start gap-3 px-5 py-3.5 hover:bg-blue-50/30 transition-colors">
                <div className={clsx("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5", a.bg)}>
                  <a.icon className={clsx("w-3.5 h-3.5", a.color)} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-[#0D1F36] leading-snug">{a.text}</p>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">{a.time}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Module access — live counts */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[rgba(27,61,114,0.1)] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[rgba(27,61,114,0.08)] flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-[#1B3D72]" />
            <h2 className="text-sm font-semibold text-[#0D1F36]">Acceso Rápido</h2>
          </div>
          <ul className="divide-y divide-[rgba(27,61,114,0.06)]">
            {moduleCards.map((m) => (
              <li key={m.module}>
                <button onClick={() => onNavigate(m.module)} className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-blue-50/40 transition-colors text-left group">
                  <div className="w-8 h-8 rounded-lg bg-[#1B3D72]/8 flex items-center justify-center shrink-0 group-hover:bg-[#1B3D72]/15 transition-colors">
                    <m.icon className="w-4 h-4 text-[#1B3D72]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0D1F36]">{m.label}</p>
                    <p className="text-xs text-slate-400">{m.desc}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs font-mono font-medium text-[#1B3D72] bg-blue-50 px-2 py-0.5 rounded-md">{m.count}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#1B3D72] transition-colors" />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Occupancy chart — computed from live property data */}
      <div className="bg-white rounded-2xl border border-[rgba(27,61,114,0.1)] shadow-sm px-5 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#0D1F36]">Ocupación por Comunidad</h2>
          <span className="text-xs font-mono text-slate-400">Calculado en tiempo real</span>
        </div>
        <div className="space-y-3.5">
          {occupancyByComm.map((c) => (
            <div key={c.name} className="flex items-center gap-3">
              <p className="text-xs text-slate-600 w-52 shrink-0 truncate" title={c.name}>{c.name}</p>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${c.pct}%` }}
                  transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
                  className={clsx("h-full rounded-full", c.pct >= 80 ? "bg-emerald-500" : c.pct >= 55 ? "bg-blue-500" : "bg-amber-500")}
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-mono font-semibold text-slate-600 w-8 text-right">{c.pct}%</span>
                <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">{c.occupied}/{c.total}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMMUNITIES MODULE (full CRUD — unchanged logic)
// ═══════════════════════════════════════════════════════════════════════════════

interface CommFormState { name: string; address: string; rut: string; floors: string; }
interface CommFormErrors { name?: string; address?: string; rut?: string; floors?: string; }

function validateCommunity(d: CommFormState): CommFormErrors {
  const e: CommFormErrors = {};
  if (!d.name.trim()) e.name = "Este campo es obligatorio";
  if (!d.address.trim()) e.address = "Este campo es obligatorio";
  if (!d.rut.trim()) e.rut = "Este campo es obligatorio";
  if (!d.floors.trim()) e.floors = "Este campo es obligatorio";
  else if (isNaN(Number(d.floors)) || Number(d.floors) < 1) e.floors = "Ingrese un número válido mayor a 0";
  return e;
}
const COMM_EMPTY: CommFormState = { name: "", address: "", rut: "", floors: "" };

function CommunitiesModule({ communities, setCommunities, addToast }: {
  communities: Community[]; setCommunities: React.Dispatch<React.SetStateAction<Community[]>>;
  addToast: (t: ToastType, title: string, msg: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<Community | null>(null);
  const [form, setForm] = useState<CommFormState>(COMM_EMPTY);
  const [errors, setErrors] = useState<CommFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [deactivating, setDeactivating] = useState<Community | null>(null);

  const openCreate = () => { setEditing(null); setForm(COMM_EMPTY); setErrors({}); setPanelOpen(true); };
  const openEdit = (c: Community) => { setEditing(c); setForm({ name: c.name, address: c.address, rut: c.rut, floors: String(c.floors) }); setErrors({}); setPanelOpen(true); };
  const closePanel = useCallback(() => { setPanelOpen(false); setTimeout(() => { setEditing(null); setForm(COMM_EMPTY); setErrors({}); }, 350); }, []);
  const change = (k: keyof CommFormState, v: string) => { setForm((p) => ({ ...p, [k]: v })); if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined })); };

  const submit = async () => {
    const e = validateCommunity(form);
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 650));
    if (communities.some((c) => c.id !== editing?.id && c.name.trim().toLowerCase() === form.name.trim().toLowerCase())) {
      setSubmitting(false); addToast("error", "Operación rechazada", "Ya existe una comunidad con este nombre."); return;
    }
    if (editing) setCommunities((p) => p.map((c) => c.id === editing.id ? { ...c, name: form.name.trim(), address: form.address.trim(), rut: form.rut.trim(), floors: parseInt(form.floors) } : c));
    else setCommunities((p) => [{ id: Date.now(), name: form.name.trim(), address: form.address.trim(), rut: form.rut.trim(), floors: parseInt(form.floors), towers: 0, units: 0, status: "Activa" }, ...p]);
    setSubmitting(false); closePanel();
    addToast("success", editing ? "Cambios guardados" : "¡Registro Exitoso!", editing ? "Comunidad actualizada correctamente." : "La comunidad ha sido guardada y registrada en auditoría.");
  };

  const confirmDeactivate = useCallback(() => {
    if (!deactivating) return;
    const name = deactivating.name;
    setCommunities((p) => p.map((c) => c.id === deactivating.id ? { ...c, status: "Inactiva" } : c));
    setDeactivating(null); addToast("warning", "Comunidad desactivada", `"${name}" ha sido suspendida.`);
  }, [deactivating, setCommunities, addToast]);

  const filtered = communities.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.address.toLowerCase().includes(search.toLowerCase()));
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#0D1F36] tracking-tight" style={{ fontFamily: "var(--font-display)" }}>Gestión de Comunidades</h1>
          <p className="text-sm text-slate-500 mt-0.5">Administre las comunidades del edificio · CU-001-001</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B3D72] text-white text-sm font-semibold hover:bg-[#152E58] active:scale-[0.98] transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 shrink-0">
          <Plus className="w-4 h-4" />Registrar Nueva Comunidad
        </button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Total comunidades" value={communities.length} icon={Building2} color="text-[#1B3D72]" bg="bg-blue-50" />
        <KpiCard label="Activas" value={communities.filter((c) => c.status === "Activa").length} icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-50" />
        <KpiCard label="Total torres" value={communities.reduce((a, c) => a + c.towers, 0)} icon={Layers} color="text-violet-600" bg="bg-violet-50" />
        <KpiCard label="Unidades" value={communities.reduce((a, c) => a + c.units, 0)} icon={Users} color="text-amber-600" bg="bg-amber-50" />
      </div>
      <div className="bg-white rounded-2xl border border-[rgba(27,61,114,0.1)] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[rgba(27,61,114,0.08)] flex items-center gap-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar comunidad…" />
          <span className="ml-auto text-xs font-mono text-slate-400" aria-live="polite">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="grid">
            <thead><tr className="bg-[#F6F8FC] border-b border-[rgba(27,61,114,0.08)]">
              {["Nombre", "Dirección", "Torres", "Unidades", "Estado", "Acciones"].map((h) => <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[#1B3D72]/60 uppercase tracking-wider font-mono" scope="col">{h}</th>)}
            </tr></thead>
            <tbody>
              <AnimatePresence mode="popLayout" initial={false}>
                {filtered.length === 0
                  ? <tr><td colSpan={6} className="px-5 py-16 text-center text-slate-400 text-sm"><Building2 className="w-8 h-8 mx-auto mb-2 opacity-30" />No se encontraron comunidades.</td></tr>
                  : filtered.map((c, i) => (
                    <motion.tr key={c.id} layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2, delay: i * 0.03 }} className={clsx("border-b border-[rgba(27,61,114,0.06)] last:border-0 hover:bg-blue-50/40 transition-colors", c.status === "Inactiva" && "opacity-60")}>
                      <td className="px-5 py-3.5"><div className="flex items-center gap-2.5"><div className="w-7 h-7 rounded-lg bg-[#1B3D72]/8 flex items-center justify-center shrink-0"><Building2 className="w-3.5 h-3.5 text-[#1B3D72]/60" /></div><span className="font-medium text-[#0D1F36]">{c.name}</span></div></td>
                      <td className="px-5 py-3.5 max-w-[200px]"><div className="flex items-start gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" /><span className="truncate text-xs text-slate-500">{c.address}</span></div></td>
                      <td className="px-5 py-3.5"><span className="font-mono text-xs font-medium text-[#1B3D72] bg-blue-50 px-2 py-0.5 rounded-md">{c.towers}</span></td>
                      <td className="px-5 py-3.5"><span className="font-mono text-xs font-medium text-slate-600">{c.units}</span></td>
                      <td className="px-5 py-3.5"><StatusBadge status={c.status} /></td>
                      <td className="px-5 py-3.5"><div className="flex items-center gap-1.5">
                        <button onClick={() => openEdit(c)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#1B3D72] bg-blue-50 hover:bg-blue-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"><Pencil className="w-3.5 h-3.5" />Editar</button>
                        {c.status === "Activa" && <button onClick={() => setDeactivating(c)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"><PowerOff className="w-3.5 h-3.5" />Desactivar</button>}
                      </div></td>
                    </motion.tr>
                  ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-[rgba(27,61,114,0.06)] bg-[#F6F8FC]/60 flex items-center justify-between">
          <p className="text-xs text-slate-400">CU-001-001 · Gestión de Comunidades</p>
          <p className="text-xs font-mono text-slate-400">{communities.filter((c) => c.status === "Activa").length} activas / {communities.length} total</p>
        </div>
      </div>

      <SlideOver open={panelOpen} title={editing ? "Editar Detalles de la Comunidad" : "Registrar Nueva Comunidad"} subtitle={editing ? "Modificar registro" : "Nuevo registro"} onClose={closePanel}
        footer={<div className="flex justify-end gap-3"><button onClick={closePanel} className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]">Cancelar</button><button onClick={submit} disabled={submitting} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#1B3D72] hover:bg-[#152E58] active:scale-[0.98] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 disabled:opacity-60">{submitting ? <><Spinner />Guardando…</> : editing ? "Guardar Cambios" : "Registrar"}</button></div>}
      >
        <AnimatePresence>{hasErrors && <motion.div key="eb" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden -mx-6 -mt-5"><div className="flex items-center gap-2.5 px-6 py-3 bg-red-50 border-b border-red-200"><XCircle className="w-4 h-4 text-red-500 shrink-0" /><p className="text-sm text-red-700 font-medium">Corrija los campos marcados antes de continuar.</p></div></motion.div>}</AnimatePresence>
        <Field label="Nombre de la Comunidad" id="c-name" required error={errors.name}><TextInput id="c-name" value={form.name} onChange={(v) => change("name", v)} placeholder="Ej: Edificio Mirador Norte" error={errors.name} /></Field>
        <Field label="Dirección" id="c-addr" required error={errors.address}><TextInput id="c-addr" value={form.address} onChange={(v) => change("address", v)} placeholder="Ej: Av. Apoquindo 4500, Las Condes" error={errors.address} /></Field>
        <Field label="RUT / Identificador Legal" id="c-rut" required error={errors.rut}><TextInput id="c-rut" value={form.rut} onChange={(v) => change("rut", v)} placeholder="Ej: 76.123.456-7" error={errors.rut} /></Field>
        <Field label="Total de Pisos" id="c-fl" required error={errors.floors}><TextInput id="c-fl" type="number" value={form.floors} onChange={(v) => change("floors", v)} placeholder="Ej: 18" error={errors.floors} /></Field>
        <p className="text-xs text-slate-400"><span className="text-red-500 font-bold">*</span> Campos obligatorios</p>
      </SlideOver>

      <DangerModal open={!!deactivating} title="¿Desactivar esta comunidad?" desc="Esta acción suspenderá el acceso a sus unidades y torres vinculadas." item={deactivating?.name ?? ""} itemLabel="Comunidad afectada" onConfirm={confirmDeactivate} onCancel={() => setDeactivating(null)} confirmLabel="Sí, Desactivar Comunidad" />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOWERS MODULE (full CRUD)
// ═══════════════════════════════════════════════════════════════════════════════

interface TowerFormState { communityId: string; name: string; floors: string; description: string; }
interface TowerFormErrors { communityId?: string; name?: string; floors?: string; }

function validateTower(d: TowerFormState): TowerFormErrors {
  const e: TowerFormErrors = {};
  if (!d.communityId) e.communityId = "Seleccione una comunidad de destino";
  if (!d.name.trim()) e.name = "Este dato es requerido para modelar la estructura";
  if (!d.floors.trim()) e.floors = "Este dato es requerido para modelar la estructura";
  else if (isNaN(Number(d.floors)) || Number(d.floors) < 1) e.floors = "Ingrese un número válido mayor a 0";
  return e;
}
const TOWER_EMPTY: TowerFormState = { communityId: "", name: "", floors: "1", description: "" };

function TowersModule({ communities, towers, setTowers, addToast, globalCommunityId }: {
  communities: Community[]; towers: Tower[]; setTowers: React.Dispatch<React.SetStateAction<Tower[]>>;
  addToast: (t: ToastType, title: string, msg: string) => void; globalCommunityId: number;
}) {
  const [selComm, setSelComm] = useState(globalCommunityId);
  const [search, setSearch] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<Tower | null>(null);
  const [form, setForm] = useState<TowerFormState>({ ...TOWER_EMPTY, communityId: String(globalCommunityId) });
  const [errors, setErrors] = useState<TowerFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [deactivating, setDeactivating] = useState<Tower | null>(null);

  const openCreate = () => { setEditing(null); setForm({ ...TOWER_EMPTY, communityId: String(selComm) }); setErrors({}); setPanelOpen(true); };
  const openEdit = (t: Tower) => { setEditing(t); setForm({ communityId: String(t.communityId), name: t.name, floors: String(t.floors), description: t.description }); setErrors({}); setPanelOpen(true); };
  const closePanel = useCallback(() => { setPanelOpen(false); setTimeout(() => { setEditing(null); setForm({ ...TOWER_EMPTY, communityId: String(selComm) }); setErrors({}); }, 350); }, [selComm]);
  const change = (k: keyof TowerFormState, v: string) => { setForm((p) => ({ ...p, [k]: v })); if (k !== "description" && errors[k as keyof TowerFormErrors]) setErrors((p) => ({ ...p, [k]: undefined })); };

  const submit = async () => {
    const e = validateTower(form);
    if (Object.keys(e).length) { setErrors(e); addToast("error", "Campos incompletos", "Complete los campos obligatorios."); return; }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    const cid = parseInt(form.communityId);
    if (towers.some((t) => t.id !== editing?.id && t.communityId === cid && t.name.trim().toLowerCase() === form.name.trim().toLowerCase())) {
      setSubmitting(false); addToast("error", "Operación rechazada", `La Torre "${form.name.trim()}" ya se encuentra registrada en esta comunidad.`); return;
    }
    if (editing) setTowers((p) => p.map((t) => t.id === editing.id ? { ...t, communityId: cid, name: form.name.trim(), floors: parseInt(form.floors), description: form.description.trim() } : t));
    else setTowers((p) => [...p, { id: Date.now(), communityId: cid, name: form.name.trim(), floors: parseInt(form.floors), description: form.description.trim(), status: "Activa" }]);
    setSubmitting(false); closePanel();
    addToast("success", editing ? "Torre actualizada" : "¡Torre registrada con éxito!", "Estructura añadida al registro de auditoría.");
  };

  const confirmDeactivate = useCallback(() => {
    if (!deactivating) return;
    const name = deactivating.name;
    setTowers((p) => p.map((t) => t.id === deactivating.id ? { ...t, status: "Inactiva" } : t));
    setDeactivating(null); addToast("warning", "Torre desactivada", `"${name}" y sus propiedades vinculadas han sido suspendidas.`);
  }, [deactivating, setTowers, addToast]);

  const commTowers = towers.filter((t) => t.communityId === selComm);
  const filtered = commTowers.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));
  const activeCount = commTowers.filter((t) => t.status === "Activa").length;
  const commOptions = communities.map((c) => ({ value: String(c.id), label: c.name + (c.status === "Inactiva" ? " (Inactiva)" : "") }));

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#0D1F36] tracking-tight" style={{ fontFamily: "var(--font-display)" }}>Gestión de Torres</h1>
          <p className="text-sm text-slate-500 mt-0.5">Infraestructura vertical por comunidad · CU-001-002</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B3D72] text-white text-sm font-semibold hover:bg-[#152E58] active:scale-[0.98] transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 shrink-0">
          <Plus className="w-4 h-4" />Registrar Nueva Torre
        </button>
      </div>
      <HierarchyBar>
        <SelectFilter label="Comunidad:" value={String(selComm)} onChange={(v) => { setSelComm(Number(v)); setSearch(""); }} options={commOptions} icon={Building2} />
        <motion.p key={selComm} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.18 }} className="flex items-center gap-1.5 text-xs text-slate-500 ml-2">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />{communities.find((c) => c.id === selComm)?.address}
        </motion.p>
      </HierarchyBar>
      <motion.div key={selComm} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }} className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <KpiCard label="Torres registradas" value={commTowers.length} icon={Layers} color="text-[#1B3D72]" bg="bg-blue-50" />
        <KpiCard label="Activas" value={activeCount} icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-50" />
        <KpiCard label="Inactivas" value={commTowers.length - activeCount} icon={PowerOff} color="text-slate-500" bg="bg-slate-100" />
        <KpiCard label="Total pisos" value={commTowers.reduce((a, t) => a + t.floors, 0)} icon={Hash} color="text-violet-600" bg="bg-violet-50" />
      </motion.div>
      <div className="bg-white rounded-2xl border border-[rgba(27,61,114,0.1)] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[rgba(27,61,114,0.08)] flex items-center gap-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar torre…" />
          <span className="ml-auto text-xs font-mono text-slate-400" aria-live="polite">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="grid">
            <thead><tr className="bg-[#F6F8FC] border-b border-[rgba(27,61,114,0.08)]">
              {["Torre", "Pisos", "Descripción", "Estado", "Acciones"].map((h) => <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[#1B3D72]/60 uppercase tracking-wider font-mono" scope="col">{h}</th>)}
            </tr></thead>
            <tbody>
              <AnimatePresence mode="popLayout" initial={false}>
                {filtered.length === 0
                  ? <motion.tr key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><td colSpan={5} className="px-5 py-16 text-center text-slate-400 text-sm"><Layers className="w-8 h-8 mx-auto mb-2 opacity-30" />{commTowers.length === 0 ? "No hay torres para esta comunidad." : "Sin coincidencias."}</td></motion.tr>
                  : filtered.map((t, i) => (
                    <motion.tr key={t.id} layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2, delay: i * 0.03 }} className={clsx("border-b border-[rgba(27,61,114,0.06)] last:border-0 hover:bg-blue-50/40 transition-colors", t.status === "Inactiva" && "opacity-60")}>
                      <td className="px-5 py-3.5"><div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-lg bg-[#1B3D72]/8 flex items-center justify-center shrink-0"><Layers className="w-3.5 h-3.5 text-[#1B3D72]/70" /></div><span className="font-semibold text-[#0D1F36]">{t.name}</span></div></td>
                      <td className="px-5 py-3.5"><span className="inline-flex items-center gap-1 font-mono text-xs font-medium text-[#1B3D72] bg-blue-50 px-2 py-0.5 rounded-md"><Hash className="w-3 h-3" />{t.floors}</span></td>
                      <td className="px-5 py-3.5 max-w-[280px]"><p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{t.description || <span className="italic text-slate-300">Sin descripción</span>}</p></td>
                      <td className="px-5 py-3.5"><StatusBadge status={t.status} /></td>
                      <td className="px-5 py-3.5"><div className="flex items-center gap-1.5">
                        <button onClick={() => openEdit(t)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#1B3D72] bg-blue-50 hover:bg-blue-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"><Pencil className="w-3.5 h-3.5" />Editar</button>
                        {t.status === "Activa" && <button onClick={() => setDeactivating(t)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"><PowerOff className="w-3.5 h-3.5" />Desactivar</button>}
                      </div></td>
                    </motion.tr>
                  ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-[rgba(27,61,114,0.06)] bg-[#F6F8FC]/60 flex items-center justify-between">
          <p className="text-xs text-slate-400">CU-001-002 · Gestión de Torres</p>
          <p className="text-xs font-mono text-slate-400">{activeCount} activas / {commTowers.length} total</p>
        </div>
      </div>

      <SlideOver open={panelOpen} title={editing ? "Modificar Características de la Torre" : "Registrar Nueva Torre"} subtitle={editing ? "Modificar registro" : "Nuevo registro"} onClose={closePanel}
        footer={<div className="flex justify-end gap-3"><button onClick={closePanel} className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]">Cancelar</button><button onClick={submit} disabled={submitting} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#1B3D72] hover:bg-[#152E58] active:scale-[0.98] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 disabled:opacity-60">{submitting ? <><Spinner />Guardando…</> : editing ? "Guardar Cambios" : "Registrar Torre"}</button></div>}
      >
        <Field label="Comunidad de Destino" id="t-comm" required error={errors.communityId} hint={!errors.communityId ? "Comunidad a la que pertenecerá la torre." : undefined}>
          <div className="relative"><select id="t-comm" value={form.communityId} onChange={(e) => change("communityId", e.target.value)} className={clsx("w-full px-3 py-2.5 pr-9 rounded-lg text-sm appearance-none bg-[#F4F7FC] border outline-none cursor-pointer focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all", errors.communityId ? "border-red-400 ring-1 ring-red-300 bg-red-50" : "border-[rgba(27,61,114,0.15)]")}><option value="">— Seleccionar comunidad —</option>{communities.filter((c) => c.status === "Activa").map((c) => <option key={c.id} value={String(c.id)}>{c.name}</option>)}</select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" /></div>
        </Field>
        <Field label="Nombre / Número de Torre" id="t-name" required error={errors.name}>
          <div className="relative"><Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input id="t-name" type="text" value={form.name} onChange={(e) => change("name", e.target.value)} placeholder="Ej: Torre A, Torre Norte, Bloque 2" className={clsx("w-full pl-9 pr-3 py-2.5 rounded-lg text-sm text-[#0D1F36] placeholder-slate-400 bg-[#F4F7FC] border outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all", errors.name ? "border-red-400 ring-1 ring-red-300 bg-red-50" : "border-[rgba(27,61,114,0.15)]")} /></div>
        </Field>
        <Field label="Cantidad de Pisos" id="t-floors" required error={errors.floors}><NumericStepper id="t-floors" value={form.floors} onChange={(v) => change("floors", v)} error={errors.floors} /></Field>
        <Field label="Descripción / Notas" id="t-desc">
          <div className="relative"><AlignLeft className="absolute left-3 top-3 w-4 h-4 text-slate-400" /><textarea id="t-desc" value={form.description} onChange={(e) => change("description", e.target.value)} placeholder="Características adicionales, servicios…" rows={3} className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm text-[#0D1F36] placeholder-slate-400 bg-[#F4F7FC] border border-[rgba(27,61,114,0.15)] hover:border-[rgba(27,61,114,0.3)] focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none resize-none transition-all" /></div>
        </Field>
      </SlideOver>

      <DangerModal open={!!deactivating} title="¿Desactivar esta torre?" desc="Esta acción dejará inactivas automáticamente todas las propiedades y bloques asociados a ella." item={`${deactivating?.name} · ${communities.find((c) => c.id === deactivating?.communityId)?.name ?? ""}`} itemLabel="Estructura afectada" onConfirm={confirmDeactivate} onCancel={() => setDeactivating(null)} confirmLabel="Confirmar Desactivación" />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BLOQUES MODULE  (full CRUD — CU-001-003)
// ═══════════════════════════════════════════════════════════════════════════════

interface BlockFormState  { communityId: string; towerId: string; name: string; description: string; floorStart: string; floorEnd: string; }
interface BlockFormErrors { name?: string; towerId?: string; floorEnd?: string; }

function validateBlock(d: BlockFormState): BlockFormErrors {
  const e: BlockFormErrors = {};
  if (!d.name.trim()) e.name = "El nombre del bloque es obligatorio para la división física";
  if (!d.towerId)      e.towerId = "Seleccione la torre de destino";
  const s = parseInt(d.floorStart), f = parseInt(d.floorEnd);
  if (!isNaN(s) && !isNaN(f) && f < s) e.floorEnd = "El piso final no puede ser menor al inicial";
  return e;
}
const BLOCK_EMPTY: BlockFormState = { communityId: "", towerId: "", name: "", description: "", floorStart: "1", floorEnd: "6" };

// ── Center-modal form for Blocks ────────────────────────────────────────────
function BlockFormModal({ open, editing, form, errors, submitting, communities, towers, onChange, onSubmit, onClose }: {
  open: boolean; editing: Block | null; form: BlockFormState; errors: BlockFormErrors;
  submitting: boolean; communities: Community[]; towers: Tower[];
  onChange: (k: keyof BlockFormState, v: string) => void;
  onSubmit: () => void; onClose: () => void;
}) {
  const isEdit = !!editing;
  const hasErrors = Object.keys(errors).length > 0;
  const commTowers = towers.filter((t) => t.communityId === parseInt(form.communityId) && t.status === "Activa");

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="bfm-bg"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-[#0D1F36]/45 backdrop-blur-[3px]"
            onClick={onClose} aria-hidden="true"
          />

          {/* Modal card */}
          <motion.div
            key="bfm-card"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              role="dialog" aria-modal="true"
              aria-labelledby="bfm-title"
              style={{ maxHeight: "90vh" }}
            >
              {/* Accent stripe */}
              <div className="h-1 bg-gradient-to-r from-[#1B3D72] to-[#2563EB] shrink-0" />

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(27,61,114,0.1)] shrink-0">
                <div>
                  <p className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-0.5">
                    {isEdit ? "Modificar registro · CU-001-003" : "Nuevo registro · CU-001-003"}
                  </p>
                  <h2 id="bfm-title" className="text-lg font-semibold text-[#0D1F36]" style={{ fontFamily: "var(--font-display)" }}>
                    {isEdit ? "Modificar Detalles del Bloque" : "Registrar Nuevo Bloque"}
                  </h2>
                </div>
                <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]" aria-label="Cerrar">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Validation error banner */}
              <AnimatePresence>
                {hasErrors && (
                  <motion.div
                    key="bfm-err"
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }} className="overflow-hidden shrink-0"
                  >
                    <div className="flex items-center gap-2.5 px-6 py-3 bg-red-50 border-b border-red-200">
                      <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                      <p className="text-sm text-red-700 font-medium">Corrija los campos marcados antes de continuar.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form body */}
              <div className="overflow-y-auto px-6 py-5 space-y-4">
                {/* Hierarchy context — read-only in edit, selectable in create */}
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Comunidad" id="bfm-comm" required>
                    <div className="relative">
                      <select
                        id="bfm-comm"
                        value={form.communityId}
                        onChange={(e) => { onChange("communityId", e.target.value); onChange("towerId", ""); }}
                        disabled={isEdit}
                        className={clsx(
                          "w-full px-3 py-2.5 pr-9 rounded-lg text-sm appearance-none outline-none cursor-pointer transition-all",
                          "bg-[#F4F7FC] border focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent",
                          "border-[rgba(27,61,114,0.15)] hover:border-[rgba(27,61,114,0.3)]",
                          isEdit && "opacity-60 cursor-not-allowed"
                        )}
                      >
                        <option value="">— Seleccionar —</option>
                        {communities.filter((c) => c.status === "Activa").map((c) => (
                          <option key={c.id} value={String(c.id)}>{c.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </Field>

                  <Field label="Torre de Destino" id="bfm-tower" required error={errors.towerId}>
                    <div className="relative">
                      <select
                        id="bfm-tower"
                        value={form.towerId}
                        onChange={(e) => onChange("towerId", e.target.value)}
                        disabled={isEdit || !form.communityId}
                        aria-invalid={!!errors.towerId}
                        aria-describedby={errors.towerId ? "bfm-tower-error" : undefined}
                        className={clsx(
                          "w-full px-3 py-2.5 pr-9 rounded-lg text-sm appearance-none outline-none transition-all",
                          "bg-[#F4F7FC] border focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent",
                          errors.towerId
                            ? "border-red-400 ring-1 ring-red-300 bg-red-50 focus:ring-red-400"
                            : "border-[rgba(27,61,114,0.15)] hover:border-[rgba(27,61,114,0.3)]",
                          (isEdit || !form.communityId) && "opacity-60 cursor-not-allowed"
                        )}
                      >
                        <option value="">{!form.communityId ? "Seleccione comunidad primero" : "— Seleccionar torre —"}</option>
                        {commTowers.map((t) => (
                          <option key={t.id} value={String(t.id)}>{t.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </Field>
                </div>

                {/* Name */}
                <Field label="Nombre del Bloque / Sector" id="bfm-name" required error={errors.name}
                  hint={!errors.name ? "Identifique el bloque por nombre, letra o sector. Ej: Bloque A, Sector Poniente." : undefined}>
                  <TextInput
                    id="bfm-name"
                    value={form.name}
                    onChange={(v) => onChange("name", v)}
                    placeholder="Ej: Bloque A, Bloque 1 — Pisos 1–6, Sector Norte"
                    error={errors.name}
                  />
                </Field>

                {/* Floor range */}
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Piso Inicial" id="bfm-fs" hint="Primer piso del bloque">
                    <NumericStepper id="bfm-fs" value={form.floorStart} onChange={(v) => onChange("floorStart", v)} min={-3} max={99} />
                  </Field>
                  <Field label="Piso Final" id="bfm-fe" error={errors.floorEnd} hint={!errors.floorEnd ? "Último piso del bloque" : undefined}>
                    <NumericStepper id="bfm-fe" value={form.floorEnd} onChange={(v) => onChange("floorEnd", v)} min={-3} max={99} error={errors.floorEnd} />
                  </Field>
                </div>

                {/* Description */}
                <Field label="Descripción / Detalles del Bloque" id="bfm-desc"
                  hint="Información adicional sobre el sector: servicios, accesos, características. (Opcional)">
                  <textarea
                    id="bfm-desc"
                    value={form.description}
                    onChange={(e) => onChange("description", e.target.value)}
                    placeholder="Ej: Bloque de uso residencial. Incluye salón comunitario en piso 1 y terraza en piso 6."
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-[#0D1F36] placeholder-slate-400 bg-[#F4F7FC] border border-[rgba(27,61,114,0.15)] hover:border-[rgba(27,61,114,0.3)] focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none resize-none transition-all"
                  />
                  <p className="text-right text-[11px] text-slate-400">{form.description.length}/300</p>
                </Field>

                <p className="text-xs text-slate-400 pt-1">
                  <span className="text-red-500 font-bold">*</span> Campos obligatorios
                </p>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-[rgba(27,61,114,0.1)] flex items-center justify-end gap-3 bg-slate-50/70 shrink-0">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
                >
                  Cancelar
                </button>
                <button
                  onClick={onSubmit}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#1B3D72] hover:bg-[#152E58] active:scale-[0.98] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? <><Spinner />Guardando…</> : isEdit ? "Guardar Cambios" : "Registrar Bloque"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Block deactivation modal ─────────────────────────────────────────────────
function BlockDeactivateModal({ block, towerName, communityName, onConfirm, onCancel }: {
  block: Block | null; towerName: string; communityName: string; onConfirm: () => void; onCancel: () => void;
}) {
  useEffect(() => {
    if (!block) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [block, onCancel]);

  return (
    <AnimatePresence>
      {block && (
        <>
          <motion.div key="bdm-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50 bg-[#0D1F36]/50 backdrop-blur-[2px]" onClick={onCancel} aria-hidden="true" />
          <motion.div key="bdm-card" initial={{ opacity: 0, scale: 0.94, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 16 }} transition={{ duration: 0.22, ease: "easeOut" }} className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="pointer-events-auto w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden" role="alertdialog" aria-modal="true" aria-labelledby="bdm-title" aria-describedby="bdm-desc">

              {/* Amber → red danger stripe */}
              <div className="h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-red-600" />

              <div className="p-6">
                {/* Icon + title */}
                <div className="flex items-start gap-4 mb-5">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h2 id="bdm-title" className="text-base font-semibold text-[#0D1F36] leading-snug">
                      ¿Está seguro de que desea desactivar este bloque?
                    </h2>
                    <p id="bdm-desc" className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                      Esta acción afectará la disponibilidad de todas las <strong className="text-[#0D1F36]">unidades habitacionales, departamentos o bodegas</strong> asociadas a este sector.
                    </p>
                  </div>
                </div>

                {/* Affected block card */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3.5 mb-4">
                  <p className="text-xs font-mono text-amber-600 uppercase tracking-widest mb-2">Bloque afectado</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-200/60 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 text-amber-700" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-amber-900">{block.name}</p>
                      <p className="text-xs text-amber-700">{towerName} · {communityName}</p>
                      <p className="text-xs text-amber-600 font-mono mt-0.5">{block.units} unidades · pisos {block.floorStart}–{block.floorEnd}</p>
                    </div>
                  </div>
                </div>

                {/* Dependency warning */}
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-lg px-3.5 py-3 mb-5">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700 leading-relaxed">
                    <strong>Dependencia jerárquica:</strong> Todas las propiedades vinculadas a este bloque quedarán suspendidas y no podrán gestionarse hasta que el bloque sea reactivado.
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-3">
                  <button onClick={onCancel} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                    Cancelar
                  </button>
                  <button onClick={onConfirm} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:scale-[0.98] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2">
                    Sí, Desactivar Bloque
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Module ───────────────────────────────────────────────────────────────────
function BloquesModule({ communities, towers, blocks, setBlocks, addToast, globalCommunityId }: {
  communities: Community[]; towers: Tower[]; blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  addToast: (t: ToastType, title: string, msg: string) => void;
  globalCommunityId: number;
}) {
  const [selComm, setSelComm] = useState(globalCommunityId);
  const [selTower, setSelTower] = useState("all");
  const [search, setSearch] = useState("");

  // Form modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Block | null>(null);
  const [form, setForm] = useState<BlockFormState>({ ...BLOCK_EMPTY, communityId: String(globalCommunityId) });
  const [formErrors, setFormErrors] = useState<BlockFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Deactivation state
  const [deactivating, setDeactivating] = useState<Block | null>(null);

  // Derived data
  const commTowers = towers.filter((t) => t.communityId === selComm && t.status === "Activa");
  const relevantBlocks = blocks.filter(
    (b) => b.communityId === selComm && (selTower === "all" || b.towerId === parseInt(selTower))
  );
  const filtered = relevantBlocks.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.description?.toLowerCase().includes(search.toLowerCase())
  );
  const towerOptions = [
    { value: "all", label: "Todas las torres" },
    ...commTowers.map((t) => ({ value: String(t.id), label: t.name })),
  ];
  const activeCount = relevantBlocks.filter((b) => b.status === "Activa").length;

  // Helpers
  const openCreate = () => {
    setEditing(null);
    setForm({ ...BLOCK_EMPTY, communityId: String(selComm), towerId: selTower !== "all" ? selTower : "" });
    setFormErrors({});
    setModalOpen(true);
  };
  const openEdit = (b: Block) => {
    setEditing(b);
    setForm({
      communityId: String(b.communityId),
      towerId: String(b.towerId),
      name: b.name,
      description: b.description ?? "",
      floorStart: String(b.floorStart),
      floorEnd: String(b.floorEnd),
    });
    setFormErrors({});
    setModalOpen(true);
  };
  const closeModal = useCallback(() => {
    setModalOpen(false);
    setTimeout(() => { setEditing(null); setFormErrors({}); }, 320);
  }, []);
  const handleChange = (k: keyof BlockFormState, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (formErrors[k as keyof BlockFormErrors]) setFormErrors((p) => ({ ...p, [k]: undefined }));
  };

  const handleSubmit = async () => {
    const errors = validateBlock(form);
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      addToast("error", "Campos incompletos", "Por favor, complete los campos obligatorios.");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 680));

    const cid = parseInt(form.communityId);
    const tid = parseInt(form.towerId);

    // Duplicate check within the same tower
    const dup = blocks.some(
      (b) => b.id !== editing?.id && b.towerId === tid && b.name.trim().toLowerCase() === form.name.trim().toLowerCase()
    );
    if (dup) {
      setSubmitting(false);
      addToast("error", "Operación rechazada", "El Bloque/Sector ya se encuentra registrado en esta estructura.");
      return;
    }

    // Simulate occasional server error (uncomment to test State D):
    // if (Math.random() < 0.15) {
    //   setSubmitting(false);
    //   addToast("error", "Error del sistema", "No se pudo establecer la persistencia del bloque.");
    //   return;
    // }

    if (editing) {
      setBlocks((p) => p.map((b) =>
        b.id === editing.id
          ? { ...b, name: form.name.trim(), description: form.description.trim(), floorStart: parseInt(form.floorStart), floorEnd: parseInt(form.floorEnd) }
          : b
      ));
    } else {
      const floors = parseInt(form.floorEnd) - parseInt(form.floorStart) + 1;
      setBlocks((p) => [...p, {
        id: Date.now(),
        communityId: cid,
        towerId: tid,
        name: form.name.trim(),
        description: form.description.trim(),
        floorStart: parseInt(form.floorStart),
        floorEnd: parseInt(form.floorEnd),
        units: Math.max(0, floors * 4),
        status: "Activa",
      }]);
    }

    setSubmitting(false);
    closeModal();
    addToast(
      "success",
      editing ? "Cambios guardados" : "¡Bloque registrado con éxito!",
      editing
        ? "Los detalles del bloque han sido actualizados correctamente."
        : "Operación registrada en el módulo de auditoría."
    );
  };

  const confirmDeactivate = useCallback(() => {
    if (!deactivating) return;
    const name = deactivating.name;
    setBlocks((p) => p.map((b) => b.id === deactivating.id ? { ...b, status: "Inactiva" } : b));
    setDeactivating(null);
    addToast("warning", "Bloque desactivado", `"${name}" y sus unidades vinculadas han sido suspendidas.`);
  }, [deactivating, setBlocks, addToast]);

  return (
    <>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#0D1F36] tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            Gestión de Bloques
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Sectores y agrupaciones de pisos dentro de cada torre · CU-001-003</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B3D72] text-white text-sm font-semibold hover:bg-[#152E58] active:scale-[0.98] transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 shrink-0"
        >
          <Plus className="w-4 h-4" />Registrar Nuevo Bloque
        </button>
      </div>

      {/* Cascade filters */}
      <HierarchyBar>
        <SelectFilter
          label="Comunidad:"
          value={String(selComm)}
          onChange={(v) => { setSelComm(Number(v)); setSelTower("all"); setSearch(""); }}
          options={communities.map((c) => ({ value: String(c.id), label: c.name }))}
          icon={Building2}
        />
        <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
        <SelectFilter
          label="Torre:"
          value={selTower}
          onChange={(v) => { setSelTower(v); setSearch(""); }}
          options={towerOptions}
          icon={Layers}
        />
        {selTower !== "all" && (
          <motion.span
            key={selTower}
            initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.18 }}
            className="ml-auto text-xs font-mono text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full"
          >
            {commTowers.find((t) => String(t.id) === selTower)?.floors} pisos
          </motion.span>
        )}
      </HierarchyBar>

      {/* KPI row */}
      <motion.div key={`${selComm}-${selTower}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }} className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <KpiCard label="Bloques registrados" value={relevantBlocks.length} icon={Package} color="text-[#1B3D72]" bg="bg-blue-50" />
        <KpiCard label="Activos" value={activeCount} icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-50" />
        <KpiCard label="Pisos cubiertos" value={relevantBlocks.reduce((a, b) => a + (b.floorEnd - b.floorStart + 1), 0)} icon={Hash} color="text-violet-600" bg="bg-violet-50" />
        <KpiCard label="Unidades totales" value={relevantBlocks.reduce((a, b) => a + b.units, 0)} icon={Home} color="text-amber-600" bg="bg-amber-50" />
      </motion.div>

      {/* Data table */}
      <div className="bg-white rounded-2xl border border-[rgba(27,61,114,0.1)] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[rgba(27,61,114,0.08)] flex items-center gap-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar bloque o sector…" />
          <span className="ml-auto text-xs font-mono text-slate-400" aria-live="polite">
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="grid">
            <thead>
              <tr className="bg-[#F6F8FC] border-b border-[rgba(27,61,114,0.08)]">
                {["Nombre del Bloque / Sector", "Estructura Vinculada", "Pisos", "Unidades", "Estado", "Acciones"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[#1B3D72]/60 uppercase tracking-wider font-mono whitespace-nowrap" scope="col">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout" initial={false}>
                {filtered.length === 0 ? (
                  <motion.tr key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <td colSpan={6} className="px-5 py-16 text-center text-slate-400 text-sm">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      {relevantBlocks.length === 0
                        ? "No hay bloques registrados para esta selección. Use el botón superior para agregar uno."
                        : "Sin coincidencias para la búsqueda actual."}
                    </td>
                  </motion.tr>
                ) : (
                  filtered.map((b, i) => {
                    const tower = towers.find((t) => t.id === b.towerId);
                    const community = communities.find((c) => c.id === b.communityId);
                    return (
                      <motion.tr
                        key={b.id}
                        layout
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2, delay: i * 0.03 }}
                        className={clsx(
                          "border-b border-[rgba(27,61,114,0.06)] last:border-0 hover:bg-blue-50/40 transition-colors duration-150",
                          b.status === "Inactiva" && "opacity-60"
                        )}
                      >
                        {/* Name */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-[#1B3D72]/8 flex items-center justify-center shrink-0">
                              <Package className="w-3.5 h-3.5 text-[#1B3D72]/60" />
                            </div>
                            <div>
                              <p className="font-semibold text-[#0D1F36] leading-snug">{b.name}</p>
                              {b.description && (
                                <p className="text-[11px] text-slate-400 truncate max-w-[200px]">{b.description}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Hierarchy */}
                        <td className="px-5 py-3.5">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                              <Building2 className="w-3 h-3 text-slate-300" />
                              <span className="text-xs text-slate-500 truncate">{community?.name ?? "—"}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Layers className="w-3 h-3 text-slate-300" />
                              <span className="text-xs font-medium text-[#1B3D72]">{tower?.name ?? "—"}</span>
                            </div>
                          </div>
                        </td>

                        {/* Floor range */}
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-xs font-medium text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md">
                            {b.floorStart} – {b.floorEnd}
                          </span>
                        </td>

                        {/* Units */}
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-xs font-medium text-[#1B3D72]">{b.units}</span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5"><StatusBadge status={b.status} /></td>

                        {/* Actions */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => openEdit(b)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#1B3D72] bg-blue-50 hover:bg-blue-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
                            >
                              <Pencil className="w-3.5 h-3.5" />Editar
                            </button>
                            {b.status === "Activa" && (
                              <button
                                onClick={() => setDeactivating(b)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                              >
                                <PowerOff className="w-3.5 h-3.5" />Desactivar
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div className="px-5 py-3 border-t border-[rgba(27,61,114,0.06)] bg-[#F6F8FC]/60 flex items-center justify-between">
          <p className="text-xs text-slate-400">CU-001-003 · Gestión de Bloques</p>
          <p className="text-xs font-mono text-slate-400">
            {activeCount} activo{activeCount !== 1 ? "s" : ""} / {relevantBlocks.length} total
          </p>
        </div>
      </div>

      {/* Center-modal form */}
      <BlockFormModal
        open={modalOpen}
        editing={editing}
        form={form}
        errors={formErrors}
        submitting={submitting}
        communities={communities}
        towers={towers}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onClose={closeModal}
      />

      {/* Deactivation danger modal */}
      <BlockDeactivateModal
        block={deactivating}
        towerName={towers.find((t) => t.id === deactivating?.towerId)?.name ?? ""}
        communityName={communities.find((c) => c.id === deactivating?.communityId)?.name ?? ""}
        onConfirm={confirmDeactivate}
        onCancel={() => setDeactivating(null)}
      />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROPIEDADES MODULE  (data-populated skeleton)
// ═══════════════════════════════════════════════════════════════════════════════

// ── Types + validation ───────────────────────────────────────────────────────
interface PropFormState {
  communityId: string; towerId: string; blockId: string;
  code: string; type: PropType; floor: string; area: string; prorrateo: string;
}
interface PropFormErrors {
  communityId?: string; towerId?: string; blockId?: string;
  code?: string; type?: string; prorrateo?: string;
}

function validateProp(d: PropFormState): PropFormErrors {
  const e: PropFormErrors = {};
  if (!d.communityId) e.communityId = "Seleccione la comunidad";
  if (!d.towerId)     e.towerId = "Seleccione la torre";
  if (!d.code.trim()) e.code = "El número de unidad es obligatorio";
  const pr = parseFloat(d.prorrateo);
  if (!d.prorrateo.trim() || isNaN(pr)) e.prorrateo = "Ingrese un porcentaje de prorrateo válido";
  else if (pr <= 0)  e.prorrateo = "El porcentaje de prorrateo debe ser mayor a 0%";
  else if (pr > 100) e.prorrateo = "El porcentaje de prorrateo no puede superar 100%";
  return e;
}
const PROP_EMPTY: PropFormState = {
  communityId: "", towerId: "", blockId: "", code: "",
  type: "Departamento", floor: "1", area: "72", prorrateo: "",
};

// ── Type icon helper ─────────────────────────────────────────────────────────
const PROP_TYPE_ICON: Record<PropType, typeof Building2> = {
  Departamento:    Building2,
  Estacionamiento: Car,
  Bodega:          Warehouse,
};

function PropTypeCell({ type }: { type: PropType }) {
  const Icon = PROP_TYPE_ICON[type];
  return (
    <div className="flex items-center gap-2">
      <div className={clsx(
        "w-6 h-6 rounded-md flex items-center justify-center shrink-0",
        TYPE_STYLE[type].split(" ").slice(0, 1).join(" ")
      )}>
        <Icon className={clsx("w-3.5 h-3.5", TYPE_STYLE[type].split(" ").slice(1, 2).join(" "))} />
      </div>
      <PropTypeBadge val={type} />
    </div>
  );
}

// ── Prorrateo input with % suffix ────────────────────────────────────────────
function ProrrateoInput({ id, value, onChange, error }: {
  id: string; value: string; onChange: (v: string) => void; error?: string;
}) {
  return (
    <div className="relative">
      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        id={id}
        type="number"
        step="0.01"
        min="0.01"
        max="100"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ej: 1.42"
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={clsx(
          "w-full pl-9 pr-10 py-2.5 rounded-lg text-sm font-mono text-[#0D1F36] placeholder-slate-400",
          "bg-[#F4F7FC] border transition-all duration-150 outline-none",
          "focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent",
          "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none",
          error
            ? "border-red-400 ring-1 ring-red-300 bg-red-50 focus:ring-red-400"
            : "border-[rgba(27,61,114,0.15)] hover:border-[rgba(27,61,114,0.3)]"
        )}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-semibold text-slate-400 pointer-events-none">%</span>
    </div>
  );
}

// ── Property deactivation modal (financial impact warning) ───────────────────
function PropDeactivateModal({ property, communityName, onConfirm, onCancel }: {
  property: Property | null; communityName: string; onConfirm: () => void; onCancel: () => void;
}) {
  useEffect(() => {
    if (!property) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [property, onCancel]);

  const Icon = property ? PROP_TYPE_ICON[property.type] : Building2;

  return (
    <AnimatePresence>
      {property && (
        <>
          <motion.div key="pdm-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50 bg-[#0D1F36]/50 backdrop-blur-[2px]" onClick={onCancel} aria-hidden="true" />
          <motion.div key="pdm-card" initial={{ opacity: 0, scale: 0.94, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 16 }} transition={{ duration: 0.22, ease: "easeOut" }} className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="pointer-events-auto w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden" role="alertdialog" aria-modal="true" aria-labelledby="pdm-title" aria-describedby="pdm-desc">

              {/* Danger stripe */}
              <div className="h-1.5 bg-gradient-to-r from-red-500 to-rose-600" />

              <div className="p-6">
                {/* Header */}
                <div className="flex items-start gap-4 mb-5">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h2 id="pdm-title" className="text-base font-semibold text-[#0D1F36] leading-snug">
                      ¿Está seguro de que desea desactivar esta propiedad?
                    </h2>
                    <p id="pdm-desc" className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                      Esta acción <strong className="text-[#0D1F36]">impedirá la asignación de nuevos residentes</strong> y suspenderá la emisión automática de sus gastos comunes.
                    </p>
                  </div>
                </div>

                {/* Affected property card */}
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3.5 mb-4">
                  <p className="text-xs font-mono text-red-500 uppercase tracking-widest mb-2">Unidad afectada</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-100/80 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-red-900">{property.code}</p>
                      <p className="text-xs text-red-700">{property.type} · {communityName}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[11px] font-mono text-red-600">{property.floor < 0 ? "Subterráneo" : `Piso ${property.floor}`}</span>
                        <span className="text-[11px] font-mono text-red-600">{property.prorrateo.toFixed(2)}% prorrateo</span>
                        <span className="text-[11px] font-mono text-red-600">{property.area} m²</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial impact warning */}
                <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-3 mb-5">
                  <BadgeAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 leading-relaxed">
                    <strong>Impacto financiero:</strong> Asegúrese de que la unidad <strong>no posea deudas vigentes</strong> ni gastos comunes pendientes antes de proceder con la desactivación.
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-3">
                  <button onClick={onCancel} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                    Cancelar
                  </button>
                  <button onClick={onConfirm} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2">
                    Confirmar Desactivación
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Module ───────────────────────────────────────────────────────────────────
function PropiedadesModule({ communities, towers, blocks, properties, setProperties, addToast, globalCommunityId }: {
  communities: Community[]; towers: Tower[]; blocks: Block[];
  properties: Property[]; setProperties: React.Dispatch<React.SetStateAction<Property[]>>;
  addToast: (t: ToastType, title: string, msg: string) => void;
  globalCommunityId: number;
}) {
  // Cascade filter state
  const [selComm, setSelComm]   = useState(globalCommunityId);
  const [selTower, setSelTower] = useState("all");
  const [selBlock, setSelBlock] = useState("all");
  const [search, setSearch]     = useState("");

  // Form/slide-over state
  const [panelOpen, setPanelOpen]   = useState(false);
  const [editing, setEditing]       = useState<Property | null>(null);
  const [form, setForm]             = useState<PropFormState>({ ...PROP_EMPTY, communityId: String(globalCommunityId) });
  const [formErrors, setFormErrors] = useState<PropFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Deactivation state
  const [deactivating, setDeactivating] = useState<Property | null>(null);

  // Derived lists
  const commTowers  = towers.filter((t) => t.communityId === selComm && t.status === "Activa");
  const commBlocks  = blocks.filter((b) => b.communityId === selComm && (selTower === "all" || b.towerId === parseInt(selTower)));
  const relevantProps = properties.filter((p) =>
    p.communityId === selComm &&
    (selTower === "all" || p.towerId === parseInt(selTower)) &&
    (selBlock === "all" || p.blockId === parseInt(selBlock))
  );
  const filtered = relevantProps.filter((p) =>
    p.code.toLowerCase().includes(search.toLowerCase()) ||
    p.type.toLowerCase().includes(search.toLowerCase())
  );
  const towerOptions = [{ value: "all", label: "Todas las torres"  }, ...commTowers.map((t) => ({ value: String(t.id), label: t.name }))];
  const blockOptions = [{ value: "all", label: "Todos los bloques" }, ...commBlocks.map((b) => ({ value: String(b.id), label: b.name }))];

  // Form-level cascade options (driven by form.communityId / form.towerId)
  const formTowers = towers.filter((t) => t.communityId === parseInt(form.communityId) && t.status === "Activa");
  const formBlocks = blocks.filter((b) => b.towerId === parseInt(form.towerId));

  // Open create
  const openCreate = () => {
    setEditing(null);
    setForm({
      ...PROP_EMPTY,
      communityId: String(selComm),
      towerId: selTower !== "all" ? selTower : "",
      blockId: selBlock !== "all" ? selBlock : "",
    });
    setFormErrors({});
    setPanelOpen(true);
  };

  // Open edit
  const openEdit = (p: Property) => {
    setEditing(p);
    setForm({
      communityId: String(p.communityId),
      towerId:     String(p.towerId),
      blockId:     String(p.blockId),
      code:        p.code,
      type:        p.type,
      floor:       String(p.floor),
      area:        String(p.area),
      prorrateo:   String(p.prorrateo),
    });
    setFormErrors({});
    setPanelOpen(true);
  };

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    setTimeout(() => { setEditing(null); setFormErrors({}); }, 350);
  }, []);

  const handleChange = (k: keyof PropFormState, v: string) => {
    setForm((prev) => {
      const next = { ...prev, [k]: v };
      // Cascade resets
      if (k === "communityId") { next.towerId = ""; next.blockId = ""; }
      if (k === "towerId")     { next.blockId = ""; }
      return next;
    });
    if (formErrors[k as keyof PropFormErrors]) {
      setFormErrors((p) => ({ ...p, [k]: undefined }));
    }
  };

  const handleSubmit = async () => {
    const errors = validateProp(form);
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      addToast("error", "Campos incompletos", "Por favor, complete los campos obligatorios.");
      return;
    }

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 680));

    // Duplicate check: same code in the same tower
    const tid = parseInt(form.towerId);
    const dup = properties.some(
      (p) => p.id !== editing?.id && p.towerId === tid && p.code.trim().toLowerCase() === form.code.trim().toLowerCase()
    );
    if (dup) {
      setSubmitting(false);
      addToast("error", "Operación rechazada", `La unidad ${form.code.trim()} ya se encuentra registrada en esta estructura.`);
      return;
    }

    // Server error simulation (uncomment to test State D):
    // if (Math.random() < 0.15) {
    //   setSubmitting(false);
    //   addToast("error", "Error del sistema", "No se pudo almacenar la propiedad en la base de datos.");
    //   return;
    // }

    if (editing) {
      setProperties((prev) => prev.map((p) =>
        p.id === editing.id
          ? { ...p, code: form.code.trim(), type: form.type, floor: parseInt(form.floor), area: parseFloat(form.area) || p.area, prorrateo: parseFloat(form.prorrateo) }
          : p
      ));
    } else {
      setProperties((prev) => [...prev, {
        id:          Date.now(),
        communityId: parseInt(form.communityId),
        towerId:     parseInt(form.towerId),
        blockId:     form.blockId ? parseInt(form.blockId) : 0,
        code:        form.code.trim(),
        type:        form.type,
        floor:       parseInt(form.floor),
        area:        parseFloat(form.area) || 0,
        prorrateo:   parseFloat(form.prorrateo),
        occupancy:   "Desocupada",
        status:      "Activa",
      }]);
    }

    setSubmitting(false);
    closePanel();
    addToast(
      "success",
      editing ? "Ficha actualizada" : "¡Propiedad registrada con éxito!",
      editing
        ? "Los datos técnicos de la propiedad han sido actualizados."
        : "Unidad indexada en el registro de auditoría."
    );
  };

  const confirmDeactivate = useCallback(() => {
    if (!deactivating) return;
    const code = deactivating.code;
    setProperties((prev) => prev.map((p) => p.id === deactivating.id ? { ...p, status: "Inactiva" } : p));
    setDeactivating(null);
    addToast("warning", "Propiedad desactivada", `La unidad "${code}" ha sido suspendida del sistema.`);
  }, [deactivating, setProperties, addToast]);

  const activeCount   = relevantProps.filter((p) => p.status    === "Activa").length;
  const ocupadaCount  = relevantProps.filter((p) => p.occupancy === "Ocupada").length;
  const totalProrrateo = relevantProps.reduce((a, p) => a + p.prorrateo, 0);

  return (
    <>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#0D1F36] tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            Gestión de Propiedades
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Departamentos, bodegas y estacionamientos · CU-001-004</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B3D72] text-white text-sm font-semibold hover:bg-[#152E58] active:scale-[0.98] transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 shrink-0"
        >
          <Plus className="w-4 h-4" />Registrar Nueva Propiedad
        </button>
      </div>

      {/* 3-level cascade filter bar */}
      <HierarchyBar>
        <SelectFilter label="Comunidad:" value={String(selComm)} onChange={(v) => { setSelComm(Number(v)); setSelTower("all"); setSelBlock("all"); setSearch(""); }} options={communities.map((c) => ({ value: String(c.id), label: c.name }))} icon={Building2} />
        <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
        <SelectFilter label="Torre:" value={selTower} onChange={(v) => { setSelTower(v); setSelBlock("all"); setSearch(""); }} options={towerOptions} icon={Layers} />
        <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
        <SelectFilter label="Bloque:" value={selBlock} onChange={(v) => { setSelBlock(v); setSearch(""); }} options={blockOptions} icon={Package} />
        {totalProrrateo > 0 && (
          <motion.div key={`${selComm}-${selTower}-${selBlock}`} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }} className="ml-auto flex items-center gap-1.5 text-xs font-mono text-violet-600 bg-violet-50 border border-violet-200 px-2.5 py-1 rounded-full whitespace-nowrap">
            <Percent className="w-3 h-3" />
            Σ prorrateo: {totalProrrateo.toFixed(2)}%
          </motion.div>
        )}
      </HierarchyBar>

      {/* KPI row */}
      <motion.div key={`${selComm}-${selTower}-${selBlock}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }} className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <KpiCard label="Propiedades activas" value={activeCount} icon={Home} color="text-[#1B3D72]" bg="bg-blue-50" />
        <KpiCard label="Ocupadas" value={ocupadaCount} icon={UserCheck} color="text-emerald-600" bg="bg-emerald-50" />
        <KpiCard label="Desocupadas" value={relevantProps.filter((p) => p.occupancy === "Desocupada").length} icon={Home} color="text-slate-500" bg="bg-slate-100" />
        <KpiCard label="Prorrateo total" value={`${totalProrrateo.toFixed(2)}%`} icon={Percent} color="text-violet-600" bg="bg-violet-50" />
      </motion.div>

      {/* Data table */}
      <div className="bg-white rounded-2xl border border-[rgba(27,61,114,0.1)] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[rgba(27,61,114,0.08)] flex items-center gap-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar unidad, código o tipo…" />
          <span className="ml-auto text-xs font-mono text-slate-400" aria-live="polite">
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="grid">
            <thead>
              <tr className="bg-[#F6F8FC] border-b border-[rgba(27,61,114,0.08)]">
                {["N° Propiedad / Unidad", "Tipo", "Piso", "Prorrateo", "Ocupación", "Estado", "Acciones"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[#1B3D72]/60 uppercase tracking-wider font-mono whitespace-nowrap" scope="col">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout" initial={false}>
                {filtered.length === 0 ? (
                  <motion.tr key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <td colSpan={7} className="px-5 py-16 text-center text-slate-400 text-sm">
                      <Home className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      {relevantProps.length === 0
                        ? "No hay propiedades para esta selección. Use el botón superior para agregar una."
                        : "Sin coincidencias para la búsqueda actual."}
                    </td>
                  </motion.tr>
                ) : (
                  filtered.map((p, i) => (
                    <motion.tr
                      key={p.id}
                      layout
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                      className={clsx(
                        "border-b border-[rgba(27,61,114,0.06)] last:border-0 hover:bg-blue-50/40 transition-colors duration-150",
                        p.status === "Inactiva" && "opacity-60"
                      )}
                    >
                      {/* Code */}
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-bold text-[#0D1F36]">{p.code}</span>
                      </td>

                      {/* Type with icon */}
                      <td className="px-5 py-3.5">
                        <PropTypeCell type={p.type} />
                      </td>

                      {/* Floor */}
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs font-medium text-slate-600">
                          {p.floor < 0 ? `Sub.${Math.abs(p.floor)}` : `P.${p.floor}`}
                        </span>
                      </td>

                      {/* Prorrateo */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-xs font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md">
                            {p.prorrateo.toFixed(2)}%
                          </span>
                        </div>
                      </td>

                      {/* Occupancy */}
                      <td className="px-5 py-3.5"><OccupancyBadge val={p.occupancy} /></td>

                      {/* Status */}
                      <td className="px-5 py-3.5"><StatusBadge status={p.status} /></td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openEdit(p)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#1B3D72] bg-blue-50 hover:bg-blue-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
                          >
                            <Pencil className="w-3.5 h-3.5" />Editar
                          </button>
                          {p.status === "Activa" && (
                            <button
                              onClick={() => setDeactivating(p)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                            >
                              <PowerOff className="w-3.5 h-3.5" />Desactivar
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div className="px-5 py-3 border-t border-[rgba(27,61,114,0.06)] bg-[#F6F8FC]/60 flex items-center justify-between">
          <p className="text-xs text-slate-400">CU-001-004 · Gestión de Propiedades</p>
          <p className="text-xs font-mono text-slate-400">
            {ocupadaCount} ocupada{ocupadaCount !== 1 ? "s" : ""} / {relevantProps.length} total
          </p>
        </div>
      </div>

      {/* ── Slide-over panel ─────────────────────────────────────────────────── */}
      <SlideOver
        open={panelOpen}
        title={editing ? "Modificar Ficha de Propiedad" : "Registrar Nueva Propiedad"}
        subtitle={editing ? "Modificar registro técnico" : "Nuevo registro · CU-001-004"}
        onClose={closePanel}
        footer={
          <div className="flex justify-end gap-3">
            <button onClick={closePanel} className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]">
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#1B3D72] hover:bg-[#152E58] active:scale-[0.98] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? <><Spinner />Guardando…</> : editing ? "Guardar Cambios" : "Registrar Propiedad"}
            </button>
          </div>
        }
      >
        {/* Error banner */}
        <AnimatePresence>
          {Object.keys(formErrors).length > 0 && (
            <motion.div key="pfe" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden -mx-6 -mt-5">
              <div className="flex items-center gap-2.5 px-6 py-3 bg-red-50 border-b border-red-200">
                <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-700 font-medium">Corrija los campos marcados antes de continuar.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Hierarchy context ── */}
        <div className="bg-[#F6F8FC] rounded-xl border border-[rgba(27,61,114,0.08)] px-4 py-3.5 space-y-3">
          <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">Jerarquía física</p>

          <Field label="Comunidad" id="pf-comm" required error={formErrors.communityId}>
            <div className="relative">
              <select id="pf-comm" value={form.communityId} onChange={(e) => handleChange("communityId", e.target.value)} disabled={!!editing}
                className={clsx("w-full px-3 py-2 pr-9 rounded-lg text-sm appearance-none outline-none transition-all bg-white border focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent cursor-pointer",
                  formErrors.communityId ? "border-red-400 ring-1 ring-red-300 bg-red-50" : "border-[rgba(27,61,114,0.15)]",
                  editing && "opacity-60 cursor-not-allowed"
                )}>
                <option value="">— Seleccionar —</option>
                {communities.filter((c) => c.status === "Activa").map((c) => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </Field>

          <Field label="Torre" id="pf-tower" required error={formErrors.towerId}>
            <div className="relative">
              <select id="pf-tower" value={form.towerId} onChange={(e) => handleChange("towerId", e.target.value)} disabled={!!editing || !form.communityId}
                className={clsx("w-full px-3 py-2 pr-9 rounded-lg text-sm appearance-none outline-none transition-all bg-white border focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent",
                  formErrors.towerId ? "border-red-400 ring-1 ring-red-300 bg-red-50" : "border-[rgba(27,61,114,0.15)]",
                  (editing || !form.communityId) && "opacity-60 cursor-not-allowed"
                )}>
                <option value="">{!form.communityId ? "Seleccione comunidad primero" : "— Seleccionar torre —"}</option>
                {formTowers.map((t) => <option key={t.id} value={String(t.id)}>{t.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </Field>

          <Field label="Bloque" id="pf-block" hint="Opcional si la torre no tiene subdivisión de bloques.">
            <div className="relative">
              <select id="pf-block" value={form.blockId} onChange={(e) => handleChange("blockId", e.target.value)} disabled={!!editing || !form.towerId}
                className={clsx("w-full px-3 py-2 pr-9 rounded-lg text-sm appearance-none outline-none transition-all bg-white border border-[rgba(27,61,114,0.15)] focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent",
                  (editing || !form.towerId) && "opacity-60 cursor-not-allowed"
                )}>
                <option value="">{!form.towerId ? "Seleccione torre primero" : "— Sin bloque específico —"}</option>
                {formBlocks.map((b) => <option key={b.id} value={String(b.id)}>{b.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </Field>
        </div>

        {/* ── Technical fields ── */}
        <Field label="N° de Unidad / Código" id="pf-code" required error={formErrors.code}
          hint={!formErrors.code ? "Identificador único de la unidad en la estructura. Ej: 201, A-502, Bodega-05." : undefined}>
          <TextInput id="pf-code" value={form.code} onChange={(v) => handleChange("code", v)} placeholder="Ej: 201, A-502, EST-03, BOD-12" error={formErrors.code} />
        </Field>

        <Field label="Tipo de Propiedad" id="pf-type" required>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-labelledby="pf-type">
            {(["Departamento", "Estacionamiento", "Bodega"] as PropType[]).map((t) => {
              const Icon = PROP_TYPE_ICON[t];
              const active = form.type === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleChange("type", t)}
                  role="radio"
                  aria-checked={active}
                  className={clsx(
                    "flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]",
                    active
                      ? "border-[#1B3D72] bg-[#1B3D72]/5 text-[#1B3D72]"
                      : "border-[rgba(27,61,114,0.12)] bg-white text-slate-400 hover:border-[rgba(27,61,114,0.25)] hover:text-slate-600"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[11px] font-medium leading-tight">{t}</span>
                </button>
              );
            })}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Piso" id="pf-floor" required hint="Use valores negativos para subterráneos.">
            <NumericStepper id="pf-floor" value={form.floor} onChange={(v) => handleChange("floor", v)} min={-5} max={99} />
          </Field>
          <Field label="Superficie (m²)" id="pf-area" hint="Superficie total de la unidad.">
            <TextInput id="pf-area" type="number" value={form.area} onChange={(v) => handleChange("area", v)} placeholder="Ej: 72.5" />
          </Field>
        </div>

        <Field label="Porcentaje de Prorrateo" id="pf-prorrateo" required error={formErrors.prorrateo}
          hint={!formErrors.prorrateo ? "Proporción de los gastos comunes asignada a esta unidad. Acepta decimales." : undefined}>
          <ProrrateoInput id="pf-prorrateo" value={form.prorrateo} onChange={(v) => handleChange("prorrateo", v)} error={formErrors.prorrateo} />
        </Field>

        <p className="text-xs text-slate-400 pt-1">
          <span className="text-red-500 font-bold">*</span> Campos obligatorios
        </p>
      </SlideOver>

      {/* Deactivation modal */}
      <PropDeactivateModal
        property={deactivating}
        communityName={communities.find((c) => c.id === deactivating?.communityId)?.name ?? ""}
        onConfirm={confirmDeactivate}
        onCancel={() => setDeactivating(null)}
      />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// OCUPANTES MODULE  (with Timeline)
// ═══════════════════════════════════════════════════════════════════════════════

function OcupantesModule({ communities, properties, occupants, timeline, globalCommunityId }: {
  communities: Community[]; properties: Property[]; occupants: Occupant[]; timeline: TimelineEv[]; globalCommunityId: number;
}) {
  const [selComm, setSelComm] = useState(globalCommunityId);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Occupant | null>(null);

  const commProps = properties.filter((p) => p.communityId === selComm);
  const relevantOcc = occupants.filter((o) => commProps.some((p) => p.id === o.propertyId));
  const filtered = relevantOcc.filter((o) => o.name.toLowerCase().includes(search.toLowerCase()) || o.rut.toLowerCase().includes(search.toLowerCase()));

  const selectedProp = selected ? properties.find((p) => p.id === selected.propertyId) : null;
  const propTimeline = selected ? timeline.filter((e) => e.propertyId === selected.propertyId) : [];

  const ROLE_STYLE: Record<OccupantRole, string> = {
    Propietario: "bg-[#1B3D72]/8 text-[#1B3D72]",
    Arrendatario: "bg-violet-50 text-violet-700",
    Familiar: "bg-emerald-50 text-emerald-700",
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#0D1F36] tracking-tight" style={{ fontFamily: "var(--font-display)" }}>Control de Ocupantes e Historial</h1>
          <p className="text-sm text-slate-500 mt-0.5">Residentes activos y línea de tiempo de ocupación · CU-001-005</p>
        </div>
      </div>
      <HierarchyBar>
        <SelectFilter label="Comunidad:" value={String(selComm)} onChange={(v) => { setSelComm(Number(v)); setSelected(null); }} options={communities.map((c) => ({ value: String(c.id), label: c.name }))} icon={Building2} />
      </HierarchyBar>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Occupant table */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-[rgba(27,61,114,0.1)] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[rgba(27,61,114,0.08)] flex items-center gap-3">
            <SearchBar value={search} onChange={setSearch} placeholder="Buscar ocupante o RUT…" />
            <span className="ml-auto text-xs font-mono text-slate-400" aria-live="polite">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="grid">
              <thead><tr className="bg-[#F6F8FC] border-b border-[rgba(27,61,114,0.08)]">
                {["Ocupante", "RUT", "Unidad", "Rol", "Desde", ""].map((h) => <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[#1B3D72]/60 uppercase tracking-wider font-mono whitespace-nowrap" scope="col">{h}</th>)}
              </tr></thead>
              <tbody>
                {filtered.length === 0
                  ? <tr><td colSpan={6} className="px-5 py-16 text-center text-slate-400 text-sm"><Users className="w-8 h-8 mx-auto mb-2 opacity-30" />Sin ocupantes para esta comunidad.</td></tr>
                  : filtered.map((o, i) => {
                    const prop = properties.find((p) => p.id === o.propertyId);
                    const isSelected = selected?.id === o.id;
                    return (
                      <motion.tr key={o.id} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18, delay: i * 0.05 }} onClick={() => setSelected(isSelected ? null : o)} className={clsx("border-b border-[rgba(27,61,114,0.06)] last:border-0 transition-colors cursor-pointer", isSelected ? "bg-blue-50 hover:bg-blue-100/60" : "hover:bg-blue-50/40")}>
                        <td className="px-5 py-3.5"><div className="flex items-center gap-2.5"><div className="w-7 h-7 rounded-full bg-[#1B3D72]/10 flex items-center justify-center shrink-0 text-xs font-semibold text-[#1B3D72]">{o.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}</div><div><p className="font-medium text-[#0D1F36] text-xs leading-snug">{o.name}</p><p className="text-[11px] text-slate-400">{o.email}</p></div></div></td>
                        <td className="px-5 py-3.5"><span className="font-mono text-xs text-slate-500">{o.rut}</span></td>
                        <td className="px-5 py-3.5"><span className="font-mono text-xs font-medium text-[#1B3D72] bg-blue-50 px-2 py-0.5 rounded-md">{prop?.code ?? "—"}</span></td>
                        <td className="px-5 py-3.5"><span className={clsx("inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium", ROLE_STYLE[o.role])}>{o.role}</span></td>
                        <td className="px-5 py-3.5"><span className="font-mono text-[11px] text-slate-400">{o.since}</span></td>
                        <td className="px-5 py-3.5"><Clock className={clsx("w-4 h-4 transition-colors", isSelected ? "text-[#1B3D72]" : "text-slate-300")} /></td>
                      </motion.tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-[rgba(27,61,114,0.06)] bg-[#F6F8FC]/60">
            <p className="text-xs text-slate-400">Seleccione un ocupante para ver su historial cronológico →</p>
          </div>
        </div>

        {/* Timeline panel */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[rgba(27,61,114,0.1)] shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-[rgba(27,61,114,0.08)] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#1B3D72]" />
            <h2 className="text-sm font-semibold text-[#0D1F36]">Historial de Ocupación</h2>
            {selected && <span className="ml-auto font-mono text-xs text-[#1B3D72] bg-blue-50 px-2 py-0.5 rounded-md">{selectedProp?.code}</span>}
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div key={selected.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                  <div className="mb-4 pb-4 border-b border-[rgba(27,61,114,0.08)]">
                    <p className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-1">Ocupante activo</p>
                    <p className="text-sm font-semibold text-[#0D1F36]">{selected.name}</p>
                    <p className="text-xs text-slate-400">{selected.role} · desde {selected.since}</p>
                  </div>
                  <Timeline events={propTimeline} />
                </motion.div>
              ) : (
                <motion.div key="empty-tl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-48 text-slate-400">
                  <Clock className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-sm text-center">Seleccione un ocupante de la tabla para ver su historial cronológico.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESIDENT PORTAL  (mobile-responsive view)
// ═══════════════════════════════════════════════════════════════════════════════

function ResidentPortal({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<ResidentTab>("unidad");
  const resident = OCCUPANTS[0];
  const property = PROPERTIES.find((p) => p.id === resident.propertyId)!;
  const community = COMMUNITIES[0];

  const TABS: { id: ResidentTab; icon: typeof Home; label: string }[] = [
    { id: "unidad", icon: Home, label: "Mi Unidad" },
    { id: "estructura", icon: Building2, label: "Estructura" },
    { id: "solicitudes", icon: FileText, label: "Solicitudes" },
  ];

  return (
    <div className="fixed inset-0 z-[200] bg-slate-800/70 backdrop-blur-sm flex items-center justify-center p-4 lg:p-8" onClick={onBack}>
      {/* Device frame */}
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-slate-700 flex flex-col" style={{ height: "min(780px, 90vh)" }}>
        {/* Status bar */}
        <div className="shrink-0 bg-[#1B3D72] px-6 pt-3 pb-2 flex items-center justify-between">
          <span className="text-[11px] font-mono text-white/70">9:41</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-white/70">●●●</span>
          </div>
        </div>

        {/* App header */}
        <div className="shrink-0 bg-[#1B3D72] px-5 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-blue-200/70 font-mono uppercase tracking-wider">Portal Residente</p>
              <p className="text-white font-semibold leading-tight">{community.name}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-xs font-semibold text-white">{resident.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}</span>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto bg-[#F0F4F9]">
          <AnimatePresence mode="wait">
            {activeTab === "unidad" && (
              <motion.div key="unidad" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22 }} className="p-4 space-y-3">
                {/* Property card */}
                <div className="bg-white rounded-2xl border border-[rgba(27,61,114,0.08)] p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1B3D72]/10 flex items-center justify-center shrink-0"><KeyRound className="w-5 h-5 text-[#1B3D72]" /></div>
                    <div>
                      <p className="text-xs text-slate-400 font-mono uppercase tracking-wide">Mi Propiedad</p>
                      <p className="font-bold text-[#0D1F36]" style={{ fontFamily: "var(--font-display)" }}>Unidad {property.code}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ label: "Tipo", val: property.type }, { label: "Piso", val: `Piso ${property.floor}` }, { label: "Superficie", val: `${property.area} m²` }, { label: "Estado", val: property.occupancy }].map(({ label, val }) => (
                      <div key={label} className="bg-[#F6F8FC] rounded-xl px-3 py-2.5">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
                        <p className="text-xs font-semibold text-[#0D1F36]">{val}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resident info card */}
                <div className="bg-white rounded-2xl border border-[rgba(27,61,114,0.08)] p-4 shadow-sm">
                  <p className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-3">Datos del Residente</p>
                  <div className="space-y-2.5">
                    {[{ label: "Nombre", val: resident.name }, { label: "RUT", val: resident.rut }, { label: "Email", val: resident.email }, { label: "Teléfono", val: resident.phone }, { label: "Rol", val: resident.role }, { label: "Residente desde", val: resident.since }].map(({ label, val }) => (
                      <div key={label} className="flex items-start justify-between gap-2 text-xs border-b border-[rgba(27,61,114,0.06)] pb-2 last:border-0">
                        <span className="text-slate-400 shrink-0">{label}</span>
                        <span className="font-medium text-[#0D1F36] text-right">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Historial preview */}
                <div className="bg-white rounded-2xl border border-[rgba(27,61,114,0.08)] p-4 shadow-sm">
                  <p className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-3">Actividad Reciente</p>
                  <Timeline events={TIMELINE.slice(0, 3)} />
                </div>
              </motion.div>
            )}

            {activeTab === "estructura" && (
              <motion.div key="estructura" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22 }} className="p-4 space-y-3">
                <div className="bg-white rounded-2xl border border-[rgba(27,61,114,0.08)] p-4 shadow-sm">
                  <p className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-3">Comunidad</p>
                  <div className="flex items-center gap-3 mb-3 pb-3 border-b border-[rgba(27,61,114,0.06)]">
                    <div className="w-10 h-10 rounded-xl bg-[#1B3D72]/10 flex items-center justify-center"><Building2 className="w-5 h-5 text-[#1B3D72]" /></div>
                    <div><p className="font-semibold text-[#0D1F36] text-sm">{community.name}</p><p className="text-xs text-slate-400">{community.address}</p></div>
                  </div>
                  {TOWERS.filter((t) => t.communityId === 1).map((t) => (
                    <div key={t.id} className="flex items-center gap-2.5 py-2.5 border-b border-[rgba(27,61,114,0.05)] last:border-0">
                      <div className="w-7 h-7 rounded-lg bg-[#1B3D72]/8 flex items-center justify-center shrink-0"><Layers className="w-3.5 h-3.5 text-[#1B3D72]/60" /></div>
                      <div className="flex-1"><p className="text-xs font-semibold text-[#0D1F36]">{t.name}</p><p className="text-[10px] text-slate-400">{t.floors} pisos</p></div>
                      <StatusBadge status={t.status} />
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-2xl border border-[rgba(27,61,114,0.08)] p-4 shadow-sm">
                  <p className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-3">Mi Bloque</p>
                  {BLOCKS.filter((b) => b.towerId === 1).slice(0, 2).map((b) => (
                    <div key={b.id} className={clsx("flex items-center gap-2.5 py-2.5 border-b border-[rgba(27,61,114,0.05)] last:border-0", b.id === 1 && "bg-blue-50/50 -mx-2 px-2 rounded-lg")}>
                      <div className="w-7 h-7 rounded-lg bg-[#1B3D72]/8 flex items-center justify-center shrink-0"><Package className="w-3.5 h-3.5 text-[#1B3D72]/60" /></div>
                      <div className="flex-1"><p className="text-xs font-semibold text-[#0D1F36]">{b.name}{b.id === 1 && <span className="ml-1.5 text-[10px] font-mono text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">Mi bloque</span>}</p><p className="text-[10px] text-slate-400">{b.units} unidades</p></div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "solicitudes" && (
              <motion.div key="solicitudes" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22 }} className="p-4 space-y-3">
                {[
                  { title: "Cambio de titular", date: "Pendiente", color: "bg-amber-50 text-amber-700", icon: RefreshCw },
                  { title: "Alta de familiar", date: "Aprobada · 12/03/2024", color: "bg-emerald-50 text-emerald-700", icon: UserCheck },
                  { title: "Solicitud de estacionamiento", date: "Aprobada · 22/06/2024", color: "bg-emerald-50 text-emerald-700", icon: ClipboardList },
                ].map((s, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-[rgba(27,61,114,0.08)] p-4 shadow-sm flex items-center gap-3">
                    <div className={clsx("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", s.color.split(" ")[0])}><s.icon className={clsx("w-4 h-4", s.color.split(" ")[1])} /></div>
                    <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-[#0D1F36] leading-snug">{s.title}</p><p className="text-[11px] text-slate-400">{s.date}</p></div>
                    <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                  </div>
                ))}
                <button className="w-full py-3 rounded-2xl border-2 border-dashed border-[rgba(27,61,114,0.2)] text-sm font-medium text-[#1B3D72] hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />Nueva Solicitud
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom nav */}
        <nav className="shrink-0 bg-white border-t border-[rgba(27,61,114,0.1)] px-2 py-2 flex items-center justify-around safe-area-bottom">
          {TABS.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setActiveTab(id)} className={clsx("flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all", id === activeTab ? "text-[#1B3D72]" : "text-slate-400 hover:text-slate-600")}>
              <Icon className={clsx("w-5 h-5 transition-transform", id === activeTab && "scale-110")} />
              <span className={clsx("text-[10px] font-medium", id === activeTab && "font-semibold")}>{label}</span>
              {id === activeTab && <motion.div layoutId="tab-indicator" className="w-1 h-1 rounded-full bg-[#1B3D72]" transition={{ type: "spring", stiffness: 500, damping: 30 }} />}
            </button>
          ))}
        </nav>
      </div>

      {/* Close hint */}
      <button onClick={onBack} className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors" aria-label="Cerrar portal residente">
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIDEBAR
// ═══════════════════════════════════════════════════════════════════════════════

const SIDEBAR_NAV: { icon: typeof Building2; label: string; module: Module; cu: string }[] = [
  { icon: LayoutGrid, label: "Dashboard de Activos", module: "dashboard", cu: "Inicio" },
  { icon: Building2, label: "Comunidades", module: "comunidades", cu: "CU-001-001" },
  { icon: Layers, label: "Torres", module: "torres", cu: "CU-001-002" },
  { icon: Package, label: "Bloques", module: "bloques", cu: "CU-001-003" },
  { icon: Home, label: "Propiedades", module: "propiedades", cu: "CU-001-004" },
  { icon: Users, label: "Ocupantes", module: "ocupantes", cu: "CU-001-005" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SPLASH SCREEN (intro / landing)
// ═══════════════════════════════════════════════════════════════════════════════

const SPLASH_FEATURES = [
  {
    icon: Building2,
    color: "text-blue-300",
    bg: "bg-blue-500/15 border-blue-400/20",
    title: "Gestión Jerárquica",
    desc: "Comunidades → Torres → Bloques → Propiedades. Navegación en cascada con filtros en tiempo real.",
  },
  {
    icon: Users,
    color: "text-violet-300",
    bg: "bg-violet-500/15 border-violet-400/20",
    title: "Control de Ocupantes",
    desc: "Residentes, propietarios y arrendatarios con historial cronológico de ocupación por unidad.",
  },
  {
    icon: BarChart3,
    color: "text-emerald-300",
    bg: "bg-emerald-500/15 border-emerald-400/20",
    title: "Dashboard Global",
    desc: "Métricas de ocupación, totales por comunidad y actividad reciente calculados en tiempo real.",
  },
];

function SplashScreen({ onEnter }: { onEnter: () => void }) {
  return (
    <motion.div
      key="splash"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center overflow-y-auto py-10 px-4"
      style={{
        background: "linear-gradient(145deg, #080F1C 0%, #1B3D72 50%, #0D1F36 100%)",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "56px 56px" }} aria-hidden="true" />
      {/* Orbs */}
      <div className="absolute top-1/3 left-1/5 w-96 h-96 rounded-full bg-[#2563EB]/10 blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#7C3AED]/8 blur-3xl pointer-events-none" aria-hidden="true" />

      {/* Content */}
      <div className="relative w-full max-w-3xl flex flex-col items-center text-center">

        {/* Logo mark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-7"
        >
          <div className="w-20 h-20 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto shadow-2xl backdrop-blur-sm">
            <Building2 className="w-9 h-9 text-white" />
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="mt-3 flex items-center justify-center gap-2"
          >
            <span className="text-[11px] font-mono text-white/30 uppercase tracking-[0.3em]">Sistema de Gestión</span>
          </motion.div>
        </motion.div>

        {/* Brand heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
          className="text-5xl sm:text-6xl font-bold text-white tracking-tight leading-none mb-4"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Edificio Mirador
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.45 }}
          className="text-lg text-blue-200/70 max-w-xl leading-relaxed mb-2"
        >
          Plataforma de Gestión de Activos Inmobiliarios
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42, duration: 0.4 }}
          className="text-sm text-white/40 max-w-md leading-relaxed mb-12"
        >
          Administre comunidades, torres, propiedades y residentes desde una sola plataforma integrada con trazabilidad completa.
        </motion.p>

        {/* Feature cards */}
        <div className="grid sm:grid-cols-3 gap-4 w-full mb-12">
          {SPLASH_FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1, duration: 0.4, ease: "easeOut" }}
              className={clsx("rounded-2xl border p-5 text-left backdrop-blur-sm", f.bg)}
            >
              <div className={clsx("w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center mb-3")}>
                <f.icon className={clsx("w-4.5 h-4.5", f.color)} />
              </div>
              <p className="text-sm font-semibold text-white mb-1">{f.title}</p>
              <p className="text-xs text-white/50 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.78, duration: 0.4 }}
          className="flex flex-col items-center gap-4"
        >
          <button
            onClick={onEnter}
            className={clsx(
              "group inline-flex items-center gap-3 px-8 py-4 rounded-2xl",
              "bg-white text-[#1B3D72] font-semibold text-base",
              "hover:bg-blue-50 active:scale-[0.98] transition-all duration-200 shadow-xl",
              "focus:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
            )}
          >
            <Zap className="w-5 h-5 text-[#1B3D72]" />
            Iniciar Sesión
            <ArrowRight className="w-4.5 h-4.5 text-[#1B3D72]/60 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-[11px] text-white/25 font-mono uppercase tracking-widest">WCAG AA · Prototipo interactivo</p>
        </motion.div>
      </div>

      {/* Version footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="relative mt-10 text-[11px] text-white/20 font-mono uppercase tracking-widest text-center"
      >
        Edificio Mirador · Admin v2.0 · 2025
      </motion.p>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELP MODULE
// ═══════════════════════════════════════════════════════════════════════════════

const HELP_MODULES: { module: Module; icon: typeof Building2; color: string; bg: string; title: string; desc: string }[] = [
  { module: "dashboard",    icon: LayoutGrid, color: "text-[#1B3D72]", bg: "bg-blue-50",   title: "Dashboard de Activos",        desc: "Vista global con KPIs en tiempo real: comunidades activas, torres, tasa de ocupación y barras de ocupación por comunidad." },
  { module: "comunidades",  icon: Building2,  color: "text-[#1B3D72]", bg: "bg-blue-50",   title: "Gestión de Comunidades",      desc: "Registre y administre comunidades (CU-001-001). Configure nombre, dirección, RUT y estructura base. Permite activar/desactivar." },
  { module: "torres",       icon: Layers,     color: "text-violet-600", bg: "bg-violet-50", title: "Gestión de Torres",           desc: "Administre torres por comunidad (CU-001-002). Configure nombre, pisos y descripción. Cada torre puede contener múltiples bloques." },
  { module: "bloques",      icon: Package,    color: "text-orange-600", bg: "bg-orange-50", title: "Gestión de Bloques",          desc: "Subdivida torres en bloques o sectores por rango de pisos (CU-001-003). Facilita la organización física de las unidades." },
  { module: "propiedades",  icon: Home,       color: "text-amber-600",  bg: "bg-amber-50",  title: "Gestión de Propiedades",      desc: "Administre departamentos, bodegas y estacionamientos (CU-001-004). Incluye prorrateo, tipo, piso y estado de ocupación." },
  { module: "ocupantes",    icon: Users,      color: "text-emerald-600",bg: "bg-emerald-50",title: "Control de Ocupantes",        desc: "Registre propietarios, arrendatarios y familiares por unidad (CU-001-005). Incluye línea de tiempo cronológica de historial." },
];

const HELP_FAQ: { q: string; a: string }[] = [
  { q: "¿Cómo registro una nueva propiedad?",          a: "Vaya al módulo «Gestión de Propiedades», seleccione la jerarquía (Comunidad → Torre → Bloque) y haga clic en «+ Registrar Nueva Propiedad». Complete el código de unidad, tipo, piso y porcentaje de prorrateo." },
  { q: "¿Qué significa el Prorrateo?",                 a: "El prorrateo es el porcentaje de los gastos comunes que corresponde a cada unidad. La suma de todos los prorrateos de una comunidad debe sumar 100%. El sistema muestra el total acumulado en la barra de filtros." },
  { q: "¿Puedo desactivar una comunidad con unidades activas?", a: "Sí, pero el sistema le advertirá que la acción suspenderá el acceso a sus torres y unidades vinculadas. Se recomienda desactivar las unidades individuales antes de desactivar la comunidad." },
  { q: "¿Cómo veo el historial de un residente?",     a: "En el módulo «Control de Ocupantes», seleccione la comunidad y haga clic sobre cualquier fila de la tabla de ocupantes. El panel derecho mostrará la línea de tiempo cronológica de esa unidad." },
  { q: "¿Cómo accedo a la Vista Residente?",           a: "Haga clic en «Vista Residente» en la barra lateral o en el botón del encabezado. Esta vista simula la experiencia del portal móvil que ven los copropietarios, con información de su unidad, estructura y solicitudes." },
  { q: "¿Qué diferencia hay entre los dos roles?",     a: "«Personal Administrativo» tiene visión global: Dashboard y Comunidades. «Administrador de la Comunidad» gestiona operaciones locales: Torres, Bloques, Propiedades y Ocupantes de su edificio asignado." },
];

function HelpModule({ role }: { role: AuthRole }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const allowedMods = role === "operaciones" ? ["dashboard", "comunidades"] : ["torres", "bloques", "propiedades", "ocupantes"];
  const visibleHelp = HELP_MODULES.filter((h) => allowedMods.includes(h.module));

  return (
    <>
      {/* Header */}
      <div className="mb-7">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-[#1B3D72]/8 flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5 text-[#1B3D72]" />
          </div>
          <h1 className="text-2xl font-semibold text-[#0D1F36] tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            Ayuda y Documentación
          </h1>
        </div>
        <p className="text-sm text-slate-500 ml-13">Guía de referencia rápida para el sistema de gestión de activos.</p>
      </div>

      {/* Modules for this role */}
      <div className="bg-white rounded-2xl border border-[rgba(27,61,114,0.1)] shadow-sm overflow-hidden mb-5">
        <div className="px-5 py-4 border-b border-[rgba(27,61,114,0.08)] flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#1B3D72]" />
          <h2 className="text-sm font-semibold text-[#0D1F36]">Módulos disponibles para su perfil</h2>
          <span className="ml-auto text-xs font-mono text-slate-400">{visibleHelp.length} módulo{visibleHelp.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-[rgba(27,61,114,0.06)]">
          {visibleHelp.map((h) => (
            <div key={h.module} className="flex items-start gap-4 px-5 py-5 hover:bg-blue-50/30 transition-colors">
              <div className={clsx("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5", h.bg)}>
                <h.icon className={clsx("w-4 h-4", h.color)} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0D1F36] mb-1">{h.title}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{h.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick tips */}
      <div className="grid sm:grid-cols-3 gap-3 mb-5">
        {[
          { icon: Zap,        color: "text-amber-600",  bg: "bg-amber-50",  title: "Acciones rápidas",   tip: "Use los botones de fila «Editar» y «Desactivar» para operar sin abrir el formulario completo." },
          { icon: Search,     color: "text-blue-600",   bg: "bg-blue-50",   title: "Búsqueda en tabla",  tip: "Cada tabla tiene una barra de búsqueda en tiempo real. Filtra por nombre, código o tipo automáticamente." },
          { icon: RefreshCw,  color: "text-emerald-600",bg: "bg-emerald-50",title: "Datos en tiempo real",tip: "Los KPI del Dashboard y los contadores del menú lateral se actualizan al instante con cada cambio." },
        ].map((t) => (
          <div key={t.title} className="bg-white rounded-xl border border-[rgba(27,61,114,0.1)] shadow-sm px-4 py-4 flex items-start gap-3">
            <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", t.bg)}>
              <t.icon className={clsx("w-4 h-4", t.color)} />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#0D1F36] mb-1">{t.title}</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">{t.tip}</p>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ accordion */}
      <div className="bg-white rounded-2xl border border-[rgba(27,61,114,0.1)] shadow-sm overflow-hidden mb-5">
        <div className="px-5 py-4 border-b border-[rgba(27,61,114,0.08)] flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#1B3D72]" />
          <h2 className="text-sm font-semibold text-[#0D1F36]">Preguntas frecuentes</h2>
        </div>
        <ul className="divide-y divide-[rgba(27,61,114,0.06)]">
          {HELP_FAQ.map((item, i) => (
            <li key={i}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-blue-50/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3B82F6]"
                aria-expanded={openFaq === i}
              >
                <span className="flex-1 text-sm font-medium text-[#0D1F36]">{item.q}</span>
                <motion.span
                  animate={{ rotate: openFaq === i ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0 text-slate-400"
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.span>
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-4 text-sm text-slate-500 leading-relaxed border-t border-[rgba(27,61,114,0.06)] pt-3">
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          ))}
        </ul>
      </div>

      {/* Support footer */}
      <div className="bg-gradient-to-r from-[#1B3D72] to-[#2563EB] rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">¿Necesita asistencia?</p>
            <p className="text-xs text-blue-200/70">Contacte al equipo de soporte técnico del sistema.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-mono text-white/60 bg-white/10 rounded-lg px-3 py-2">soporte@mirador.cl</span>
          <span className="text-xs font-mono text-white/60 bg-white/10 rounded-lg px-3 py-2">v2.0.0</span>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════════

const MOCK_CREDENTIALS: Record<string, { pass: string; role: AuthRole; name: string }> = {
  "operacion@gmail.com":     { pass: "1234", role: "operaciones",    name: "Carlos Acosta" },
  "administrador@gmail.com": { pass: "1234", role: "admin_comunidad", name: "Rosa Pérez" },
};

function LoginScreen({ onLogin, onBack }: { onLogin: (role: AuthRole, name: string) => void; onBack: () => void }) {
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);

  const fill = (e: string, p: string) => { setEmail(e); setPassword(p); setError(""); };

  const handleSubmit = async () => {
    setError("");
    if (!email.trim() || !password.trim()) { setError("Ingrese su correo y contraseña para continuar."); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    const match = MOCK_CREDENTIALS[email.trim().toLowerCase()];
    if (!match || match.pass !== password) {
      setLoading(false);
      setError("Credenciales incorrectas. Verifique su correo y contraseña.");
      return;
    }
    setLoading(false);
    onLogin(match.role, match.name);
  };

  const onKey = (e: React.KeyboardEvent) => { if (e.key === "Enter") handleSubmit(); };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #0D1F36 0%, #1B3D72 55%, #0D1F36 100%)", fontFamily: "var(--font-sans)" }}
    >
      {/* Decorative grid */}
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "48px 48px" }} aria-hidden="true" />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-[#2563EB]/10 blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#1B3D72]/20 blur-3xl pointer-events-none" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Navy header band */}
          <div className="bg-gradient-to-br from-[#1B3D72] to-[#0D1F36] px-8 py-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold leading-none" style={{ fontFamily: "var(--font-display)" }}>Edificio Mirador</p>
                <p className="text-[11px] text-blue-200/70 font-mono mt-0.5 uppercase tracking-wider">Sistema de Gestión de Activos</p>
              </div>
            </div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold leading-snug" style={{ fontFamily: "var(--font-display)" }}>
                  Bienvenido de vuelta
                </h1>
                <p className="text-sm text-blue-200/70 mt-1">Ingrese sus credenciales para acceder al sistema.</p>
              </div>
              <button
                onClick={onBack}
                className="shrink-0 flex items-center gap-1 text-[11px] font-mono text-blue-200/50 hover:text-blue-200/90 transition-colors mt-0.5 focus:outline-none"
                aria-label="Volver a la pantalla de inicio"
              >
                <ChevronUp className="w-3 h-3 rotate-[-90deg]" />
                Inicio
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="px-8 py-7 space-y-5">
            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-sm font-medium text-[#0D1F36]">Correo electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="login-email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  onKeyDown={onKey} placeholder="ejemplo@email.com" autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-[#0D1F36] placeholder-slate-400 bg-[#F4F7FC] border border-[rgba(27,61,114,0.15)] hover:border-[rgba(27,61,114,0.3)] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="login-pass" className="text-sm font-medium text-[#0D1F36]">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="login-pass" type={showPass ? "text" : "password"} value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  onKeyDown={onKey} placeholder="••••••••" autoComplete="current-password"
                  className="w-full pl-10 pr-12 py-3 rounded-xl text-sm text-[#0D1F36] placeholder-slate-400 bg-[#F4F7FC] border border-[rgba(27,61,114,0.15)] hover:border-[rgba(27,61,114,0.3)] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all"
                />
                <button onClick={() => setShowPass((p) => !p)} type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none" aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}>
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit} disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-[#1B3D72] hover:bg-[#152E58] active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <><Spinner />Verificando…</> : "Ingresar al sistema"}
            </button>

            {/* Demo accounts */}
            <div className="pt-1">
              <p className="text-xs text-slate-400 text-center mb-3 font-mono uppercase tracking-wider">Cuentas de demostración</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Personal Adm.", email: "operacion@gmail.com",     icon: ShieldFill, color: "text-blue-600", bg: "bg-blue-50 hover:bg-blue-100 border-blue-200" },
                  { label: "Admin. Comunidad", email: "administrador@gmail.com", icon: Building2,  color: "text-violet-600", bg: "bg-violet-50 hover:bg-violet-100 border-violet-200" },
                ].map((acc) => (
                  <button
                    key={acc.email} type="button"
                    onClick={() => fill(acc.email, "1234")}
                    className={clsx("flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]", acc.bg)}
                  >
                    <acc.icon className={clsx("w-3.5 h-3.5 shrink-0", acc.color)} />
                    <div>
                      <p className={clsx("text-[11px] font-semibold leading-none", acc.color)}>{acc.label}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{acc.email}</p>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 text-center mt-2.5 font-mono">Contraseña: <strong>1234</strong> para ambas cuentas</p>
            </div>
          </div>
        </div>

        {/* Version tag */}
        <p className="text-center text-[11px] text-white/30 font-mono mt-5 uppercase tracking-widest">Edificio Mirador · Admin v2.0 · Prototipo</p>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIDEBAR (role-aware)
// ═══════════════════════════════════════════════════════════════════════════════

const ROLE_USER: Record<AuthRole, { name: string; title: string; initials: string }> = {
  operaciones:    { name: "Carlos Acosta", title: "Personal Administrativo",   initials: "CA" },
  admin_comunidad:{ name: "Rosa Pérez",    title: "Admin. de la Comunidad",     initials: "RP" },
};

const ROLE_NAV: Record<AuthRole, Module[]> = {
  operaciones:    ["dashboard", "comunidades"],
  admin_comunidad:["torres", "bloques", "propiedades", "ocupantes"],
};

function Sidebar({ active, role, onNavigate, onResidentPortal, onLogout }: {
  active: Module; role: AuthRole;
  onNavigate: (m: Module) => void;
  onResidentPortal: () => void;
  onLogout: () => void;
}) {
  const allowedModules = ROLE_NAV[role];
  const visibleNav     = SIDEBAR_NAV.filter((item) => allowedModules.includes(item.module));
  const user           = ROLE_USER[role];

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-[#1B3D72] text-white">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none" style={{ fontFamily: "var(--font-display)" }}>Edificio Mirador</p>
            <p className="text-[10px] text-blue-200/70 font-mono mt-0.5 uppercase tracking-wider">Admin · Activos</p>
          </div>
        </div>

        {/* Role badge */}
        <div className="mt-3 flex items-center gap-2 bg-white/10 rounded-lg px-2.5 py-1.5">
          {role === "operaciones"
            ? <ShieldFill className="w-3 h-3 text-blue-300 shrink-0" />
            : <Building2 className="w-3 h-3 text-violet-300 shrink-0" />}
          <p className="text-[10px] font-medium text-white/80 truncate">{user.title}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5" aria-label="Módulos del sistema">
        {visibleNav.map(({ icon: Icon, label, module, cu }) => (
          <button
            key={module} onClick={() => onNavigate(module)}
            className={clsx(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left group",
              active === module ? "bg-white/15 text-white" : "text-blue-200/80 hover:bg-white/10 hover:text-white"
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="flex-1">{label}</span>
            {active === module
              ? <span className="w-1.5 h-1.5 rounded-full bg-white/70 shrink-0" />
              : <span className="text-[10px] font-mono text-blue-200/30 group-hover:text-blue-200/50 transition-colors">{cu}</span>}
          </button>
        ))}
      </nav>

      {/* Always: Ayuda y Documentación */}
      <div className="px-3 border-t border-white/10 pt-1.5 pb-1.5">
        <button
          onClick={() => onNavigate("ayuda")}
          className={clsx(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
            active === "ayuda" ? "bg-white/15 text-white" : "text-blue-200/70 hover:bg-white/10 hover:text-white"
          )}
        >
          <HelpCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">Ayuda y Documentación</span>
          {active === "ayuda"
            ? <span className="w-1.5 h-1.5 rounded-full bg-white/70 shrink-0" />
            : <span className="text-[10px] font-mono text-blue-200/25">?</span>}
        </button>
      </div>

      {/* Resident portal — only for admin_comunidad */}
      {role === "admin_comunidad" && (
        <div className="px-3 pb-1.5 border-white/10">
          <button onClick={onResidentPortal} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-200/70 hover:bg-white/10 hover:text-white transition-colors">
            <Smartphone className="w-4 h-4 shrink-0" />
            <span className="flex-1">Vista Residente</span>
            <span className="text-[10px] font-mono text-blue-200/30">Preview</span>
          </button>
        </div>
      )}

      {/* User profile + logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold">{user.initials}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-[11px] text-blue-200/60 truncate">{user.title}</p>
          </div>
          <button onClick={onLogout} className="text-blue-200/60 hover:text-white transition-colors" aria-label="Cerrar sesión">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════════════════

export default function App() {
  // ── Auth + pre-auth phase ──────────────────────────────────────────────────
  const [appPhase, setAppPhase]   = useState<AppPhase>("splash");
  const [authRole, setAuthRole]   = useState<AuthRole | null>(null);
  const [authName, setAuthName]   = useState("");

  // ── App state (must precede auth handlers so setters are in scope) ─────────
  const [activeModule, setActiveModule]           = useState<Module>("dashboard");
  const [globalCommunityId, setGlobalCommunityId] = useState(1);
  const [residentPortal, setResidentPortal]       = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen]       = useState(false);

  const handleLogin = useCallback((role: AuthRole, name: string) => {
    setAuthRole(role);
    setAuthName(name);
    setActiveModule(role === "admin_comunidad" ? "torres" : "dashboard");
  }, []);

  const handleLogout = useCallback(() => {
    setAuthRole(null);
    setAuthName("");
    setActiveModule("dashboard");
    setResidentPortal(false);
    setAppPhase("splash");
  }, []);

  const [communities, setCommunities] = useState<Community[]>(COMMUNITIES);
  const [towers, setTowers] = useState<Tower[]>(TOWERS);
  const [blocks, setBlocks] = useState<Block[]>(BLOCKS);
  const [properties, setProperties] = useState<Property[]>(PROPERTIES);
  const [occupants] = useState<Occupant[]>(OCCUPANTS);
  const [timelineEvents] = useState<TimelineEv[]>(TIMELINE);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((type: ToastType, title: string, message: string) => {
    const id = uid();
    setToasts((p) => [...p, { id, type, title, message }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 5500);
  }, []);
  const removeToast = useCallback((id: string) => setToasts((p) => p.filter((t) => t.id !== id)), []);

  // Modules the active role can reach
  const allowedModules: Module[] = authRole ? ROLE_NAV[authRole] : [];
  const safeNavigate = useCallback((m: Module) => {
    if (!authRole || !ROLE_NAV[authRole].includes(m)) return;
    setActiveModule(m);
    setMobileMenuOpen(false);
  }, [authRole]);

  const BREADCRUMB: Record<Module, string> = {
    dashboard: "Dashboard de Activos", comunidades: "Comunidades", torres: "Torres",
    bloques: "Bloques", propiedades: "Propiedades", ocupantes: "Ocupantes e Historial",
    ayuda: "Ayuda y Documentación",
  };

  // ── Pre-auth screens (splash → login) ─────────────────────────────────────
  if (!authRole) {
    return (
      <div className="h-screen w-screen overflow-hidden" style={{ fontFamily: "var(--font-sans)" }}>
        <AnimatePresence mode="wait">
          {appPhase === "splash"
            ? <SplashScreen key="splash" onEnter={() => setAppPhase("login")} />
            : <LoginScreen  key="login"  onLogin={handleLogin} onBack={() => setAppPhase("splash")} />
          }
        </AnimatePresence>
        <ToastRegion toasts={toasts} onDismiss={removeToast} />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background" style={{ fontFamily: "var(--font-sans)" }}>
      <Sidebar active={activeModule} role={authRole} onNavigate={safeNavigate} onResidentPortal={() => setResidentPortal(true)} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="shrink-0 bg-white border-b border-[rgba(27,61,114,0.1)] px-4 lg:px-6 py-3 flex items-center gap-3">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm min-w-0 flex-1">
            <span className="text-slate-400 hidden sm:inline shrink-0">Panel de Control</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden sm:inline shrink-0" />
            <span className="font-semibold text-[#1B3D72] truncate">{BREADCRUMB[activeModule]}</span>
          </nav>

          {/* Global community selector — operaciones only (sees all communities) */}
          {authRole === "operaciones" && (
            <div className="hidden md:flex items-center gap-2 shrink-0">
              <Building2 className="w-4 h-4 text-[#1B3D72]/60 shrink-0" />
              <div className="relative">
                <select value={globalCommunityId} onChange={(e) => { setGlobalCommunityId(Number(e.target.value)); }} className="pl-3 pr-8 py-1.5 text-xs font-medium text-[#1B3D72] bg-[#E4ECF8] border-2 border-[#1B3D72]/15 hover:border-[#1B3D72]/35 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] appearance-none cursor-pointer transition-all">
                  {communities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#1B3D72]/60 pointer-events-none" />
              </div>
            </div>
          )}

          {/* admin_comunidad: show fixed community name */}
          {authRole === "admin_comunidad" && (
            <div className="hidden md:flex items-center gap-2 shrink-0 bg-[#E4ECF8] rounded-lg px-3 py-1.5 border border-[#1B3D72]/15">
              <Building2 className="w-3.5 h-3.5 text-[#1B3D72]/70 shrink-0" />
              <span className="text-xs font-medium text-[#1B3D72]">{communities.find((c) => c.id === globalCommunityId)?.name}</span>
            </div>
          )}

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            {authRole === "admin_comunidad" && (
              <button onClick={() => setResidentPortal(true)} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#1B3D72] bg-[#E4ECF8] hover:bg-blue-200/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]">
                <Smartphone className="w-3.5 h-3.5" />Vista Residente
              </button>
            )}
            <button className="relative p-2 rounded-lg text-slate-400 hover:text-[#1B3D72] hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]" aria-label="Notificaciones">
              <Bell className="w-4.5 h-4.5" /><span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Mobile nav tabs — filtered by role */}
        <div className="lg:hidden shrink-0 bg-white border-b border-[rgba(27,61,114,0.1)] px-2 overflow-x-auto">
          <div className="flex gap-0.5 py-1.5 min-w-max">
            {SIDEBAR_NAV.filter((n) => allowedModules.includes(n.module)).map(({ icon: Icon, label, module }) => (
              <button key={module} onClick={() => safeNavigate(module)} className={clsx("flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap", activeModule === module ? "bg-[#1B3D72] text-white" : "text-slate-500 hover:text-[#1B3D72] hover:bg-slate-100")}>
                <Icon className="w-3.5 h-3.5" />{label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-4 lg:px-6 py-6">
          <AnimatePresence mode="wait">
            <motion.div key={activeModule} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {activeModule === "dashboard"    && <DashboardModule communities={communities} towers={towers} blocks={blocks} properties={properties} occupants={occupants} onNavigate={setActiveModule} />}
              {activeModule === "comunidades"  && <CommunitiesModule communities={communities} setCommunities={setCommunities} addToast={addToast} />}
              {activeModule === "torres"       && <TowersModule communities={communities} towers={towers} setTowers={setTowers} addToast={addToast} globalCommunityId={globalCommunityId} />}
              {activeModule === "bloques"      && <BloquesModule communities={communities} towers={towers} blocks={blocks} setBlocks={setBlocks} addToast={addToast} globalCommunityId={globalCommunityId} />}
              {activeModule === "propiedades"  && <PropiedadesModule communities={communities} towers={towers} blocks={blocks} properties={properties} setProperties={setProperties} addToast={addToast} globalCommunityId={globalCommunityId} />}
              {activeModule === "ocupantes"    && <OcupantesModule communities={communities} properties={properties} occupants={occupants} timeline={timelineEvents} globalCommunityId={globalCommunityId} />}
              {activeModule === "ayuda"        && <HelpModule role={authRole} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Resident Portal overlay */}
      <AnimatePresence>
        {residentPortal && (
          <motion.div key="portal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <ResidentPortal onBack={() => setResidentPortal(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <ToastRegion toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
