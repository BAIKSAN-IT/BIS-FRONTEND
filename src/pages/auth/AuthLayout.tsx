import React, { useEffect } from "react";
import { Card, Col, Container, Row } from "react-bootstrap";

/* Img */
import pankoWebGnb from "../../assets/images/logo/panko_web_gnb.png";

interface AccountLayoutProps {
  helpText?: string;
  bottomLinks?: any;
  isCombineForm?: boolean;
  children?: any;
}

const AuthLayout = ({ helpText, bottomLinks, children, isCombineForm }: AccountLayoutProps) => {
  useEffect(() => {
    if (document.body) document.body.classList.add("authentication-bg", "authentication-bg-pattern");

    return () => {
      if (document.body) document.body.classList.remove("authentication-bg", "authentication-bg-pattern");
    };
  }, []);

  return (
    <>
      <div className="account-login-pages">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={8} xl={7}>
              <Card className="bg-pattern">
                <Card.Body className="p-4">
                  <div className="text-center w-75 m-auto">
                    <div className="auth-brand">
                      <div className="logo logo-dark text-center">
                        <span className="logo-lg">
                          <img src={pankoWebGnb} alt="" height="80" />
                        </span>
                      </div>

                      <div className="logo logo-light text-center">
                        <span className="logo-lg">
                          <img src={pankoWebGnb} alt="" height="80" />
                        </span>
                      </div>
                    </div>
                    <p className="text-muted mb-4 mt-3">{helpText}</p>
                  </div>
                  {children}
                </Card.Body>
              </Card>

              {/* bottom links */}
              {bottomLinks}
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
