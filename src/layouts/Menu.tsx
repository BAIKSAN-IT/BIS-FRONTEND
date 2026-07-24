import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Collapse } from "react-bootstrap";
import classNames from "classnames";
import FeatherIcon from "feather-icons-react";

//helpers
import { findAllParent, findMenuItem } from "../helpers/menu";

// constants
import { MenuItemTypes } from "../constants/menu";

interface SubMenus {
  item: MenuItemTypes;
  linkClassName?: string;
  subMenuClassNames?: string;
  activeMenuItems?: Array<string>;
  toggleMenu?: (item: any, status: boolean) => void;
  className?: string;
}

const MenuItemWithChildren = ({ item, linkClassName, subMenuClassNames, activeMenuItems, toggleMenu }: SubMenus) => {
  const [open, setOpen] = useState<boolean>(activeMenuItems!.includes(item.key));
  useEffect(() => {
    setOpen(activeMenuItems!.includes(item.key));
  }, [activeMenuItems, item]);

  const toggleMenuItem = () => {
    const status = !open;
    setOpen(status);
    if (toggleMenu) toggleMenu(item, status);
    return false;
  };

  return (
    <li className={classNames("menu-item", { "menuitem-active": open })}>
      <Link
        to="#"
        onClick={toggleMenuItem}
        data-menu-key={item.key}
        aria-expanded={open}
        className={classNames("menu-link", linkClassName, {
          "menuitem-active": activeMenuItems!.includes(item.key) ? "active" : "",
        })}
      >
        {item.icon && (
          <span className="menu-icon">
            <FeatherIcon icon={item.icon} />{" "}
          </span>
        )}
        <span className="menu-text"> {item.label} </span>
        {!item.badge && item.level !== "99" ? (
          <span className="menu-arrow"></span>
        ) : (
          <span className={`badge bg-${item?.badge?.variant} rounded-pill ms-auto`}>{item?.badge?.text}</span>
        )}
      </Link>
      <Collapse in={open}>
        <div>
          <ul className={classNames(subMenuClassNames)}>
            {(item.children || []).map((child, i) => {
              return (
                <React.Fragment key={i}>
                  {child.children ? (
                    <>
                      {/* parent */}
                      <MenuItemWithChildren
                        item={child}
                        linkClassName={activeMenuItems!.includes(child.key) ? "active" : ""}
                        activeMenuItems={activeMenuItems}
                        subMenuClassNames="sub-menu"
                        toggleMenu={toggleMenu}
                      />
                    </>
                  ) : (
                    <>
                      {/* child */}
                      <MenuItem
                        item={child}
                        className={activeMenuItems!.includes(child.key) ? "menuitem-active" : ""}
                        linkClassName={activeMenuItems!.includes(child.key) ? "active" : ""}
                      />
                    </>
                  )}
                </React.Fragment>
              );
            })}
          </ul>
        </div>
      </Collapse>
    </li>
  );
};

const MenuItem = ({ item, className, linkClassName }: SubMenus) => {
  return (
    <li className={classNames("menu-item", className)}>
      <MenuItemLink item={item} className={linkClassName} />
    </li>
  );
};

const MenuItemLink = ({ item, className }: SubMenus) => {
  return (
    <Link
      to={item.url!}
      target={item.target}
      className={classNames("side-nav-link-ref menu-link", className)}
      data-menu-key={item.key}
    >
      {item.icon && (
        <span className="menu-icon">
          <FeatherIcon icon={item.icon} />{" "}
        </span>
      )}
      <span className="menu-text"> {item.label} </span>
      {item.badge && <span className={`badge bg-${item.badge.variant} `}>{item.badge.text}</span>}
    </Link>
  );
};

/**
 * Renders the application menu
 */
interface AppMenuProps {
  menuItems: MenuItemTypes[];
}

const AppMenu = ({ menuItems }: AppMenuProps) => {
  let location = useLocation();
  const menuRef: any = useRef(null);
  const [activeMenuItems, setActiveMenuItems] = useState<string[]>([]);

  const toggleMenu = (menuItem: MenuItemTypes, show: boolean) => {
    setActiveMenuItems((prev) => {
      if (show) {
        // 현재 부모만 활성화 시킨다 .
        const parents = findAllParent(menuItems, menuItem);
        return [menuItem.key, ...parents];
      } else {
        // 현재 메뉴를 비활성화 시킨다 .
        return prev.filter((key) => key !== menuItem.key);
      }
    });
  };

  const activeMenu = useCallback(() => {
    const div = document.getElementById("main-side-menu");
    if (div) {
      const items = div.getElementsByClassName("side-nav-link-ref");
      let matchingMenuItem: Element | null = null;

      for (let i = 0; i < items.length; i++) {
        const item = items[i] as HTMLAnchorElement;
        if (item.pathname === location.pathname) {
          matchingMenuItem = item;
          break;
        }
      }

      if (matchingMenuItem) {
        const mid = matchingMenuItem.getAttribute("data-menu-key");
        if (mid) {
          const activeItem = findMenuItem(menuItems, mid);
          if (activeItem) {
            const parents = findAllParent(menuItems, activeItem);
            setActiveMenuItems([activeItem.key, ...parents]);
          }
        }
      } else {
        setActiveMenuItems([]);
      }
    }
  }, [location.pathname, menuItems]);

  useEffect(() => {
    activeMenu();
  }, [location.pathname, menuItems]);

  return (
    <ul className="menu" ref={menuRef} id="main-side-menu">
      {menuItems.map((item, idx) => (
        <React.Fragment key={idx}>
          {item.level === "0" && item.isTitle && <li className="menu-title">{item.label}</li>}

          {item.children?.map((child) => (
            <MenuItemWithChildren
              key={child.key}
              item={child}
              toggleMenu={toggleMenu}
              subMenuClassNames="sub-menu"
              activeMenuItems={activeMenuItems}
              linkClassName="menu-link"
            />
          ))}
        </React.Fragment>
      ))}
    </ul>
  );
};

export default AppMenu;
