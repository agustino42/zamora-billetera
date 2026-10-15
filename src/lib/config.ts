import { baseSepolia } from "thirdweb/chains";

export const APP = {
  name: "Zamora",
  fullName: "Zamora Wallet",
  tagline: "Programa de incentivos on-chain para tu campus",
  description:
    "Gana ZAMORA por tus notas, asistencia y tareas. Aprende, comparte y redime recompensas. Todo en la blockchain.",
  tokenSymbol: "ZAM",
  tokenName: "Zamora Token",
  chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 84532),
} as const;

export const chain = baseSepolia;

export const CONTRACTS = {
  token: (process.env.NEXT_PUBLIC_ZAMORA_TOKEN_ADDRESS ?? "") as `0x${string}`,
  campus: (process.env.NEXT_PUBLIC_ZAMORA_CAMPUS_ADDRESS ?? "") as `0x${string}`,
  rewards: (process.env.NEXT_PUBLIC_ZAMORA_REWARDS_ADDRESS ??
    "") as `0x${string}`,
  collectibles: (process.env.NEXT_PUBLIC_ZAMORA_COLLECTIBLES_ADDRESS ??
    "") as `0x${string}`,
  courses: (process.env.NEXT_PUBLIC_ZAMORA_COURSES_ADDRESS ??
    "") as `0x${string}`,
  forum: (process.env.NEXT_PUBLIC_ZAMORA_FORUM_ADDRESS ?? "") as `0x${string}`,
} as const;

export const isChainConfigured = Boolean(CONTRACTS.token);

export const STUDENT_NAV = [
  { href: "/app", label: "Billetera", icon: "wallet" },
  { href: "/app/tasks", label: "Tareas", icon: "tasks" },
  { href: "/app/attendance", label: "Asistencia", icon: "calendar" },
  { href: "/app/courses", label: "Cursos", icon: "graduation" },
  { href: "/app/forum", label: "Foro", icon: "message" },
  { href: "/app/rewards", label: "Recompensas", icon: "gift" },
  { href: "/app/achievements", label: "Logros", icon: "trophy" },
  { href: "/app/profile", label: "Perfil", icon: "user" },
] as const;

export const STUDENT_MOBILE_NAV = [
  { href: "/app", label: "Billetera", icon: "wallet" },
  { href: "/app/tasks", label: "Tareas", icon: "tasks" },
  { href: "/app/attendance", label: "Asistencia", icon: "calendar" },
  { href: "/app/forum", label: "Foro", icon: "message" },
] as const;

export const PROFESSOR_NAV = [
  { href: "/professor", label: "Resumen", icon: "dashboard" },
  { href: "/professor/subjects", label: "Materias", icon: "book" },
  { href: "/professor/tasks", label: "Tareas", icon: "tasks" },
  { href: "/professor/exams", label: "Exámenes", icon: "file" },
  { href: "/professor/grades", label: "Notas", icon: "clipboard" },
  { href: "/professor/attendance", label: "Asistencia", icon: "calendar" },
  { href: "/professor/students", label: "Alumnos", icon: "users" },
  { href: "/professor/rewards", label: "Recompensas", icon: "gift" },
  { href: "/professor/courses", label: "Cursos", icon: "graduation" },
] as const;

export const ADMIN_NAV = [
  { href: "/admin", label: "Resumen", icon: "dashboard" },
  { href: "/admin/users", label: "Usuarios", icon: "users" },
  { href: "/admin/professors", label: "Profesores", icon: "teacher" },
  { href: "/admin/subjects", label: "Materias", icon: "book" },
  { href: "/admin/tasks", label: "Tareas", icon: "tasks" },
  { href: "/admin/attendance", label: "Asistencia", icon: "calendar" },
  { href: "/admin/grades", label: "Notas", icon: "clipboard" },
  { href: "/admin/economy", label: "Economía ZAMORA", icon: "coins" },
  { href: "/admin/rewards", label: "Recompensas", icon: "gift" },
  { href: "/admin/certificates", label: "Certificados", icon: "award" },
  { href: "/admin/forum", label: "Foro", icon: "message" },
  { href: "/admin/settings", label: "Configuración", icon: "settings" },
] as const;

export const TEACHING_MULTIPLIER = {
  attendance: 10,
  task: 25,
  credit: 100,
  forumPost: 2,
} as const;

export const FORUM_TOLL = 5;
export const COURSE_INSTRUCTOR_SHARE = 80;
export const COURSE_BURN_SHARE = 20;
