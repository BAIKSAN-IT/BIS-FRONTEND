import React from "react";
import { Navigate, Route, RouteProps } from "react-router-dom";

// components
import PrivateRoute from "./PrivateRoute";

// lazy load all the views

// asset
const AssetDetails = React.lazy(() => import("../pages/asset/AssetDetails"));

// srs page
const SrsServicePage = React.lazy(() => import("@pages/srs/SrsPortalPage"));
const LoginSrs = React.lazy(() => import("@pages/srs/login/LoginSrs"));

// - factory dashboard pages
const FactoryHome = React.lazy(() => import("../pages/factory/Home"));
const LoginFactory = React.lazy(() => import("../pages/factory/login/Login"));
const FactoryLineSelection = React.lazy(() => import("../pages/factory/LineSelection"));
const CuttingStockFactory = React.lazy(() => import("../pages/factory/cutting/CuttingStock"));
const CuttingActualStyleFactory = React.lazy(() => import("../pages/factory/cutting/CuttingActualStyle"));
const CuttingActualColorFactory = React.lazy(() => import("../pages/factory/cutting/CuttingActualColor"));
const SewingInputFactory = React.lazy(() => import("../pages/factory/sewing/SewingInput"));
const SewingInputLineFactory = React.lazy(() => import("../pages/factory/sewing/SewingInputLine"));
const SewingActualFactory = React.lazy(() => import("../pages/factory/sewing/SewingActual"));
const SewingTotalActualFactory = React.lazy(() => import("../pages/factory/sewing/SewingTotalActual"));
const SewingHpsPopUpFactory = React.lazy(() => import("../pages/factory/sewing/hps/SewingHpsPopUp"));
const SewingHpsShopFloorPopUpFactory = React.lazy(() => import("../pages/factory/sewing/hpsshopfloor/SewingHpsShopFloorPopUp"));
const IronActualFactory = React.lazy(() => import("../pages/factory/iron/IronActual"));
const FoldingActualFactory = React.lazy(() => import("../pages/factory/folding/FoldingActual"));
const NeedleActualFactory = React.lazy(() => import("../pages/factory/needle/NeedleActual"));
const FinishQcFactory = React.lazy(() => import("../pages/factory/qc/FinishQc"));
const FinishQcLineFactory = React.lazy(() => import("../pages/factory/qc/FinishQcLineActual"));
const FinishQcChartFactory = React.lazy(() => import("../pages/factory/qc/FinishQcChart"));
const PackingActualFactory = React.lazy(() => import("../pages/factory/packing/PackingActual"));
const KnittingListFactory = React.lazy(() => import("../pages/factory/knitting/KnittingList"));
const KnittingMachineFactory = React.lazy(() => import("../pages/factory/knitting/KnittingMachine"));
const SewingManagementFactory = React.lazy(() => import("../pages/factory/machine/sewing/management"));
const SewingMachineFactory = React.lazy(() => import("../pages/factory/machine/sewing/machine/SewingMachine"));

// - tablet pages
const TabletHome = React.lazy(() => import("../pages/tablet/Home"));
const LoginTablet = React.lazy(() => import("../pages/tablet/login/Login"));
const TabletLineSelection = React.lazy(() => import("../pages/tablet/LineSelection"));
const NeedleActual = React.lazy(() => import("../pages/tablet/folding/NeedleActual"));
const FoldingActual = React.lazy(() => import("../pages/tablet/folding/FoldingActual"));
const SewingInput = React.lazy(() => import("../pages/tablet/sewing/SewingInput"));
const SewingActual = React.lazy(() => import("../pages/tablet/sewing/SewingActual"));
const PackingActual = React.lazy(() => import("../pages/tablet/packing/PackingActual"));
const FinishQc = React.lazy(() => import("../pages/tablet/qc/FinishQc"));

// auth
const Login = React.lazy(() => import("../pages/auth/Login"));
const Logout = React.lazy(() => import("../pages/auth/Logout"));
const Confirm = React.lazy(() => import("../pages/auth/Confirm"));
const ForgetPassword = React.lazy(() => import("../pages/auth/ForgetPassword"));
const Register = React.lazy(() => import("../pages/auth/Register"));
const SettingInfo = React.lazy(() => import("../pages/auth/SettingInfo"));
const SignInSignUp = React.lazy(() => import("../pages/auth/SignInSignUp"));
const LockScreen = React.lazy(() => import("../pages/auth/LockScreen"));

// auth2
const Login2 = React.lazy(() => import("../pages/auth2/Login2"));
const Logout2 = React.lazy(() => import("../pages/auth2/Logout2"));
const Register2 = React.lazy(() => import("../pages/auth2/Register2"));
const Confirm2 = React.lazy(() => import("../pages/auth2/Confirm2"));
const ForgetPassword2 = React.lazy(() => import("../pages/auth2/ForgetPassword2"));
const LockScreen2 = React.lazy(() => import("../pages/auth2/LockScreen2"));
const SignInSignUp2 = React.lazy(() => import("../pages/auth2/SignInSignUp2"));

// landing
const Landing = React.lazy(() => import("../pages/landing/"));

// dashboard
const Dashboard1 = React.lazy(() => import("../pages/dashboard/Dashboard1/"));
const Dashboard2 = React.lazy(() => import("../pages/dashboard/Dashboard2/"));
const Dashboard3 = React.lazy(() => import("../pages/dashboard/Dashboard3/"));
const Dashboard4 = React.lazy(() => import("../pages/dashboard/Dashboard4/"));
const Dashboard5 = React.lazy(() => import("../pages/eis/dashboard/Dashboard5/CuttingActual"));

const Sewingstatus = React.lazy(() => import("../pages/eis/sewing/Production/SewingStatus"));
const SewingProcess = React.lazy(() => import("../pages/eis/sewing/Process/SewingProcess"));
const CorporationPl = React.lazy(() => import("../pages/eis/corporation/pl/CorporationPl"));
const SixMonthStatus = React.lazy(() => import("../pages/eis/monthstatus/six/SixMonthStatus"));
const Factorysewing = React.lazy(() => import("../pages/dashboard/Dashboard2/"));

// user
const UserRegisterFactory = React.lazy(() => import("../pages/system/user/UserRegister/UserRegister"));
const AuthGroupRegisterFactory = React.lazy(() => import("../pages/system/user/AuthGroupRegister/AuthGroupRegister"));
const UserAuthRegisterFactory = React.lazy(() => import("../pages/system/user/UserAuthRegister/UserAuthRegister"));
const UserHistoryFactory = React.lazy(() => import("../pages/system/user/UserHistory/UserHistory"));
const MenuHistoryFactory = React.lazy(() => import("../pages/system/user/MenuHistory/MenuHistory"));

