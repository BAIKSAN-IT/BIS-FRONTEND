import React, { useEffect, useCallback } from "react";
import { Dropdown } from "react-bootstrap";

type MaximizeScreenProps = {
  /** 풀스크린 상태가 바뀔 때 호출됨 */
  onFullscreenChange?: (isFullscreen: boolean) => void;
};

const MaximizeScreen: React.FC<MaximizeScreenProps> = ({ onFullscreenChange }) => {
  const toggleFullscreen = useCallback(() => {
    const doc: any = document;
    const el: any = document.documentElement;

    // 진입
    if (
      !doc.fullscreenElement &&
      !doc.mozFullScreenElement &&
      !doc.webkitFullscreenElement &&
      !doc.msFullscreenElement
    ) {
      document.body.classList.add("fullscreen-enable");
      (el.requestFullscreen || el.mozRequestFullScreen || el.webkitRequestFullscreen || el.msRequestFullscreen)?.call(
        el
      );
    } else {
      // 해제
      (
        doc.exitFullscreen ||
        doc.cancelFullScreen ||
        doc.mozCancelFullScreen ||
        doc.webkitCancelFullScreen ||
        doc.msExitFullscreen
      )?.call(doc);
    }
  }, []);

  useEffect(() => {
    const handler = () => {
      const doc: any = document;
      const isFs = !!(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
      );
      if (!isFs) document.body.classList.remove("fullscreen-enable");
      onFullscreenChange?.(isFs);
    };

    document.addEventListener("fullscreenchange", handler);
    document.addEventListener("webkitfullscreenchange", handler);
    document.addEventListener("mozfullscreenchange", handler);
    document.addEventListener("MSFullscreenChange", handler);

    return () => {
      document.removeEventListener("fullscreenchange", handler);
      document.removeEventListener("webkitfullscreenchange", handler);
      document.removeEventListener("mozfullscreenchange", handler);
      document.removeEventListener("MSFullscreenChange", handler);
    };
  }, [onFullscreenChange]);

  /*useEffect(() => {
    const setAppHeight = () => {
      document.documentElement.style.setProperty(
        '--app-height',
        `${window.innerHeight}px`
      );
    };

    setAppHeight();
    window.addEventListener('resize', setAppHeight);
    return () => window.removeEventListener('resize', setAppHeight);
  }, []);*/
  return (
    <Dropdown>
      <Dropdown.Toggle
        id="dropdown-languages"
        as="a"
        onClick={toggleFullscreen}
        className="nav-link waves-effect waves-light maximize-icon"
      >
        <i className="fe-maximize noti-icon font-22"></i>
      </Dropdown.Toggle>
    </Dropdown>
  );
};

export default MaximizeScreen;
