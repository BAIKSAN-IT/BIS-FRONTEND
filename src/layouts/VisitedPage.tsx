import React, {useEffect, useRef, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "@redux/store";
import {removeAllVisitedPages, removeVisitedPage} from "@redux/common/visitedPagesSlice";
import ButtonComponent from "@components/common/ButtonComponent";

const VisitedPages: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const visitedPages = useSelector((state: RootState) => state.VisitedPages.pages);
  const scrollRef = useRef<HTMLDivElement>(null);

  // < > 버튼 표시 여부
  const [showArrows, setShowArrows] = useState(false);

  // 컨테이너 가로 크기(px)
  const [containerWidth, setContainerWidth] = useState<number>(500);

  // 스크롤 가능 여부 확인
  const checkScroll = () => {
    if (scrollRef.current) {
      setShowArrows(scrollRef.current.scrollWidth > scrollRef.current.clientWidth);
    }
  };

  // 윈도우 크기에 따라 containerWidth 조절
  useEffect(() => {
    const updateWidth = () => {
      const w = window.innerWidth;
      if (w < 1200) {
        setContainerWidth(450);
      } else if (w < 1300) {
        setContainerWidth(550);
      } else if (w < 1600) {
        setContainerWidth(700);
      } else if (w < 1800) {
        setContainerWidth(900);
      } else if (w < 2000) {
        setContainerWidth(1050);
      } else if (w < 2200) {
        setContainerWidth(1300);
      } else if (w < 2450) {
        setContainerWidth(1500);
      } else {
        setContainerWidth(1700);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // 방문 페이지 추가/삭제될 때, 혹은 리사이즈 시 스크롤 여부 다시 확인
  useEffect(() => {
    checkScroll();

    const observer = new MutationObserver(checkScroll);
    if (scrollRef.current) {
      observer.observe(scrollRef.current, {childList: true, subtree: true});
    }
    window.addEventListener("resize", checkScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", checkScroll);
    };
  }, [visitedPages]);

  // 왼쪽으로 스크롤
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft -= 120;
    }
  };

  // 오른쪽으로 스크롤
  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += 120;
    }
  };

  return (
    <div
      className="nav-link waves-effect waves-light"
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        width: `${containerWidth}px`,
        overflow: "hidden",
        marginLeft: "-25px",
      }}
    >
      <ButtonComponent
        type="button"
        className=""
        iClassName="mdi mdi-close-circle-outline"
        txt=""
        onClick={() => {
          dispatch(removeAllVisitedPages());
          navigate("/");
        }}
        style={{
          background: "transparent",
          border: "none",
          /*color: "white",*/
          color: "#ddd",
          cursor: "pointer",
          fontSize: "21px",
        }}
      />
      {/* 왼쪽 이동 버튼 */}
      {showArrows && (
        <ButtonComponent
          type="button"
          className=""
          txt="◀"
          style={{
            background: "transparent",
            border: "none",
            color: "#999",
            cursor: "pointer",
            fontSize: "18px",
          }}
          onClick={scrollLeft}
        />
      )}

      {/* 방문한 페이지 목록 */}
      <div
        ref={scrollRef}
        style={{
          display: "flex",
          alignItems: "center",
          overflowX: "auto",
          whiteSpace: "nowrap",
          scrollbarWidth: "none", // Firefox
        }}
      >
        {visitedPages.map((page, index) => (
          <div
            key={`${page.path}-${index}`}
            style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              padding: "3px",
            }}
          >
            <ButtonComponent
              type="button"
              className=""
              iClassName="mdi mdi-close"
              txt=""
              onClick={() => {
                const currentIndex = visitedPages.findIndex((p) => p.path === page.path);

                // 새 배열에서 현재 탭을 제외한 상태
                const newPages = visitedPages.filter((p) => p.path !== page.path);

                dispatch(removeVisitedPage(page.path));

                // 탭이 0개가 되면 루트로 이동
                if (newPages.length === 0) {
                  navigate("/");
                  return;
                }

                // 이동할 탭: 왼쪽 탭 → 없으면 오른쪽 탭
                const nextPage = newPages[currentIndex - 1] || newPages[currentIndex] || null;

                if (nextPage) {
                  navigate(nextPage.path);
                }
              }}
              style={{
                background: "transparent",
                border: "none",
                fontSize: "15px",
                color: "#999",
                cursor: "pointer",
                padding: "1px",
              }}
            />
            <Link
              className="nav-link waves-effect waves-light"
              to={page.path}
              style={{
                textDecoration: "none",
                fontWeight: "normal",
                padding: "3px",
                fontSize: "15px",
              }}
            >
              {page.label}
            </Link>
          </div>
        ))}
      </div>

      {/* 오른쪽 이동 버튼 */}
      {showArrows && (
        <ButtonComponent
          type="button"
          className=""
          txt="▶"
          style={{
            background: "transparent",
            border: "none",
            color: "#999",
            cursor: "pointer",
            fontSize: "18px",
          }}
          onClick={scrollRight}
        />
      )}
    </div>
  );
};

export default VisitedPages;