// program
const ProgramRegisterFactory = React.lazy(() => import("../pages/system/program/ProgramRegister/ProgramRegister"));

// common
const CodeRegister = React.lazy(() => import("../pages/system/common/CodeRegister/CodeRegister"));

// apps
const CalendarApp = React.lazy(() => import("../pages/apps/Calendar/"));
const Projects = React.lazy(() => import("../pages/apps/Projects/"));
const ProjectDetail = React.lazy(() => import("../pages/apps/Projects/Detail/"));
const ProjectForm = React.lazy(() => import("../pages/apps/Projects/ProjectForm"));
// - chat
const ChatApp = React.lazy(() => import("../pages/apps/Chat/"));
// - ecommece pages
const EcommerceDashboard = React.lazy(() => import("../pages/apps/Ecommerce/Dashboard/"));
const EcommerceProducts = React.lazy(() => import("../pages/apps/Ecommerce/Products"));
const ProductDetails = React.lazy(() => import("../pages/apps/Ecommerce/ProductDetails"));
const ProductEdit = React.lazy(() => import("../pages/apps/Ecommerce/ProductEdit"));
const Customers = React.lazy(() => import("../pages/apps/Ecommerce/Customers"));
const Orders = React.lazy(() => import("../pages/apps/Ecommerce/Orders"));
const OrderDetails = React.lazy(() => import("../pages/apps/Ecommerce/OrderDetails"));
const Sellers = React.lazy(() => import("../pages/apps/Ecommerce/Sellers"));
const Cart = React.lazy(() => import("../pages/apps/Ecommerce/Cart"));
const Checkout = React.lazy(() => import("../pages/apps/Ecommerce/Checkout"));
// - crm pages
const CRMDashboard = React.lazy(() => import("../pages/apps/CRM/Dashboard/"));
const CRMContacts = React.lazy(() => import("../pages/apps/CRM/Contacts/"));
const Opportunities = React.lazy(() => import("../pages/apps/CRM/Opportunities/"));
const CRMLeads = React.lazy(() => import("../pages/apps/CRM/Leads/"));
const CRMCustomers = React.lazy(() => import("../pages/apps/CRM/Customers/"));
// - email
const Inbox = React.lazy(() => import("../pages/apps/Email/Inbox"));
const EmailDetail = React.lazy(() => import("../pages/apps/Email/Detail"));
const EmailCompose = React.lazy(() => import("../pages/apps/Email/Compose"));
// - social
const SocialFeed = React.lazy(() => import("../pages/apps/SocialFeed/"));
// - companies
const Companies = React.lazy(() => import("../pages/apps/Companies/"));
// - tasks
const TaskList = React.lazy(() => import("../pages/apps/Tasks/List/"));
const TaskDetails = React.lazy(() => import("../pages/apps/Tasks/Details"));
const Kanban = React.lazy(() => import("../pages/apps/Tasks/Board/"));
// -contacts
const ContactsList = React.lazy(() => import("../pages/apps/Contacts/List/"));
const ContactsProfile = React.lazy(() => import("../pages/apps/Contacts/Profile/"));
// -tickets
const TicketsList = React.lazy(() => import("../pages/apps/Tickets/List/"));
const TicketsDetails = React.lazy(() => import("../pages/apps/Tickets/Details/"));
// - file
const FileManager = React.lazy(() => import("../pages/apps/FileManager"));

// extra pages
const Starter = React.lazy(() => import("../pages/other/Starter"));
const Timeline = React.lazy(() => import("../pages/other/Timeline"));
const Sitemap = React.lazy(() => import("../pages/other/Sitemap/"));
const Error404 = React.lazy(() => import("../pages/error/Error404"));
const Error404Two = React.lazy(() => import("../pages/error/Error404Two"));
const Error404Alt = React.lazy(() => import("../pages/error/Error404Alt"));
const Error500 = React.lazy(() => import("../pages/error/Error500"));
const Error500Two = React.lazy(() => import("../pages/error/Error500Two"));
// - other
const Invoice = React.lazy(() => import("../pages/other/Invoice"));
const FAQ = React.lazy(() => import("../pages/other/FAQ"));
const SearchResults = React.lazy(() => import("../pages/other/SearchResults/"));
const Upcoming = React.lazy(() => import("../pages/other/Upcoming"));
const Pricing = React.lazy(() => import("../pages/other/Pricing"));
const Gallery = React.lazy(() => import("../pages/other/Gallery/"));
const Maintenance = React.lazy(() => import("../pages/other/Maintenance"));

// uikit
const Buttons = React.lazy(() => import("../pages/uikit/Buttons"));
const Avatars = React.lazy(() => import("../pages/uikit/Avatars"));
const Cards = React.lazy(() => import("../pages/uikit/Cards"));
const Portlets = React.lazy(() => import("../pages/uikit/Portlets"));
const TabsAccordions = React.lazy(() => import("../pages/uikit/TabsAccordions"));
const Progress = React.lazy(() => import("../pages/uikit/Progress"));
const Modals = React.lazy(() => import("../pages/uikit/Modals"));
const Notifications = React.lazy(() => import("../pages/uikit/Notifications"));
const Offcanvases = React.lazy(() => import("../pages/uikit/Offcanvas"));
const Placeholders = React.lazy(() => import("../pages/uikit/Placeholders"));
const Spinners = React.lazy(() => import("../pages/uikit/Spinners"));
const Images = React.lazy(() => import("../pages/uikit/Images"));
const Carousels = React.lazy(() => import("../pages/uikit/Carousel"));
const ListGroups = React.lazy(() => import("../pages/uikit/ListGroups"));
const EmbedVideo = React.lazy(() => import("../pages/uikit/EmbedVideo"));
const Dropdowns = React.lazy(() => import("../pages/uikit/Dropdowns"));
const Ribbons = React.lazy(() => import("../pages/uikit/Ribbons"));
const TooltipsPopovers = React.lazy(() => import("../pages/uikit/TooltipsPopovers"));
const GeneralUI = React.lazy(() => import("../pages/uikit/GeneralUI"));
const Typography = React.lazy(() => import("../pages/uikit/Typography"));
const Grid = React.lazy(() => import("../pages/uikit/Grid"));
const NestableList = React.lazy(() => import("../pages/uikit/NestableList"));
const DragDrop = React.lazy(() => import("../pages/uikit/DragDrop"));
const RangeSliders = React.lazy(() => import("../pages/uikit/RangeSliders"));
const Animation = React.lazy(() => import("../pages/uikit/Animation"));
const TourPage = React.lazy(() => import("../pages/uikit/TourPage"));
const SweetAlerts = React.lazy(() => import("../pages/uikit/SweetAlerts"));
const LoadingButtons = React.lazy(() => import("../pages/uikit/LoadingButtons"));

