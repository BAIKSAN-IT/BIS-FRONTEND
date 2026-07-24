import { Link, useNavigate } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import React, { memo, useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";

/* redux */
import { RootState } from "../redux/store";

const TopbarSearch = memo(() => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  // Redux에서 systemProgram & language 가져오기
  const { systemProgram, language } = useSelector((state: RootState) => ({
    systemProgram: state.systemProgram.programList,
    language: state.systemProgram.language,
  }));

  // 언어별 pageName 설정
  const getPageName = (item: any) => {
    if (!item) return "Unknown";
    switch (language) {
      case "ko":
        return item.pageNameKo || "Unknown";
      case "en":
        return item.pageNameEn || item.pageNameKo || "Unknown";
      case "vi":
        return item.pageNameVn || item.pageNameKo || "Unknown";
      default:
        return item.pageNameKo || "Unknown";
    }
  };

  // 부모 메뉴 직접 찾기 (menuMap에 저장된 데이터가 잘못되었을 가능성 대비)
  const findParent = (menuId: string) => {
    return systemProgram.find((item) => item.menuId === menuId);
  };

  // Map 생성
  const menuMap = new Map<string, any>();
  systemProgram.forEach((item) => {
    menuMap.set(item.menuId, {
      key: item.menuId,
      label: getPageName(item),
      menuLevel: item.menuLevel,
      url: item.pageUrl,
      parentNo: item.parentNo,
      icon: item.menuLevel === "0" ? "mdi mdi-folder" : "",
      children: [],
    });
  });

  // 트리 구조 생성
  systemProgram.forEach((item) => {
    if (menuMap.has(item.parentNo)) {
      menuMap.get(item.parentNo).children.push(menuMap.get(item.menuId));
    }
  });

  // level99에서 시작해서 menuLevel 1 또는 2인 부모를 찾음
  const programPaths: { label: string; pageUrl: string; icon?: string }[] = [];

  systemProgram.forEach((item) => {
    if (item.menuLevel === "99" && menuMap.has(item.parentNo)) {
      let parent = menuMap.get(item.parentNo);

      // 부모가 없으면 systemProgram에서 직접 검색
      if (!parent) {
        parent = findParent(item.parentNo);
        if (parent) {
          parent.label = getPageName(parent); // 부모의 label 설정
        }
      }

      if (!parent) {
        return;
      }

      // 부모가 1,2가 아니라면 한 단계 더 올라감
      if (parent.menuLevel !== "1" && parent.menuLevel !== "2") {
        let grandParent = menuMap.get(parent.parentNo) || findParent(parent.parentNo);
        if (grandParent) {
          grandParent.label = getPageName(grandParent); // 할아버지 메뉴의 label 설정
          parent = grandParent;
        }
      }

      // 부모가 최종적으로 1 또는 2가 아니라면 제외
      if (!parent || (parent.menuLevel !== "1" && parent.menuLevel !== "2")) {
        return;
      }

      programPaths.push({
        label: `${getPageName(item)} : ${parent.label}`, // 소분류 : 중분류 형태
        pageUrl: item.pageUrl,
        icon: parent.icon || "",
      });
    }
  });

  // 검색 기능 (검색어 포함된 항목만 필터링)
  const filteredMenu = programPaths.filter((program) => program.label.toLowerCase().includes(searchTerm.toLowerCase()));

  // 검색어 입력 핸들러
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setDropdownOpen(true);
  };

  // 링크 클릭 시 페이지 이동 & 드롭다운 닫기
  const handleNavigate = (url: string) => {
    navigate(url);
    setSearchTerm("");
    setDropdownOpen(false);
  };

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <form>
        <input
          type="search"
          className="form-control rounded-pill"
          placeholder="Search..."
          id="top-search"
          onChange={handleSearch}
          value={searchTerm}
          style={{ width: "100%" }}
          autoComplete="off"
        />
        <span className="mdi mdi-magnify search-icon font-22"></span>
      </form>

      {searchTerm && dropdownOpen && (
        <Dropdown show={true} align="start">
          <Dropdown.Menu
            className="dropdown-menu"
            ref={dropdownRef}
            renderOnMount
            style={{
              width: "100%",
              maxHeight: "200px",
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            {filteredMenu.length > 0 ? (
              filteredMenu.map((item, index) => (
                <Link
                  key={index}
                  to={item.pageUrl}
                  className="dropdown-item"
                  onClick={() => handleNavigate(item.pageUrl)}
                  style={{ fontSize: "11px", padding: "1px 3px" }}
                >
                  {item.label}
                </Link>
              ))
            ) : (
              <div className="dropdown-item text-muted">검색 결과가 없습니다.</div>
            )}
          </Dropdown.Menu>
        </Dropdown>
      )}
    </>
  );
});

export default TopbarSearch;
