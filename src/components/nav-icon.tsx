import {
  Wallet,
  ListChecks,
  CalendarCheck,
  GraduationCap,
  MessagesSquare,
  Gift,
  Trophy,
  User,
  LayoutDashboard,
  BookOpen,
  FileText,
  ClipboardList,
  Users,
  UserCog,
  Coins,
  Award,
  Settings,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  wallet: Wallet,
  tasks: ListChecks,
  calendar: CalendarCheck,
  graduation: GraduationCap,
  message: MessagesSquare,
  gift: Gift,
  trophy: Trophy,
  user: User,
  dashboard: LayoutDashboard,
  book: BookOpen,
  file: FileText,
  clipboard: ClipboardList,
  users: Users,
  teacher: UserCog,
  coins: Coins,
  award: Award,
  settings: Settings,
};

export function NavIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICONS[name] ?? LayoutDashboard;
  return <Icon className={className} />;
}
