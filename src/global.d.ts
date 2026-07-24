declare module "feather-icons-react";
declare module "react-draft-wysiwyg";
declare module "react-sweetalert2";
declare module "google-maps-react";

interface Window {
  ui: {
    modal: {
      open: (id: string) => void;
      close: (id: string) => void;
      toast: (message: string) => void;
    };
  };
}
