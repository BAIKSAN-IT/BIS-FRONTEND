/* Image */
import cutting from "../assets/images/tablet/cutting_btn.png";
import sewing from "../assets/images/tablet/sewing_btn.png";
import iron from "../assets/images/tablet/iron_btn.png";
import folding from "../assets/images/tablet/folding_btn.png";
import qc from "../assets/images/tablet/qc_btn.png";
import packing from "../assets/images/tablet/packing_btn.png";
import knittingState from "../assets/images/tablet/knitting_btn.png";
import qrSystem from "../assets/images/factory/qrSystem.png";

export interface SubMenuType {
  menuCode: string;
  subMenuName: string;
  path: string;
  img: string;
  backColor: string;
}

export interface FactoryMenuType {
  bgColor: string;
  menuCode: string;
  menuName: string;
  imageSrc: string;
  subMenus: SubMenuType[];
}

export const factoryMenuType: FactoryMenuType[] = [
  {
    bgColor: "darkseagreen",
    menuCode: "020101",
    menuName: "CUTTING",
    imageSrc: cutting,
    subMenus: [
      {
        menuCode: "020101",
        subMenuName: "STOCK QTY",
        path: "/factory/cutting/stock",
        img: cutting,
        backColor: "darkseagreen",
      },
      {
        menuCode: "020102",
        subMenuName: "ACTUAL QTY",
        path: "/factory/cutting/actual/style",
        img: cutting,
        backColor: "peru",
      },
    ],
  },
  {
    bgColor: "coral",
    menuCode: "020102",
    menuName: "SEWING INPUT",
    imageSrc: sewing,
    subMenus: [
      {
        backColor: "coral",
        menuCode: "020201",
        subMenuName: "INPUT QTY",
        img: sewing,
        path: "/factory/sewing/input",
      },
      {
        backColor: "mediumseagreen",
        menuCode: "020201",
        subMenuName: "INPUT LINE QTY",
        img: sewing,
        path: "/factory/sewing/inputline?processGbn=0005",
      },
    ],
  },
  {
    bgColor: "goldenrod",
    menuCode: "020102",
    menuName: "SEWING ACTUAL",
    imageSrc: sewing,
    subMenus: [
      {
        backColor: "goldenrod",
        menuCode: "020202",
        subMenuName: "ACTUAL QTY",
        img: sewing,
        path: "/factory/lineSelection?next=/factory/sewing/actual&processGbn=0005",
      },
      {
        backColor: "darkseagreen",
        menuCode: "020203",
        subMenuName: "LINE ACTUAL",
        img: sewing,
        path: "/factory/sewing/total/actual?processGbn=0005",
      },
      {
        backColor: "lightsteelblue",
        menuCode: "020204",
        subMenuName: "HPS POP-UP",
        img: sewing,
        path: "/factory/sewing/hps/list?processGbn=0005",
      },
      {
        backColor: "lightpink",
        menuCode: "020205",
        subMenuName: "HPS POP-UP SHOPFLOOR",
        img: sewing,
        path: "/factory/sewing/hps/shopFloor?processGbn=0005",
      },
    ],
  },
  {
    bgColor: "slateblue",
    menuCode: "020301",
    menuName: "IRON",
    imageSrc: iron,
    subMenus: [
      {
        backColor: "slateblue",
        menuCode: "020301",
        subMenuName: "IRON ACTUAL",
        img: iron,
        path: "/factory/lineSelection?next=/factory/iron/actual&processGbn=0006&selectLine=1",
      },
    ],
  },
  {
    bgColor: "peru",
    menuCode: "020401",
    menuName: "FOLDING",
    imageSrc: folding,
    subMenus: [
      {
        backColor: "peru",
        menuCode: "020401",
        subMenuName: "LINE ACTUAL LINE",
        img: folding,
        path: "/factory/folding/actual",
      },
    ],
  },
  {
    bgColor: "lightsteelblue",
    menuCode: "020102",
    menuName: "QC",
    imageSrc: qc,
    subMenus: [
      {
        backColor: "lightsteelblue",
        menuCode: "020501",
        subMenuName: "QC STATUS",
        img: qc,
        path: "/factory/finish/qc",
      },
      {
        backColor: "goldenrod",
        menuCode: "020501",
        subMenuName: "FINISH QC QTY",
        img: qc,
        path: "/factory/finish/qc/finishqcline?processGbn=0007",
      },
    ],
  },
  {
    bgColor: "burlywood",
    menuCode: "020401",
    menuName: "NEEDLE / HANGTAG",
    imageSrc: folding,
    subMenus: [
      {
        backColor: "burlywood",
        menuCode: "020401",
        subMenuName: "NEEDLE / HANGTAG QTY",
        img: folding,
        path: "/factory/needle/actual",
      },
    ],
  },
  {
    bgColor: "lightpink",
    menuCode: "020401",
    menuName: "PACKING ACTUAL",
    imageSrc: packing,
    subMenus: [
      {
        backColor: "lightpink",
        menuCode: "020601",
        subMenuName: "PACKING ACTUAL QTY",
        img: packing,
        path: "/factory/packing/actual",
      },
    ],
  },
  {
    bgColor: "lightpink",
    menuCode: "020401",
    menuName: "QR SYSTEM",
    imageSrc: qrSystem,
    subMenus: [
      {
        backColor: "lightpink",
        menuCode: "020101",
        subMenuName: "MACHINE MANAGEMENT",
        img: qrSystem,
        path: "/factory/machine/sewing/management",
      },
      {
        backColor: "lightpink",
        menuCode: "020102",
        subMenuName: "SEWING MACHINE",
        img: qrSystem,
        path: "/factory/machine/sewing/machine",
      },
    ],
  },
  {
    bgColor: "mediumorchid",
    menuCode: "020401",
    menuName: "KNITTING STATUS",
    imageSrc: knittingState,
    subMenus: [
      {
        backColor: "mediumorchid",
        menuCode: "020701",
        subMenuName: "KNITTING STATUS",
        img: knittingState,
        path: "/factory/knitting/list",
      },
      {
        backColor: "mediumorchid",
        menuCode: "020702",
        subMenuName: "KNITTING MACHINE",
        img: knittingState,
        path: "/factory/knitting/machine",
      },
    ],
  },
];
export const BIZAREA_CODE = [
  {code: "1000", label: "팬코본사"},
  {code: "3000", label: "VINA"},
  {code: "5000", label: "TAMTHANG"},
  {code: "7000", label: "BAGO"},
];

export const FACTORY_CODE = [
  {code: "3100", label: "FACTORY1"},
  {code: "3200", label: "FACTORY2"},
  {code: "3300", label: "FACTORY3"},
  {code: "3400", label: "FACTORY4"},
  {code: "3500", label: "FACTORY5"},
  {code: "5100", label: "FACTORY1"},
  {code: "5200", label: "FACTORY2"},
  {code: "5300", label: "FACTORY3"},
  {code: "5400", label: "FACTORY4"},
  {code: "5500", label: "FACTORY5"},
  {code: "5600", label: "FACTORY6"},
  {code: "5700", label: "FACTORY7"},
  {code: "5800", label: "FACTORY8"},
  {code: "5900", label: "FACTORY9"},
  {code: "5A00", label: "FACTORY10"},
  {code: "7100", label: "FACTORY1"},
  {code: "7200", label: "FACTORY2"},
];