// widgets
const Widgets = React.lazy(() => import("../pages/uikit/Widgets"));

// icons
const TwoToneIcons = React.lazy(() => import("../pages/icons/TwoToneIcons/"));
const FeatherIcons = React.lazy(() => import("../pages/icons/FeatherIcons/"));
const Dripicons = React.lazy(() => import("../pages/icons/Dripicons/"));
const MDIIcons = React.lazy(() => import("../pages/icons/MDIIcons/"));
const FontAwesomeIcons = React.lazy(() => import("../pages/icons/FontAwesomeIcons/"));
const ThemifyIcons = React.lazy(() => import("../pages/icons/ThemifyIcons/"));
const SimpleLineIcons = React.lazy(() => import("../pages/icons/SimpleLineIcons/"));
const WeatherIcons = React.lazy(() => import("../pages/icons/WeatherIcons/"));

// forms
const BasicForms = React.lazy(() => import("../pages/forms/Basic"));
const FormAdvanced = React.lazy(() => import("../pages/forms/Advanced"));
const FormValidation = React.lazy(() => import("../pages/forms/Validation"));
const FormWizard = React.lazy(() => import("../pages/forms/Wizard"));
const FileUpload = React.lazy(() => import("../pages/forms/FileUpload"));
const Editors = React.lazy(() => import("../pages/forms/Editors"));

// tables
const BasicTables = React.lazy(() => import("../pages/tables/Basic"));
const AdvancedTables = React.lazy(() => import("../pages/tables/Advanced"));

// charts
const ApexChart = React.lazy(() => import("../pages/charts/Apex"));
const ChartJs = React.lazy(() => import("../pages/charts/ChartJs"));

// maps
const GoogleMaps = React.lazy(() => import("../pages/maps/GoogleMaps"));
const VectorMaps = React.lazy(() => import("../pages/maps/VectorMaps"));

// editor
const JoditEditorOrginal = React.lazy(() => import("../pages/editor/JoditEditor/index"));
const JoditEditorTest = React.lazy(() => import("../pages/editor/JoditEditorTest/index"));

// hrm
const SalaryContract = React.lazy(() => import("../pages/hrm/kpi/SalaryContract"));

// rnd
const Recap = React.lazy(() => import("../pages/rnd/fabric/recap/Recap"));
const Favorite = React.lazy(() => import("../pages/rnd/fabric/favorite/Favorite"));
const Sending = React.lazy(() => import("../pages/rnd/fabric/sending/Sending"));
const FabricInventory = React.lazy(() => import("../pages/rnd/fabric/inventory/FabricInventory"));
const FabricDashboard = React.lazy(() => import("../pages/rnd/fabric/dashboord/FabricDashboard"));
const Return = React.lazy(() => import("../pages/rnd/fabric/return/Return"));
const FabricLibrary = React.lazy(() => import("../pages/rnd/fabric/library/FabricLibrary"));

// sales
const SalesActivity = React.lazy(() => import("../pages/sales/activity/SalesActivity"));
const SalesActivityPlan = React.lazy(() => import("../pages/sales/plan/SalesActivityPlan"));
const SalesActivityDashboard = React.lazy(() => import("../pages/sales/dashboard/SalesActivityDashBoard"));

// FACTORY (Production Plan )
const FactoryDashboard = React.lazy(() => import("@pages/mainfactory/dashboard/FactoryDashboard"));
const FactorySewingActualChart = React.lazy(() => import("@pages/mainfactory/sewing/chart/FactorySewingActualChart"));
const GoogleSheets = React.lazy(() => import("@pages/mainfactory/production/GoogleSheets"));
const DailyReport = React.lazy(() => import("@pages/mainfactory/daily/report/DailyReport"));
const DailyProduction = React.lazy(() => import("@pages/mainfactory/sewing/actual/MainSewingActual"));
const CuttingStock = React.lazy(() => import("@pages/mainfactory/cutting/stock/CuttingStock"));
const CuttingActual = React.lazy(() => import("@pages/mainfactory/cutting/actual/CuttingActual"));
const SewingInputLineQty = React.lazy(() => import("@pages/mainfactory/sewing/inputline/SewingInputLineQty"));
const MainSewingStatus = React.lazy(() => import("@pages/mainfactory/sewing/status/MainSewingStatus"));
const MainIronActual = React.lazy(() => import("@pages/mainfactory/iron/MainIronActual"));
const NeedleAndHangTag = React.lazy(() => import("@pages/mainfactory/needle/NeedleAndHangTag"));
const MainPacking = React.lazy(() => import("@pages/mainfactory/packing/MainPacking"));
const KnittingStatus = React.lazy(() => import("@pages/mainfactory/knitting/status/KnittingStatus"));

export interface RoutesProps {
  path: RouteProps["path"];
  name?: string;
  element?: RouteProps["element"];
  route?: any;
  exact?: boolean;
  icon?: string;
  header?: string;
  roles?: string[];
  children?: RoutesProps[];
}

// dashboards
const dashboardRoutes: RoutesProps = {
  path: "/dashboard",
  name: "Dashboards",
  icon: "airplay",
  header: "Navigation",
  children: [
    {
      path: "/dashboard-1",
      name: "Dashboard1",
      element: <Dashboard1 />,
      route: PrivateRoute,
    },
    {
      path: "/dashboard-1",
      name: "Dashboard 1",
      element: <Dashboard1 />,
      route: PrivateRoute,
    },
    {
      path: "/dashboard-2",
      name: "Dashboard 2",
      element: <Dashboard2 />,
      route: PrivateRoute,
    },
    {
      path: "/dashboard-3",
      name: "Dashboard 3",
      element: <Dashboard3 />,
      route: PrivateRoute,
    },
    {
      path: "/dashboard-4",
      name: "Dashboard 4",
      element: <Dashboard4 />,
      route: PrivateRoute,
    },
    {
      path: "/dashboard-5",
      name: "Dashboard 5",
      element: <Dashboard5 />,
      route: PrivateRoute,
    },
  ],
};

// EIS
const eisRoutes: RoutesProps = {
  path: "/eis",
  name: "EIS",
  icon: "airplay",
  header: "Navigation",
  children: [
    {
      path: "/sewingstatus",
      name: "Sewingstatus",
      element: <Sewingstatus />,
      route: PrivateRoute,
    },
    {
      path: "/factorysewing",
      name: "FactorySewing",
      element: <Factorysewing />,
      route: PrivateRoute,
    },
    {
      path: "/sewingProcess",
      name: "SewingProcess",
      element: <SewingProcess />,
      route: PrivateRoute,
    },
    {
      path: "/corporationpl",
      name: "CorporationPl",
      element: <CorporationPl />,
      route: PrivateRoute,
    },
    {
      path: "/sixMonthStatus",
      name: "SixMonthStatus",
      element: <SixMonthStatus />,
      route: PrivateRoute,
    },
    {
      path: "/eis-3",
      name: "Dashboard 3",
      element: <Dashboard3 />,
      route: PrivateRoute,
    },
    {
      path: "/eis-4",
      name: "Dashboard 4",
      element: <Dashboard4 />,
      route: PrivateRoute,
    },
    {
      path: "/eis-5",
      name: "Dashboard 5",
      element: <Dashboard5 />,
      route: PrivateRoute,
    },
  ],
};

