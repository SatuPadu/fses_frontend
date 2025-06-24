import {
  UserIcon,
  HomeIcon,
  UsersIcon,
  BookIcon,
  FileImportIcon,
  UserCircleIcon,
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
}

const sidebarItem: menu[] = [
  { header: "Home" },
  {
    title: "Dashboard",
    icon: HomeIcon,
    to: "/",
    external: false,
  },
  { header: "Management" },
  {
    title: "All Users",
    icon: UsersIcon,
    to: "/users",
    external: false,
    requiredPermission: "users:view",
  },
  {
    title: "Lecturers",
    icon: UserIcon,
    to: "/lecturers",
    external: false,
    requiredPermission: "lecturers:view",
  },
  {
    title: "Students",
    icon: UserIcon,
    to: "/students",
    external: false,
    requiredPermission: "students:view",
  },
  {
    title: "Programs",
    icon: BookIcon,
    to: "/programs",
    external: false,
    requiredPermission: "programs:view",
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
