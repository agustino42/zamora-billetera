import type {
  AdminStats,
  AttendanceRecord,
  AttendanceSession,
  Award,
  Certificate,
  Collectible,
  Course,
  ForumPost,
  Grade,
  LeaderboardEntry,
  Profile,
  Reward,
  Subject,
  Task,
} from "@/lib/types";

export const demoProfile: Profile = {
  id: "stu-001",
  wallet: "0x7A3f9C2bE1d4a6F8c0B5e2D9a1C3f7E0b8D6a4C2",
  email: "valeria.mendoza@campus.edu",
  name: "Valeria Mendoza",
  role: "student",
  studentCode: "INF-2023-0148",
  career: "Ing. en Informática",
  zamora: 1240.5,
  attendanceRate: 94,
  level: 7,
  tier: "Plata",
  createdAt: "2025-09-01T08:00:00Z",
};

export const demoSubjects: Subject[] = [
  { id: "sub-1", code: "INF-301", name: "Estructuras de Datos", credits: 4, professorId: "pro-1", professorName: "Prof. Zamora Ríos", color: "#FF6A00", enrolled: 42 },
  { id: "sub-2", code: "INF-302", name: "Bases de Datos", credits: 3, professorId: "pro-1", professorName: "Prof. Zamora Ríos", color: "#F5B700", enrolled: 38 },
  { id: "sub-3", code: "INF-303", name: "Redes y Comunicaciones", credits: 4, professorId: "pro-2", professorName: "Prof. Ana Silva", color: "#22C55E", enrolled: 35 },
  { id: "sub-4", code: "INF-304", name: "Ingeniería de Software", credits: 3, professorId: "pro-2", professorName: "Prof. Ana Silva", color: "#3B82F6", enrolled: 40 },
  { id: "sub-5", code: "INF-305", name: "Blockchain y Web3", credits: 3, professorId: "pro-3", professorName: "Prof. Luis Paredes", color: "#A855F7", enrolled: 30 },
];

export const demoTasks: Task[] = [
  { id: "tsk-1", subjectId: "sub-1", subjectName: "Estructuras de Datos", title: "Implementar árbol AVL", description: "Implementa un árbol AVL balanceado con inserción y eliminación, incluye pruebas y análisis de complejidad.", reward: 60, dueDate: "2026-10-20T23:59:00Z", status: "pending" },
  { id: "tsk-2", subjectId: "sub-2", subjectName: "Bases de Datos", title: "Normalización de esquema", description: "Normaliza el esquema propuesto hasta 3FN y documenta las dependencias funcionales.", reward: 45, dueDate: "2026-10-18T23:59:00Z", status: "submitted", proofHash: "0x9a1f…c3d2" },
  { id: "tsk-3", subjectId: "sub-5", subjectName: "Blockchain y Web3", title: "Desplegar un contrato ERC-20", description: "Despliega un token ERC-20 en Base Sepolia y comparte la dirección del contrato.", reward: 80, dueDate: "2026-10-15T23:59:00Z", status: "approved", proofHash: "0x4b2e…91ac" },
  { id: "tsk-4", subjectId: "sub-4", subjectName: "Ingeniería de Software", title: "Diagrama de casos de uso", description: "Modela los casos de uso del sistema SigA con actores y relaciones include/extend.", reward: 35, dueDate: "2026-10-12T23:59:00Z", status: "approved", proofHash: "0x77aa…10ef" },
  { id: "tsk-5", subjectId: "sub-3", subjectName: "Redes y Comunicaciones", title: "Simulación de subredes VLSM", description: "Calcula el direccionamiento VLSM para la topología dada y justifica cada máscara.", reward: 50, dueDate: "2026-10-25T23:59:00Z", status: "pending" },
  { id: "tsk-6", subjectId: "sub-1", subjectName: "Estructuras de Datos", title: "Grafos: camino más corto", description: "Implementa Dijkstra y Bellman-Ford y compara su rendimiento.", reward: 55, dueDate: "2026-10-28T23:59:00Z", status: "rejected", proofHash: "0x12cd…88fa" },
];