// PPS(google sheets)
const ppsRoutes: RoutesProps = {
  path: "/user",
  name: "PPS",
  icon: "airplay",
  header: "Navigation",
  children: [
    {
      path: "/factory/dashboard",
      name: "Factory DashBoard",
      element: <FactoryDashboard />,
      route: PrivateRoute,
    },
    {
      path: "/factory/sewing/actual/chart",
      name: "Sewing Actual Chart",
      element: <FactorySewingActualChart />,
      route: PrivateRoute,
    },
    {
      path: "/dailyReport",
      name: "Daily Report",
      element: <DailyReport />,
      route: PrivateRoute,
    },
    {
      path: "/dailyProduction",
      name: "Daily Production",
      element: <DailyProduction />,
      route: PrivateRoute,
    },
    {
      path: "/cuttingStock",
      name: "Cutting Stock",
      element: <CuttingStock />,
      route: PrivateRoute,
    },
    {
      path: "/cuttingActual",
      name: "Cutting Actual",
      element: <CuttingActual />,
      route: PrivateRoute,
    },
    {
      path: "/sewingInputLine",
      name: "Sewing Input Line",
      element: <SewingInputLineQty />,
      route: PrivateRoute,
    },
    {
      path: "/ironActual",
      name: "Iron Actual",
      element: <MainIronActual />,
      route: PrivateRoute,
    },
    {
      path: "/productionPlan",
      name: "Factory Plan",
      element: <GoogleSheets />,
      route: PrivateRoute,
    },
    {
      path: "/needleHangTag",
      name: "Needle&HangTag",
      element: <NeedleAndHangTag />,
      route: PrivateRoute,
    },
    {
      path: "/packing",
      name: "Packing Actual",
      element: <MainPacking />,
      route: PrivateRoute,
    },
    {
      path: "/knitstatus",
      name: "KnittingStatus",
      element: <KnittingStatus />,
      route: PrivateRoute,
    },
    {
      path: "/sewing/status",
      name: "MainSewingStatus",
      element: <MainSewingStatus />,
      route: PrivateRoute,
    },
  ],
};

// user
const userRoutes: RoutesProps = {
  path: "/user",
  name: "User",
  icon: "airplay",
  header: "Navigation",
  children: [
    {
      path: "/userregister",
      name: "UserRegister",
      element: <UserRegisterFactory />,
      route: PrivateRoute,
    },
    {
      path: "/authgroupregister",
      name: "AuthGroupRegister",
      element: <AuthGroupRegisterFactory />,
      route: PrivateRoute,
    },
    {
      path: "/userauthregister",
      name: "UserAuthRegister",
      element: <UserAuthRegisterFactory />,
      route: PrivateRoute,
    },
    {
      path: "/userhistory",
      name: "UserHistory",
      element: <UserHistoryFactory />,
      route: PrivateRoute,
    },
    {
      path: "/menuhistory",
      name: "MenuHistory",
      element: <MenuHistoryFactory />,
      route: PrivateRoute,
    },
  ],
};

// program
const programRoutes: RoutesProps = {
  path: "/program",
  name: "Program",
  icon: "airplay",
  header: "Navigation",
  children: [
    {
      path: "/programregister",
      name: "ProgramRegister",
      element: <ProgramRegisterFactory />,
      route: PrivateRoute,
    },
  ],
};

// user
const commonRoutes: RoutesProps = {
  path: "/common",
  name: "Common",
  icon: "airplay",
  header: "Navigation",
  children: [
    {
      path: "/coderegister",
      name: "CodeRegister",
      element: <CodeRegister />,
      route: PrivateRoute,
    },
  ],
};

// hrm
const hrmRoutes: RoutesProps = {
  path: "/hrm",
  name: "HRM",
  icon: "airplay",
  header: "Navigation",
  children: [
    {
      path: "/salaryContract",
      name: "SalaryContract",
      element: <SalaryContract />,
      route: PrivateRoute,
    },
  ],
};

// rnd
const rndRoutes: RoutesProps = {
  path: "/rnd",
  name: "RND",
  icon: "Calendar",
  header: "Navigation",
  children: [
    {
      path: "/fabric/recap",
      name: "FabricRecap",
      element: <Recap />,
      route: PrivateRoute,
    },
    {
      path: "/fabric/library",
      name: "FabricLibrary",
      element: <FabricLibrary />,
      route: PrivateRoute,
    },
    {
      path: "/fabric/favorite",
      name: "FabricFavorite",
      element: <Favorite />,
      route: PrivateRoute,
    },
    {
      path: "/fabric/sending",
      name: "FabricSending",
      element: <Sending />,
      route: PrivateRoute,
    },
    {
      path: "/fabric/return",
      name: "FabricReturn",
      element: <Return />,
      route: PrivateRoute,
    },
    {
      path: "/fabric/inventory",
      name: "FabricInventory",
      element: <FabricInventory />,
      route: PrivateRoute,
    },
    {
      path: "/fabric/dashboard",
      name: "FabricDashboard",
      element: <FabricDashboard />,
      route: PrivateRoute,
    },
  ],
};

// sales
const salesRoutes: RoutesProps = {
  path: "/sales",
  name: "Sales Plus",
  icon: "airplay",
  header: "Navigation",
  children: [
    {
      path: "/salesActivity",
      name: "SalesActivity",
      element: <SalesActivity />,
      route: PrivateRoute,
    },
    {
      path: "/salesActivityDashboard",
      name: "SalesActivityDashboard",
      element: <SalesActivityDashboard />,
      route: PrivateRoute,
    },
    {
      path: "/",
      name: "SalesActivityPlan",
      element: <Navigate to="/salesActivityPlan" />,
      route: PrivateRoute,
    },
    {
      path: "/salesActivityPlan",
      name: "SalesActivityPlan",
      element: <SalesActivityPlan />,
      route: PrivateRoute,
    },
  ],
};

const calendarAppRoutes: RoutesProps = {
  path: "/apps/calendar",
  name: "Calendar",
  route: PrivateRoute,
  roles: ["Admin"],
  icon: "calendar",
  element: <CalendarApp />,
  header: "Apps",
};

