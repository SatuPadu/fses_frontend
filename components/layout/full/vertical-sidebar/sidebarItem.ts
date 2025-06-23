import {
  UserIcon,
  HomeIcon,
  UsersIcon,
  BookIcon,
  FileImportIcon,
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
  },
  {
    title: "Lecturers",
    icon: UserIcon,
    to: "/lecturers",
    external: false,
  },
  {
    title: "Students",
    icon: UserIcon,
    to: "/students",
    external: false,
  },
  {
    title: "Programs",
    icon: BookIcon,
    to: "/programs",
    external: false,
  },
  { header: "System" },
  {
    title: "Import Data",
    icon: FileImportIcon,
    to: "/import",
    external: false,
  },
];

export default sidebarItem;