export const demoAttendanceSessions: AttendanceSession[] = [
  { id: "ses-1", subjectId: "sub-5", subjectName: "Blockchain y Web3", code: "ZAM-4821", openedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), closesAt: new Date(Date.now() + 1000 * 60 * 25).toISOString(), closed: false, checkedInCount: 18 },
  { id: "ses-2", subjectId: "sub-1", subjectName: "Estructuras de Datos", code: "ZAM-1093", openedAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), closesAt: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(), closed: true, checkedInCount: 40 },
];

export const demoAttendanceRecords: AttendanceRecord[] = [
  { id: "ar-1", subjectId: "sub-1", subjectName: "Estructuras de Datos", date: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), present: true },
  { id: "ar-2", subjectId: "sub-2", subjectName: "Bases de Datos", date: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(), present: true },
  { id: "ar-3", subjectId: "sub-3", subjectName: "Redes y Comunicaciones", date: new Date(Date.now() - 1000 * 60 * 60 * 74).toISOString(), present: false },
  { id: "ar-4", subjectId: "sub-4", subjectName: "Ingeniería de Software", date: new Date(Date.now() - 1000 * 60 * 60 * 98).toISOString(), present: true },
  { id: "ar-5", subjectId: "sub-5", subjectName: "Blockchain y Web3", date: new Date(Date.now() - 1000 * 60 * 60 * 122).toISOString(), present: true },
];

export const demoGrades: Grade[] = [
  { id: "gr-1", studentId: "stu-001", studentName: "Valeria Mendoza", subjectId: "sub-1", subjectName: "Estructuras de Datos", score: 18, creditsEarned: 4, passed: true, recordedAt: "2026-09-30T12:00:00Z" },
  { id: "gr-2", studentId: "stu-001", studentName: "Valeria Mendoza", subjectId: "sub-2", subjectName: "Bases de Datos", score: 16, creditsEarned: 3, passed: true, recordedAt: "2026-09-30T12:05:00Z" },
  { id: "gr-3", studentId: "stu-001", studentName: "Valeria Mendoza", subjectId: "sub-3", subjectName: "Redes y Comunicaciones", score: 11, creditsEarned: 0, passed: false, recordedAt: "2026-09-30T12:10:00Z" },
  { id: "gr-4", studentId: "stu-001", studentName: "Valeria Mendoza", subjectId: "sub-4", subjectName: "Ingeniería de Software", score: 17, creditsEarned: 3, passed: true, recordedAt: "2026-09-30T12:15:00Z" },
];

export const demoCourses: Course[] = [
  { id: "crs-1", title: "Fundamentos de Solidity", description: "Aprende a escribir, probar y desplegar contratos inteligentes desde cero.", price: 150, instructorId: "pro-1", instructorName: "Prof. Zamora Ríos", seats: 40, enrolled: 32, completed: 12, progress: 65, enrolledSelf: true, category: "Web3" },
  { id: "crs-2", title: "Diseño de APIs con NestJS", description: "Construye APIs robustas y escalables con autenticación y pruebas.", price: 120, instructorId: "pro-2", instructorName: "Prof. Ana Silva", seats: 35, enrolled: 28, completed: 8, progress: 40, enrolledSelf: true, category: "Backend" },
  { id: "crs-3", title: "Machine Learning aplicado", description: "Del dataset al modelo en producción con Python y scikit-learn.", price: 200, instructorId: "pro-3", instructorName: "Prof. Luis Paredes", seats: 30, enrolled: 30, completed: 20, progress: 0, enrolledSelf: false, category: "IA" },
  { id: "crs-4", title: "Seguridad Web OWASP", description: "Identifica y mitiga las principales vulnerabilidades web.", price: 110, instructorId: "pro-2", instructorName: "Prof. Ana Silva", seats: 50, enrolled: 15, completed: 3, progress: 0, enrolledSelf: false, category: "Seguridad" },
];

export const demoCertificates: Certificate[] = [
  { id: "cert-1", courseId: "crs-0", courseTitle: "Introducción a Blockchain", studentId: "stu-001", studentName: "Valeria Mendoza", issuedAt: "2026-08-15T10:00:00Z", txHash: "0xab12…9f0c", soulbound: true },
];