const chatAppRoutes = {
  path: "/apps/chat",
  name: "Chat",
  route: PrivateRoute,
  roles: ["Admin"],
  icon: "message-square",
  element: <ChatApp />,
};

const ecommerceAppRoutes = {
  path: "/apps/ecommerce",
  name: "eCommerce",
  route: PrivateRoute,
  roles: ["Admin"],
  icon: "shopping-cart",
  children: [
    {
      path: "/apps/ecommerce/dashboard",
      name: "Products",
      element: <EcommerceDashboard />,
      route: PrivateRoute,
    },
    {
      path: "/apps/ecommerce/products",
      name: "Products",
      element: <EcommerceProducts />,
      route: PrivateRoute,
    },
    {
      path: "/apps/ecommerce/product-details",
      name: "Product Details",
      element: <ProductDetails />,
      route: PrivateRoute,
    },
    {
      path: "/apps/ecommerce/edit-product",
      name: "Product Edit",
      element: <ProductEdit />,
      route: PrivateRoute,
    },
    {
      path: "/apps/ecommerce/customers",
      name: "Customers",
      element: <Customers />,
      route: PrivateRoute,
    },
    {
      path: "/apps/ecommerce/orders",
      name: "Orders",
      element: <Orders />,
      route: PrivateRoute,
    },
    {
      path: "/apps/ecommerce/order/details",
      name: "Order Details",
      element: <OrderDetails />,
      route: PrivateRoute,
    },
    {
      path: "/apps/ecommerce/sellers",
      name: "Sellers",
      element: <Sellers />,
      route: PrivateRoute,
    },
    {
      path: "/apps/ecommerce/shopping-cart",
      name: "Shopping Cart",
      element: <Cart />,
      route: PrivateRoute,
    },
    {
      path: "/apps/ecommerce/checkout",
      name: "Checkout",
      element: <Checkout />,
      route: PrivateRoute,
    },
  ],
};

const crmAppRoutes = {
  path: "/apps/crm",
  name: "CRM",
  route: PrivateRoute,
  roles: ["Admin"],
  icon: "users",
  children: [
    {
      path: "/apps/crm/dashboard",
      name: "Dashboard",
      element: <CRMDashboard />,
      route: PrivateRoute,
    },
    {
      path: "/apps/crm/contacts",
      name: "Contacts",
      element: <CRMContacts />,
      route: PrivateRoute,
    },
    {
      path: "/apps/crm/opportunities",
      name: "Opportunities",
      element: <Opportunities />,
      route: PrivateRoute,
    },
    {
      path: "/apps/crm/leads",
      name: "Leads",
      element: <CRMLeads />,
      route: PrivateRoute,
    },
    {
      path: "/apps/crm/customers",
      name: "Customers",
      element: <CRMCustomers />,
      route: PrivateRoute,
    },
  ],
};

const emailAppRoutes = {
  path: "/apps/email",
  name: "Email",
  route: PrivateRoute,
  roles: ["Admin"],
  icon: "mail",
  children: [
    {
      path: "/apps/email/inbox",
      name: "Inbox",
      element: <Inbox />,
      route: PrivateRoute,
    },
    {
      path: "/apps/email/details",
      name: "Email Details",
      element: <EmailDetail />,
      route: PrivateRoute,
    },
    {
      path: "/apps/email/compose",
      name: "Compose Email",
      element: <EmailCompose />,
      route: PrivateRoute,
    },
  ],
};

const socialAppRoutes = {
  path: "/apps/social-feed",
  name: "Social Feed",
  route: PrivateRoute,
  roles: ["Admin"],
  icon: "rss",
  element: <SocialFeed />,
};

const companiesAppRoutes = {
  path: "/apps/companies",
  name: "Companies",
  route: PrivateRoute,
  roles: ["Admin"],
  icon: "activity",
  element: <Companies />,
};

const projectAppRoutes = {
  path: "/apps/projects",
  name: "Projects",
  route: PrivateRoute,
  roles: ["Admin"],
  icon: "uil-briefcase",

  children: [
    {
      path: "/apps/projects/list",
      name: "List",
      element: <Projects />,
      route: PrivateRoute,
    },
    {
      path: "/apps/projects/:id/details",
      name: "Detail",
      element: <ProjectDetail />,
      route: PrivateRoute,
    },
    {
      path: "/apps/projects/create",
      name: "Create Project",
      element: <ProjectForm />,
      route: PrivateRoute,
    },
  ],
};

const taskAppRoutes = {
  path: "/apps/tasks",
  name: "Tasks",
  route: PrivateRoute,
  roles: ["Admin"],
  icon: "clipboard",
  children: [
    {
      path: "/apps/tasks/list",
      name: "Task List",
      element: <TaskList />,
      route: PrivateRoute,
    },
    {
      path: "/apps/tasks/details",
      name: "Task List",
      element: <TaskDetails />,
      route: PrivateRoute,
    },
    {
      path: "/apps/tasks/kanban",
      name: "Kanban",
      element: <Kanban />,
      route: PrivateRoute,
    },
  ],
};

const contactsRoutes = {
  path: "/apps/contacts",
  name: "Contacts",
  route: PrivateRoute,
  roles: ["Admin"],
  icon: "book",
  children: [
    {
      path: "/apps/contacts/list",
      name: "Task List",
      element: <ContactsList />,
      route: PrivateRoute,
    },
    {
      path: "/apps/contacts/profile",
      name: "Profile",
      element: <ContactsProfile />,
      route: PrivateRoute,
    },
  ],
};

const ticketsRoutes = {
  path: "/apps/tickets",
  name: "Tickets",
  route: PrivateRoute,
  roles: ["Admin"],
  icon: "aperture",
  children: [
    {
      path: "/apps/tickets/list",
      name: "List",
      element: <TicketsList />,
      route: PrivateRoute,
    },
    {
      path: "/apps/tickets/details",
      name: "Details",
      element: <TicketsDetails />,
      route: PrivateRoute,
    },
  ],
};

const fileAppRoutes = {
  path: "/apps/file-manager",
  name: "File Manager",
  route: PrivateRoute,
  roles: ["Admin"],
  icon: "folder-plus",
  element: <FileManager />,
};

const appRoutes = [
  calendarAppRoutes,
  chatAppRoutes,
  ecommerceAppRoutes,
  crmAppRoutes,
  emailAppRoutes,
  socialAppRoutes,
  companiesAppRoutes,
  projectAppRoutes,
  taskAppRoutes,
  contactsRoutes,
  ticketsRoutes,
  fileAppRoutes,
];

