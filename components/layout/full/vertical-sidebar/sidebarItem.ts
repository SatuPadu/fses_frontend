import {
  UserIcon,
  HomeIcon,
  UsersIcon,
  BookIcon,
  FileImportIcon,
  AwardIcon,
  LockIcon,
  UserCheckIcon,
} from "vue-tabler-icons";

export interface menu {
  header?: string;
  title?: string;
  icon?: any;
  to?: string;
  chip?: string;
  chipColor?: string;
  chipVariant?: string;
  chipIcon?: string;
  children?: menu[];
  disabled?: boolean;
  type?: string;
  subCaption?: string;
  external?: boolean;
  requiredPermission?: string;
  requiredRole?: string;
  requiredRoles?: string[];
}

const sidebarItem: menu[] = [
  { header: "Home" },
  {
    title: "Dashboard",
    icon: HomeIcon,
    to: "/",
    external: false,
  },
  {
    title: "Reports & Statistics",
    icon: AwardIcon,
    to: "/reports",
    external: false,
    requiredPermission: "reports:view",
    requiredRoles: ["ProgramCoordinator", "PGAM"],
  },
  { header: "Management" },
  {
    title: "All Users",
    icon: UsersIcon,
    to: "/users",
    external: false,
    requiredPermission: "users:view",
    requiredRoles: ["OfficeAssistant", "PGAM"],
  },
  {
    title: "Lecturers",
    icon: UserIcon,
    to: "/lecturers",
    external: false,
    requiredPermission: "lecturers:view",
    requiredRoles: ["OfficeAssistant", "PGAM", "ProgramCoordinator"],
  },
  {
    title: "Programs",
    icon: BookIcon,
    to: "/programs",
    external: false,
    requiredPermission: "programs:view",
  },
  {
    title: "Students",
    icon: UserIcon,
    to: "/students",
    external: false,
    requiredPermission: "students:view",
  },
  { header: "Evaluation" },
  {
    title: "Examiner Nominations",
    icon: AwardIcon,
    to: "/nominations",
    external: false,
    requiredPermission: "nominations:view",
  },
  {
    title: "Assign Chairpersons",
    icon: UserCheckIcon,
    to: "/assign-chairpersons",
    external: false,
    requiredPermission: "chairpersons:assign",
    requiredRoles: ["ProgramCoordinator", "PGAM"],
  },
  {
    title: "Lock Nominations",
    icon: LockIcon,
    to: "/lock-nominations",
    external: false,
    requiredPermission: "nominations:lock",
    requiredRoles: ["ProgramCoordinator", "PGAM"],
  },
  { header: "System" },
  {
    title: "Import Data",
    icon: FileImportIcon,
    to: "/import",
    external: false,
    requiredPermission: "students:import",
  },
];

export default sidebarItem;