export const demoRewards: Reward[] = [
  { id: "rw-1", name: "Pase Conferencia Web3 Summit", description: "Acceso completo a la conferencia anual de blockchain del campus.", cost: 300, stock: 50, redeemed: 12, category: "conferencia", active: true },
  { id: "rw-2", name: "Café gratis (1 semana)", description: "Un café diario en la cafetería del campus durante 5 días.", cost: 60, stock: 200, redeemed: 84, category: "cafeteria", active: true },
  { id: "rw-3", name: "Camiseta Zamora", description: "Camiseta oficial del programa de incentivos.", cost: 150, stock: 100, redeemed: 30, category: "merch", active: true },
  { id: "rw-4", name: "Beca de laboratorio", description: "Beca para material de laboratorio por un semestre.", cost: 800, stock: 10, redeemed: 3, category: "beca", active: true },
  { id: "rw-5", name: "Sesión de tutoría premium", description: "Dos horas de tutoría uno a uno con un mentor senior.", cost: 220, stock: 25, redeemed: 9, category: "servicio", active: true },
];

export const demoCollectibles: Collectible[] = [
  { id: "col-1", kind: "badge", name: "Asistencia Perfecta", uri: "ipfs://badge-asistencia", tokenId: 1, soulbound: true, acquiredAt: "2026-09-01T00:00:00Z" },
  { id: "col-2", kind: "badge", name: "Top 3 del Ranking", uri: "ipfs://badge-top3", tokenId: 2, soulbound: true, acquiredAt: "2026-09-20T00:00:00Z" },
  { id: "col-3", kind: "pass", name: "Pase Web3 Summit 2026", uri: "ipfs://pass-web3summit", tokenId: 3, soulbound: false, acquiredAt: "2026-09-25T00:00:00Z" },
  { id: "col-4", kind: "certificate", name: "Certificado: Introducción a Blockchain", uri: "ipfs://cert-blockchain", tokenId: 4, soulbound: true, acquiredAt: "2026-08-15T00:00:00Z" },
];

export const demoForumPosts: ForumPost[] = [
  { id: "p-1", authorId: "stu-002", authorName: "Mateo Ríos", authorTier: "Oro", subject: "Blockchain y Web3", content: "¿Alguien tiene apuntes de la clase de firmas digitales? Comparto los míos a cambio de ZAMORA 😄", createdAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(), upvotes: 12, downvotes: 1, comments: 4, hash: "0x3af1…22b9", anchorTx: "0x91c4…aa02", refundable: true, pinned: true },
  { id: "p-2", authorId: "stu-003", authorName: "Lucía Fernández", authorTier: "Plata", subject: "Estructuras de Datos", content: "Reto: resolver 3 problemas de grafos esta semana. El que termine primero se lleva mi tip de 20 ZAM.", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), upvotes: 7, downvotes: 0, comments: 9, hash: "0x88de…41cc", anchorTx: "0x77ab…10ef", refundable: true },
  { id: "p-3", authorId: "stu-001", authorName: "Valeria Mendoza", authorTier: "Plata", subject: "Ingeniería de Software", content: "Busco equipo para el proyecto final de Ing. de Software. Somos 2, necesitamos frontend.", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(), upvotes: 4, downvotes: 0, comments: 6, hash: "0x51aa…09bb", anchorTx: "0x12cd…88fa", refundable: false },
  { id: "p-4", authorId: "stu-004", authorName: "Diego Salas", authorTier: "Bronce", subject: "Redes y Comunicaciones", content: "Repositorio con todas las prácticas de VLSM resueltas y explicadas paso a paso.", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(), upvotes: 15, downvotes: 2, comments: 3, hash: "0xb702…5e10", anchorTx: "0x4b2e…91ac", refundable: true },
];

export const demoAwards: Award[] = [
  { id: "aw-1", studentId: "stu-001", studentName: "Valeria Mendoza", amount: 80, reason: "Tarea aprobada: Desplegar un contrato ERC-20", source: "task", txHash: "0x4b2e…91ac", createdAt: "2026-10-05T14:20:00Z" },
  { id: "aw-2", studentId: "stu-001", studentName: "Valeria Mendoza", amount: 300, reason: "Créditos aprobados: Estructuras (4) + BD (3)", source: "credits", txHash: "0x77aa…10ef", createdAt: "2026-09-30T12:20:00Z" },
  { id: "aw-3", studentId: "stu-001", studentName: "Valeria Mendoza", amount: 10, reason: "Asistencia: Blockchain y Web3", source: "attendance", txHash: "0x12cd…88fa", createdAt: "2026-09-28T09:05:00Z" },
  { id: "aw-4", studentId: "stu-001", studentName: "Valeria Mendoza", amount: 6, reason: "Participación destacada en el foro", source: "forum", txHash: "0x88de…41cc", createdAt: "2026-09-27T18:40:00Z" },
  { id: "aw-5", studentId: "stu-001", studentName: "Valeria Mendoza", amount: 35, reason: "Tarea aprobada: Diagrama de casos de uso", source: "task", txHash: "0x3af1…22b9", createdAt: "2026-09-24T11:00:00Z" },
];