// pages
const extrapagesRoutes = {
  path: "/pages",
  name: "Pages",
  icon: "package",
  header: "Custom",
  children: [
    {
      path: "/pages/starter",
      name: "Starter",
      element: <Starter />,
      route: PrivateRoute,
    },
    {
      path: "/pages/timeline",
      name: "Timeline",
      element: <Timeline />,
      route: PrivateRoute,
    },
    {
      path: "/pages/sitemap",
      name: "Sitemap",
      element: <Sitemap />,
      route: PrivateRoute,
    },
    {
      path: "/pages/invoice",
      name: "Invoice",
      element: <Invoice />,
      route: PrivateRoute,
    },
    {
      path: "/pages/faq",
      name: "FAQ",
      element: <FAQ />,
      route: PrivateRoute,
    },
    {
      path: "/pages/serach-results",
      name: "Search Results",
      element: <SearchResults />,
      route: PrivateRoute,
    },
    {
      path: "/pages/pricing",
      name: "Pricing",
      element: <Pricing />,
      route: PrivateRoute,
    },
    {
      path: "/pages/gallery",
      name: "Gallery",
      element: <Gallery />,
      route: PrivateRoute,
    },
    {
      path: "/pages/error-404-alt",
      name: "Error - 404-alt",
      element: <Error404Alt />,
      route: PrivateRoute,
    },
  ],
};

// ui
const uiRoutes = {
  path: "/ui",
  name: "Components",
  icon: "pocket",
  header: "UI Elements",
  children: [
    {
      path: "/ui/base",
      name: "Base UI",
      children: [
        {
          path: "/ui/buttons",
          name: "Buttons",
          element: <Buttons />,
          route: PrivateRoute,
        },
        {
          path: "/ui/cards",
          name: "Cards",
          element: <Cards />,
          route: PrivateRoute,
        },
        {
          path: "/ui/avatars",
          name: "Avatars",
          element: <Avatars />,
          route: PrivateRoute,
        },
        {
          path: "/ui/portlets",
          name: "Portlets",
          element: <Portlets />,
          route: PrivateRoute,
        },
        {
          path: "/ui/tabs-accordions",
          name: "Tabs & Accordions",
          element: <TabsAccordions />,
          route: PrivateRoute,
        },
        {
          path: "/ui/progress",
          name: "Progress",
          element: <Progress />,
          route: PrivateRoute,
        },
        {
          path: "/ui/modals",
          name: "Modals",
          element: <Modals />,
          route: PrivateRoute,
        },
        {
          path: "/ui/notifications",
          name: "Notifications",
          element: <Notifications />,
          route: PrivateRoute,
        },
        {
          path: "/ui/offcanvas",
          name: "Offcanvas",
          element: <Offcanvases />,
          route: PrivateRoute,
        },
        {
          path: "/ui/placeholders",
          name: "Placeholders",
          element: <Placeholders />,
          route: PrivateRoute,
        },
        {
          path: "/ui/spinners",
          name: "Spinners",
          element: <Spinners />,
          route: PrivateRoute,
        },
        {
          path: "/ui/images",
          name: "Images",
          element: <Images />,
          route: PrivateRoute,
        },
        {
          path: "/ui/carousel",
          name: "Carousel",
          element: <Carousels />,
          route: PrivateRoute,
        },
        {
          path: "/ui/listgroups",
          name: "List Groups",
          element: <ListGroups />,
          route: PrivateRoute,
        },
        {
          path: "/ui/embedvideo",
          name: "EmbedVideo",
          element: <EmbedVideo />,
          route: PrivateRoute,
        },
        {
          path: "/ui/dropdowns",
          name: "Dropdowns",
          element: <Dropdowns />,
          route: PrivateRoute,
        },
        {
          path: "/ui/ribbons",
          name: "Ribbons",
          element: <Ribbons />,
          route: PrivateRoute,
        },
        {
          path: "/ui/tooltips-popovers",
          name: "Tooltips & Popovers",
          element: <TooltipsPopovers />,
          route: PrivateRoute,
        },
        {
          path: "/ui/typography",
          name: "Typography",
          element: <Typography />,
          route: PrivateRoute,
        },
        {
          path: "/ui/grid",
          name: "Grid",
          element: <Grid />,
          route: PrivateRoute,
        },
        {
          path: "/ui/general",
          name: "General UI",
          element: <GeneralUI />,
          route: PrivateRoute,
        },
      ],
    },
    {
      path: "/ui/extended",
      name: "Extended UI",
      children: [
        {
          path: "/extended-ui/nestable",
          name: "Nestable List",
          element: <NestableList />,
          route: PrivateRoute,
        },
        {
          path: "/extended-ui/dragdrop",
          name: "Drag and Drop",
          element: <DragDrop />,
          route: PrivateRoute,
        },
        {
          path: "/extended-ui/rangesliders",
          name: "Range Sliders",
          element: <RangeSliders />,
          route: PrivateRoute,
        },
        {
          path: "/extended-ui/animation",
          name: "Animation",
          element: <Animation />,
          route: PrivateRoute,
        },
        {
          path: "/extended-ui/sweet-alert",
          name: "Sweet Alert",
          element: <SweetAlerts />,
          route: PrivateRoute,
        },
        {
          path: "/extended-ui/tour",
          name: "Tour Page",
          element: <TourPage />,
          route: PrivateRoute,
        },
        {
          path: "/extended-ui/loading-buttons",
          name: "Loading Buttons",
          element: <LoadingButtons />,
          route: PrivateRoute,
        },
      ],
    },
    {
      path: "/ui/widgets",
      name: "Widgets",
      element: <Widgets />,
      route: PrivateRoute,
    },
    {
      path: "/ui/icons",
      name: "Icons",
      children: [
        {
          path: "/ui/icons/two-tone",
          name: "Two Tone Icons",
          element: <TwoToneIcons />,
          route: PrivateRoute,
        },
        {
          path: "/ui/icons/feather",
          name: "Feather Icons",
          element: <FeatherIcons />,
          route: PrivateRoute,
        },
        {
          path: "/ui/icons/dripicons",
          name: "Dripicons",
          element: <Dripicons />,
          route: PrivateRoute,
        },
        {
          path: "/ui/icons/mdi",
          name: "Material Design",
          element: <MDIIcons />,
          route: PrivateRoute,
        },
        {
          path: "/ui/icons/font-awesome",
          name: "Font Awesome 5",
          element: <FontAwesomeIcons />,
          route: PrivateRoute,
        },
        {
          path: "/ui/icons/themify",
          name: "Themify",
          element: <ThemifyIcons />,
          route: PrivateRoute,
        },
        {
          path: "/ui/icons/simple-line",
          name: "Simple Line Icons",
          element: <SimpleLineIcons />,
          route: PrivateRoute,
        },
        {
          path: "/ui/icons/weather",
          name: "Weather Icons",
          element: <WeatherIcons />,
          route: PrivateRoute,
        },
      ],
    },
    {
      path: "/ui/forms",
      name: "Forms",
      children: [
        {
          path: "/ui/forms/basic",
          name: "Basic Elements",
          element: <BasicForms />,
          route: PrivateRoute,
        },
        {
          path: "/ui/forms/advanced",
          name: "Form Advanced",
          element: <FormAdvanced />,
          route: PrivateRoute,
        },
        {
          path: "/ui/forms/validation",
          name: "Form Validation",
          element: <FormValidation />,
          route: PrivateRoute,
        },
        {
          path: "/ui/forms/wizard",
          name: "Form Wizard",
          element: <FormWizard />,
          route: PrivateRoute,
        },
        {
          path: "/ui/forms/upload",
          name: "File Upload",
          element: <FileUpload />,
          route: PrivateRoute,
        },
        {
          path: "/ui/forms/editors",
          name: "Editors",
          element: <Editors />,
          route: PrivateRoute,
        },
      ],
    },
    {
      path: "/ui/tables",
      name: "Tables",
      children: [
        {
          path: "/ui/tables/basic",
          name: "Basic",
          element: <BasicTables />,
          route: PrivateRoute,
        },
        {
          path: "/ui/tables/advanced",
          name: "Advanced",
          element: <AdvancedTables />,
          route: PrivateRoute,
        },
      ],
    },
    {
      path: "/ui/charts",
      name: "Charts",
      children: [
        {
          path: "/ui/charts/apex",
          name: "Apex",
          element: <ApexChart />,
          route: PrivateRoute,
        },
        {
          path: "/ui/charts/chartjs",
          name: "Chartjs",
          element: <ChartJs />,
          route: PrivateRoute,
        },
      ],
    },
    {
      path: "/ui/maps",
      name: "Maps",
      children: [
        {
          path: "/ui/googlemaps",
          name: "Google Maps",
          element: <GoogleMaps />,
          route: PrivateRoute,
        },
        {
          path: "/ui/vectorMaps",
          name: "Google Maps",
          element: <VectorMaps />,
          route: PrivateRoute,
        },
      ],
    },
  ],
};

