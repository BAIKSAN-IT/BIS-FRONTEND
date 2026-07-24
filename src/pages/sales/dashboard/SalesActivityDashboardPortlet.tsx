import React, { useState } from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import { Card, Collapse } from "react-bootstrap";

interface Props {
  className?: string;
  children?: any;
  cardTitle?: string;
  titleClass?: string;
  headerClass?: string;
}

const SalesActivityDashboardPortlet = (props: Props) => {
  const children = props["children"] || null;
  const cardTitle = props["cardTitle"] || "Card Title";

  const [loading, setLoading] = useState<boolean>(false);

  const reloadContent = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500 + 300 * (Math.random() * 5));
  };

  return (
    <>
      <Card className={classNames(props["className"])}>
        {loading && (
          <div className="card-disabled">
            <div className="card-portlets-loader"></div>
          </div>
        )}

        <Card.Body>
          <div className="card-widgets">
            <Link to="#" onClick={reloadContent}>
              <i className="mdi mdi-refresh"></i>
            </Link>
          </div>

          <h5 className={classNames("mb-0", props["titleClass"])}>{cardTitle}</h5>

          <Collapse in={true}>
            <div>
              <div className="pt-3">{children}</div>
            </div>
          </Collapse>
        </Card.Body>
      </Card>
    </>
  );
};

export { SalesActivityDashboardPortlet };