export const demoLeaderboard: LeaderboardEntry[] = [
  { rank: 1, studentId: "stu-002", name: "Mateo Ríos", zamora: 2480, attendance: 99, tier: "Oro" },
  { rank: 2, studentId: "stu-005", name: "Sofía Quispe", zamora: 2110, attendance: 97, tier: "Oro" },
  { rank: 3, studentId: "stu-001", name: "Valeria Mendoza", zamora: 1240, attendance: 94, tier: "Plata" },
  { rank: 4, studentId: "stu-003", name: "Lucía Fernández", zamora: 1180, attendance: 91, tier: "Plata" },
  { rank: 5, studentId: "stu-004", name: "Diego Salas", zamora: 860, attendance: 88, tier: "Plata" },
  { rank: 6, studentId: "stu-006", name: "Carlos Huamán", zamora: 540, attendance: 82, tier: "Bronce" },
];

export const demoAdminStats: AdminStats = {
  totalStudents: 1240,
  totalProfessors: 38,
  totalSubjects: 96,
  totalZamoraMinted: 486500,
  totalZamoraBurned: 92340,
  totalCirculating: 394160,
  tasksApproved: 8720,
  attendanceRecords: 34890,
  certificates: 1240,
};

export const demoStudents: Profile[] = [
  demoProfile,
  { ...demoProfile, id: "stu-002", name: "Mateo Ríos", email: "mateo.rios@campus.edu", zamora: 2480, attendanceRate: 99, tier: "Oro", level: 12, studentCode: "INF-2022-0031" },
  { ...demoProfile, id: "stu-003", name: "Lucía Fernández", email: "lucia.fernandez@campus.edu", zamora: 1180, attendanceRate: 91, tier: "Plata", level: 6, studentCode: "INF-2023-0099" },
  { ...demoProfile, id: "stu-004", name: "Diego Salas", email: "diego.salas@campus.edu", zamora: 860, attendanceRate: 88, tier: "Plata", level: 5, studentCode: "INF-2023-0188" },
  { ...demoProfile, id: "stu-005", name: "Sofía Quispe", email: "sofia.quispe@campus.edu", zamora: 2110, attendanceRate: 97, tier: "Oro", level: 11, studentCode: "INF-2022-0074" },
  { ...demoProfile, id: "stu-006", name: "Carlos Huamán", email: "carlos.huaman@campus.edu", zamora: 540, attendanceRate: 82, tier: "Bronce", level: 3, studentCode: "INF-2024-0210" },
];

export const demoProfessors = [
  { id: "pro-1", name: "Prof. Zamora Ríos", email: "zamora.rios@campus.edu", subjects: ["INF-301", "INF-302"], active: true, wallet: "0x11a2…9f0c" },
  { id: "pro-2", name: "Prof. Ana Silva", email: "ana.silva@campus.edu", subjects: ["INF-303", "INF-304"], active: true, wallet: "0x22b3…8e1d" },
  { id: "pro-3", name: "Prof. Luis Paredes", email: "luis.paredes@campus.edu", subjects: ["INF-305"], active: true, wallet: "0x33c4…7d2e" },
  { id: "pro-4", name: "Prof. Rosa Chávez", email: "rosa.chavez@campus.edu", subjects: [], active: false, wallet: "0x44d5…6c3f" },
];

export const demoMintBurnSeries = [
  { month: "Abr", minted: 42000, burned: 5100 },
  { month: "May", minted: 48000, burned: 7200 },
  { month: "Jun", minted: 39000, burned: 6100 },
  { month: "Jul", minted: 52000, burned: 9800 },
  { month: "Ago", minted: 61000, burned: 12400 },
  { month: "Sep", minted: 74000, burned: 16900 },
  { month: "Oct", minted: 68000, burned: 14200 },
];
