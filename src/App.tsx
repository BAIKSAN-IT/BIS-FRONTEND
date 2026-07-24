import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

import AllRoutes from "./routes/Routes";

// For Default import Default.scss
import "./App.css";
import "./assets/scss/Default.scss";

import "./i18n";
// For Saas import Saas.scss
// import './assets/scss/Saas.scss';

// For Modern demo import Modern.scss
// import './assets/scss/Modern.scss';

// For Creative demo import Creative.scss
// import "./assets/scss/Creative.scss";

// For Purple demo import Purple.scss
// import './assets/scss/Purple.scss';

// For Material demo import Material.scss
// import './assets/scss/Material.scss';

// Other
import "./assets/scss/Landing.scss";
import "./assets/scss/Icons.scss";
import "./assets/scss/Style.scss";

import LoadingBar from "./components/loading/LoadingBar";

// 앱 브릿지 함수
declare const Android: {
  shutdownDevice: () => void;
  closeApp: () => void;
};

const App = () => {
  const location = useLocation();
  useEffect(() => {
    window.ui = {
      modal: {
        open: (id: string) => {
          const modal = document.getElementById(id);
          const body = document.getElementsByTagName("body")[0];

          if (modal) {
            modal.style.display = "block";
            body.classList.add("scrollLock");
          }
        },
        close: (id: string) => {
          const modal = document.getElementById(id);
          const body = document.getElementsByTagName("body")[0];

          if (modal) {
            modal.style.display = "none";
            body.classList.remove("scrollLock");
          }
        },
        toast: (message) => {
          const toast = document.createElement("div");
          toast.className = "toastPop show";
          toast.innerText = message;
          document.body.appendChild(toast);

          setTimeout(() => {
            toast.classList.remove("show");
            document.body.removeChild(toast);
          }, 1500);
        },
      },
    };

    const checkDomainAndTime = () => {
      const vietnamHour = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Ho_Chi_Minh",
        hour: "2-digit",
        hour12: false,
      });

      const urlIncludesTablet = location.pathname.includes("tablet") || location.search.includes("tablet");

      if (urlIncludesTablet && Number(vietnamHour) >= 22) {
        callCloseApp();
      }
    };

    const intervalId = setInterval(checkDomainAndTime, 60000 * 1);

    checkDomainAndTime();

    return () => clearInterval(intervalId);
  }, []);

  // 앱 종료 브릿지 함수
  const callCloseApp = () => {
    if (typeof Android !== "undefined" && Android != null) {
      Android?.closeApp();
    }
  };

  return (
    <>
      <React.Fragment>
        <LoadingBar />
        <React.Suspense fallback={null}>
          <AllRoutes />
        </React.Suspense>
      </React.Fragment>
    </>
  );
};

export default App;
