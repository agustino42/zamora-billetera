export type Role = "student" | "professor" | "admin";

export interface Profile {
  id: string;
  wallet: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
  studentCode?: string;
  career?: string;
  zamora: number;
  attendanceRate: number;
  level: number;
  tier: "Bronce" | "Plata" | "Oro";
  createdAt: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  credits: number;
  professorId: string;
  professorName: string;
  color: string;
  enrolled: number;
}

export type TaskStatus = "pending" | "submitted" | "approved" | "rejected";

export interface Task {
  id: string;
  subjectId: string;
  subjectName: string;
  title: string;
  description: string;
  reward: number;
  dueDate: string;
  status: TaskStatus;
  proofHash?: string;
}

export interface AttendanceSession {
  id: string;
  subjectId: string;
  subjectName: string;
  code: string;
  openedAt: string;
  closesAt: string;
  closed: boolean;
  checkedInCount: number;
}

export interface AttendanceRecord {
  id: string;
  subjectId: string;
  subjectName: string;
  date: string;
  present: boolean;
}

export interface Grade {
  id: string;
  studentId: string;
  studentName: string;
  subjectId: string;
  subjectName: string;
  score: number;
  creditsEarned: number;
  passed: boolean;
  recordedAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  instructorId: string;
  instructorName: string;
  seats: number;
  enrolled: number;
  completed: number;
  progress: number;
  enrolledSelf: boolean;
  recurring?: boolean;
  category: string;
}

export interface Certificate {
  id: string;
  courseId: string;
  courseTitle: string;
  studentId: string;
  studentName: string;
  issuedAt: string;
  txHash: string;
  soulbound: boolean;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number;
  stock: number;
  redeemed: number;
  category: "conferencia" | "merch" | "beca" | "cafeteria" | "servicio";
  active: boolean;
}

export interface Collectible {
  id: string;
  kind: "pass" | "badge" | "certificate";
  name: string;
  uri: string;
  tokenId: number;
  soulbound: boolean;
  acquiredAt: string;
}

export interface ForumPost {
  id: string;
  authorId: string;
  authorName: string;
  authorTier: "Bronce" | "Plata" | "Oro";
  subject?: string;
  content: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  comments: number;
  hash: string;
  anchorTx: string;
  refundable: boolean;
  pinned?: boolean;
}

export interface Award {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  reason: string;
  source: "task" | "attendance" | "credits" | "forum" | "manual";
  txHash: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  name: string;
  zamora: number;
  attendance: number;
  tier: "Bronce" | "Plata" | "Oro";
}

export interface AdminStats {
  totalStudents: number;
  totalProfessors: number;
  totalSubjects: number;
  totalZamoraMinted: number;
  totalZamoraBurned: number;
  totalCirculating: number;
  tasksApproved: number;
  attendanceRecords: number;
  certificates: number;
}