// auth
const authRoutes: RoutesProps[] = [
  {
    path: "/auth/login",
    name: "Login",
    element: <Login />,
    route: Route,
  },
  {
    path: "/auth/register",
    name: "Register",

    element: <Register />,
    route: Route,
  },
  {
    path: "/auth/settingInfo",
    name: "SettingInfo",
    element: <SettingInfo />,
    route: Route,
  },
  {
    path: "/auth/confirm",
    name: "Confirm",
    element: <Confirm />,
    route: Route,
  },
  {
    path: "/auth/forget-password",
    name: "Forget Password",
    element: <ForgetPassword />,
    route: Route,
  },
  {
    path: "/auth/signin-signup",
    name: "SignIn-SignUp",
    element: <SignInSignUp />,
    route: Route,
  },
  {
    path: "/auth/lock-screen",
    name: "Lock Screen",
    element: <LockScreen />,
    route: Route,
  },
  {
    path: "/auth/logout",
    name: "Logout",
    element: <Logout />,
    route: Route,
  },
  {
    path: "/auth/login2",
    name: "Login2",
    element: <Login2 />,
    route: Route,
  },
  {
    path: "/auth/logout2",
    name: "Logout2",
    element: <Logout2 />,
    route: Route,
  },
  {
    path: "/auth/register2",
    name: "Register2",
    element: <Register2 />,
    route: Route,
  },
  {
    path: "/auth/confirm2",
    name: "Confirm2",
    element: <Confirm2 />,
    route: Route,
  },
  {
    path: "/auth/forget-password2",
    name: "Forget Password2",
    element: <ForgetPassword2 />,
    route: Route,
  },
  {
    path: "/auth/signin-signup2",
    name: "SignIn-SignUp2",
    element: <SignInSignUp2 />,
    route: Route,
  },
  {
    path: "/auth/lock-screen2",
    name: "Lock Screen2",
    element: <LockScreen2 />,
    route: Route,
  },
  {
    path: "/auth/login/tablet",
    name: "LoginTablet",
    element: <LoginTablet />,
    route: Route,
  },
  {
    path: "/auth/login/factory",
    name: "LoginFactory",
    element: <LoginFactory />,
    route: Route,
  },
  {
    path: "/auth/login/srs",
    name: "LoginSrs",
    element: <LoginSrs />,
    route: Route,
  },
];

// public routes
const otherPublicRoutes = [
  {
    path: "/landing",
    name: "landing",
    element: <Landing />,
    route: Route,
  },
  {
    path: "/asset/details",
    name: "Asset Details",
    element: <AssetDetails />,
    route: PrivateRoute,
  },
  {
    path: "/maintenance",
    name: "Maintenance",
    element: <Maintenance />,
    route: Route,
  },
  {
    path: "/error-404",
    name: "Error - 404",
    element: <Error404 />,
    route: Route,
  },
  {
    path: "/error-404-two",
    name: "Error - 404 Two",
    element: <Error404Two />,
    route: Route,
  },
  {
    path: "/error-500",
    name: "Error - 500",
    element: <Error500 />,
    route: Route,
  },
  {
    path: "/error-500-two",
    name: "Error - 500 Two",
    element: <Error500Two />,
    route: Route,
  },
  {
    path: "/upcoming",
    name: "Coming Soon",
    element: <Upcoming />,
    route: Route,
  },
];

// etc routes
const otherEtcRoutes = [
  {
    path: "/asset/details",
    name: "Asset Details",
    element: <AssetDetails />,
    route: PrivateRoute,
  },
];

