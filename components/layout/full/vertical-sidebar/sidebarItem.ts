import {
  AlertCircleIcon,
  AlertHexagonIcon,
  AlignBoxBottomLeftIcon,
  ApertureIcon,
  AppsIcon,
  AppWindowIcon,
  BasketIcon,
  BorderAllIcon,
  BorderHorizontalIcon,
  BorderInnerIcon,
  BorderStyle2Icon,
  BorderTopIcon,
  BorderVerticalIcon,
  BoxAlignBottomIcon,
  BoxAlignLeftIcon,
  BoxIcon,
  BoxModelIcon,
  BrandTidalIcon,
  CalendarIcon,
  CardboardsIcon,
  ChartArcsIcon,
  ChartAreaIcon,
  ChartCandleIcon,
  ChartDonut3Icon,
  ChartDotsIcon,
  ChartLineIcon,
  ChartRadarIcon,
  ColumnsIcon,
  CopyIcon,
  CurrencyDollarIcon,
  EditIcon,
  EyeTableIcon,
  FidgetSpinnerIcon,
  FileCheckIcon,
  FileDotsIcon,
  FilesIcon,
  FileTextIcon,
  FilterIcon,
  HelpIcon,
  JumpRopeIcon,
  LayoutDashboardIcon,
  LayoutKanbanIcon,
  LoginIcon,
  MailIcon,
  Message2Icon,
  MoodHappyIcon,
  PageBreakIcon,
  PhotoAiIcon,
  PointIcon,
  RotateIcon,
  RowInsertBottomIcon,
  SearchIcon,
  ServerIcon,
  SettingsIcon,
  ShoppingCartIcon,
  SocialIcon,
  SortAscendingIcon,
  TableIcon,
  TicketIcon,
  TypographyIcon,
  UserCircleIcon,
  UserIcon,
  UserPlusIcon,
  UserShieldIcon,
  ZoomCodeIcon,
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
    icon: LayoutDashboardIcon,
    to: "/",
    external: false,
  },
  {
    title: "User Management",
    icon: UserIcon,
    to: "/users",
    external: false,
  },

  { header: "utilities" },
  {
    title: "Typography",
    icon: TypographyIcon,
    to: "/ui/typography",
    external: false,
  },
  {
    title: "Shadow",
    icon: CopyIcon,
    to: "/ui/shadow",
    external: false,
  },

  { header: "Pages" },
  {
    title: "Sample Page",
    icon: ApertureIcon,
    to: "/sample-page",
    external: false,
  },

  { header: "UI" },
  {
    title: "Alert",
    icon: AlertHexagonIcon,
    to: "/ui-components/alerts",
  },
  {
    title: "Button",
    icon: AlignBoxBottomLeftIcon,
    to: "/ui-components/buttons",
  },
  {
    title: "Cards",
    icon: CardboardsIcon,
    to: "/ui-components/cards",
  },
  {
    title: "Tables",
    icon: TableIcon,
    to: "/ui-components/tables",
  },
  { header: "Extra" },
  {
    title: "Icons",
    icon: MoodHappyIcon,
    to: "/icons",
    external: false,
  },
];

export default sidebarItem;
