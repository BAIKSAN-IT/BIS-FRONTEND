import React, { useEffect } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { Link } from "react-router-dom";

import pankoWebGnb from "../../../assets/images/logo/panko_web_gnb.png";

interface AccountLayoutProps {
  helpText?: string;
  children?: any;
}

// 앱 브릿지 함수
declare const Android: {
  shutdownDevice: () => void;
  closeApp: () => void;
};

const AuthLayout = ({ helpText, children }: AccountLayoutProps) => {
  useEffect(() => {
    if (document.body)
      document.body.classList.add(
        "authentication-bg",
        "authentication-bg-pattern"
      );

    return () => {
      if (document.body)
        document.body.classList.remove(
          "authentication-bg",
          "authentication-bg-pattern"
        );
    };
  }, []);

  // 앱 전원 종료 브릿지 함수
  const callShutdownDevice = () => {
    if (typeof Android !== "undefined" && Android != null) {
      Android?.shutdownDevice();
    }
  };

  // 앱 종료 브릿지 함수
  const callCloseApp = () => {
    if (typeof Android !== "undefined" && Android != null) {
      Android?.closeApp();
    }
  };

  const closeWindow = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ): void => {
    e.preventDefault();
    callCloseApp();
  };

  return (
    <>
      <div className="account-pages">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={8} xl={7}>
              <Card className="bg-pattern">
                <Card.Body className="p-4">
                  <div className="text-center w-75 m-auto">
                    <div className="auth-brand">
                      <Link
                        to="/tablet"
                        onClick={closeWindow}
                        className="logo logo-dark text-center"
                      >
                        <span className="logo-lg">
                          <img src={pankoWebGnb} alt="" height="80" />
                        </span>
                      </Link>

                      <Link
                        to="/tablet"
                        className="logo logo-light text-center"
                      >
                        <span className="logo-lg">
                          <img src={pankoWebGnb} alt="" height="80" />
                        </span>
                      </Link>
                    </div>
                    <p className="text-muted mb-4 mt-3">{helpText}</p>
                  </div>
                  {children}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      <footer className="footer footer-alt">
        04779 서울특별시 성동구 아차산로38 개풍빌딩 6,10 F <br />
        &copy; (주)팬코 Co.,Ltd All rights reserved.
      </footer>
    </>
  );
};

export default AuthLayout;