// factory dashboard
const factoryAppRoutes: RoutesProps = {
  path: "/factoryDashboard",
  name: "Factory",
  header: "Navigation",
  children: [
    {
      path: "/factory",
      name: "Root",
      element: <Navigate to="/factory/home" />,
      route: PrivateRoute,
    },
    {
      path: "/factory/home",
      name: "FactoryHome",
      element: <FactoryHome />,
      route: PrivateRoute,
    },
    {
      path: "/factory/lineSelection",
      name: "FactoryLineSelection",
      element: <FactoryLineSelection />,
      route: PrivateRoute,
    },
    {
      path: "/factory/cutting/stock",
      name: "CuttingStockFactory",
      element: <CuttingStockFactory />,
      route: PrivateRoute,
    },
    {
      path: "/factory/cutting/actual/style",
      name: "CuttingActualStyleFactory",
      element: <CuttingActualStyleFactory />,
      route: PrivateRoute,
    },
    {
      path: "/factory/cutting/actual/color",
      name: "CuttingActualColorFactory",
      element: <CuttingActualColorFactory />,
      route: PrivateRoute,
    },
    {
      path: "/factory/sewing/input",
      name: "SewingInputFactory",
      element: <SewingInputFactory />,
      route: PrivateRoute,
    },
    {
      path: "/factory/sewing/inputline",
      name: "SewingInputLineFactory",
      element: <SewingInputLineFactory />,
      route: PrivateRoute,
    },
    {
      path: "/factory/sewing/actual",
      name: "SewingActualFactory",
      element: <SewingActualFactory />,
      route: PrivateRoute,
    },
    {
      path: "/factory/sewing/total/actual",
      name: "SewingTotalActualFactory",
      element: <SewingTotalActualFactory />,
      route: PrivateRoute,
    },
    {
      path: "/factory/sewing/hps/list",
      name: "SewingHpsPopUpFactory",
      element: <SewingHpsPopUpFactory />,
      route: PrivateRoute,
    },
    {
      path: "/factory/sewing/hps/shopFloor",
      name: "SewingHpsShopFloorPopUpFactory",
      element: <SewingHpsShopFloorPopUpFactory />,
      route: PrivateRoute,
    },

    {
      path: "/factory/iron/actual",
      name: "IronActualFactory",
      element: <IronActualFactory />,
      route: PrivateRoute,
    },
    {
      path: "/factory/folding/actual",
      name: "FoldingActualFactory",
      element: <FoldingActualFactory />,
      route: PrivateRoute,
    },
    {
      path: "/factory/needle/actual",
      name: "NeedleActualFactory",
      element: <NeedleActualFactory />,
      route: PrivateRoute,
    },
    {
      path: "/factory/finish/qc",
      name: "FinishQCFactory",
      element: <FinishQcFactory />,
      route: PrivateRoute,
    },
    {
      path: "/factory/finish/qc/finishqcline",
      name: "FinishQcLineFactory",
      element: <FinishQcLineFactory />,
      route: PrivateRoute,
    },
    {
      path: "/factory/finish/qc/chart",
      name: "FinishQCFactory",
      element: <FinishQcChartFactory />,
      route: PrivateRoute,
    },
    {
      path: "/factory/packing/actual",
      name: "PackingActualFactory",
      element: <PackingActualFactory />,
      route: PrivateRoute,
    },
    {
      path: "/factory/knitting/list",
      name: "KnittingListFactory",
      element: <KnittingListFactory />,
      route: PrivateRoute,
    },
    {
      path: "/factory/knitting/machine",
      name: "KnittingMachineFactory",
      element: <KnittingMachineFactory />,
      route: PrivateRoute,
    },
    {
      path: "/factory/machine/sewing/management",
      name: "SewingManagementFactory",
      element: <SewingManagementFactory />,
      route: PrivateRoute,
    },
    {
      path: "/factory/machine/sewing/machine",
      name: "SewingMachineFactory",
      element: <SewingMachineFactory />,
      route: PrivateRoute,
    },
  ],
};

// tablet
const tabletAppRoutes: RoutesProps = {
  path: "/tablets",
  name: "Tablet",
  header: "Navigation",
  children: [
    {
      path: "/tablet",
      name: "Root",
      element: <Navigate to="/tablet/home" />,
      route: PrivateRoute,
    },
    {
      path: "/tablet/home",
      name: "TabletHome",
      element: <TabletHome />,
      route: PrivateRoute,
    },
    {
      path: "/tablet/lineSelection",
      name: "TabletLineSelection",
      element: <TabletLineSelection />,
      route: PrivateRoute,
    },
    {
      path: "/tablet/needle/actual",
      name: "NeedleActual",
      element: <NeedleActual />,
      route: PrivateRoute,
    },
    {
      path: "/tablet/folding/actual",
      name: "FoldingActual",
      element: <FoldingActual />,
      route: PrivateRoute,
    },
    {
      path: "/tablet/sewing/input",
      name: "SewingInput",
      element: <SewingInput />,
      route: PrivateRoute,
    },
    {
      path: "/tablet/sewing/actual",
      name: "SewingActual",
      element: <SewingActual />,
      route: PrivateRoute,
    },
    {
      path: "/tablet/packing/actual",
      name: "PackingActual",
      element: <PackingActual />,
      route: PrivateRoute,
    },
    {
      path: "/tablet/finish/qc",
      name: "FinishQc",
      element: <FinishQc />,
      route: PrivateRoute,
    },
  ],
};


const srsRoutes: RoutesProps = {
  path: "/srsRoot",
  name: "Srs",
  header: "Navigation",
  children: [
    {
      path: "/srs",
      name: "Root",
      element: <Navigate to="/srs/service" replace />,
    },
    {
      path: "/srs/service",
      name: "SRS Service",
      element: <SrsServicePage />,
    },
  ],
};

const editorRotues: RoutesProps = {
  path: "/editor",
  name: "Editor",
  header: "Navigation",
  children: [
    {
      path: "/joditeditor",
      name: "JoditEditorOrginal",
      element: <JoditEditorOrginal />,
      route: PrivateRoute,
    },
    {
      path: "/joditeditortest",
      name: "JoditEditorTest",
      element: <JoditEditorTest />,
      route: PrivateRoute,
    },
  ],
};

// flatten the list of all nested routes
const flattenRoutes = (routes: RoutesProps[]) => {
  let flatRoutes: RoutesProps[] = [];

  (routes || []).forEach((item: RoutesProps) => {
    if (item.element) {
      flatRoutes.push(item);
    }

    if (item.children) {
      flatRoutes = [...flatRoutes, ...flattenRoutes(item.children)];
    }
  });

  return flatRoutes;
};

// All routes
const authProtectedRoutes = [
  dashboardRoutes,
  eisRoutes,
  ...appRoutes,
  extrapagesRoutes,
  uiRoutes,
  ppsRoutes,
  userRoutes,
  programRoutes,
  salesRoutes,
  hrmRoutes,
  rndRoutes,
  commonRoutes,
  editorRotues,
  srsRoutes,
];
const publicRoutes = [...authRoutes, ...otherPublicRoutes];
const authProtectedFlattenRoutes = flattenRoutes([...authProtectedRoutes]);
const publicProtectedFlattenRoutes = flattenRoutes([...publicRoutes]);
const etcProtectedFlattenRoutes = flattenRoutes([...otherEtcRoutes]);
const factoryProtectedFlattenRoutes = flattenRoutes([factoryAppRoutes]);
const tabletProtectedFlattenRoutes = flattenRoutes([tabletAppRoutes]);
const srsProtectedFlattenRoutes = flattenRoutes([srsRoutes]);

export {
  publicRoutes,
  authProtectedRoutes,
  authProtectedFlattenRoutes,
  publicProtectedFlattenRoutes,
  etcProtectedFlattenRoutes,
  factoryProtectedFlattenRoutes,
  tabletProtectedFlattenRoutes,
  srsProtectedFlattenRoutes,
};
