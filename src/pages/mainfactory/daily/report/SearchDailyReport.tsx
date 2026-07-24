import React, {memo} from "react";
import {Card, Col, FormControl, Row} from "react-bootstrap";
import {useLocation} from "react-router-dom";
import {useSelector} from "react-redux";

/* redux*/
import {RootState} from "@redux/store";

/* utils */
import {DateUtils} from "@utils/dateUtils";
import ButtonComponent from "@components/common/ButtonComponent";
import ArrowButton from "@components/common/ArrowButton";

interface Props {
  onSearchButtonClick: () => void;
  searchParams: {
    cdCompany?: string;
    yyyymmdd?: string;
  };
  setSearchParams: React.Dispatch<
    React.SetStateAction<{
      cdCompany?: string;
      yyyymmdd?: string;
    }>
  >;
  setIsDateButtonClick?: React.Dispatch<React.SetStateAction<boolean>>;
}

/** YYYYMMDD -> YYYY-MM-DD */
const toDash = (yyyymmdd?: string) => {
  if (!yyyymmdd || yyyymmdd.length !== 8) return "";
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
};

/** YYYY-MM-DD 기준으로 days 만큼 더한 뒤 YYYY-MM-DD 반환 */
const addDaysDash = (yyyyDash: string, days: number) => {
  const [y, m, d] = yyyyDash.split("-").map((v) => Number(v));

  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);

  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");

  return `${yy}-${mm}-${dd}`;
};

/** YYYY-MM-DD -> YYYYMMDD */
const toCompact = (yyyyDash: string) => yyyyDash.replace(/-/g, "");

const SearchDailyReport: React.FC<Props> = ({
                                              onSearchButtonClick,
                                              searchParams,
                                              setSearchParams,
                                              setIsDateButtonClick,
                                            }) => {

  const location = useLocation();

  const systemProgram = useSelector(
    (state: RootState) => state.systemProgram.programList
  );

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      systemProgram.find(
        (program) =>
          program.find === "1" &&
          program.pageUrl === location.pathname
      )
    ) {
      if (e.key === "Enter") {
        onSearchButtonClick();
      }
    }
  };

  const currentDash =
    toDash(searchParams?.yyyymmdd) || DateUtils.today;

  const onPrevDay = () => {
    const newDash = addDaysDash(currentDash, -1);

    setSearchParams((prev) => ({
      ...prev,
      yyyymmdd: toCompact(newDash),
    }));

    if (setIsDateButtonClick) {
      setIsDateButtonClick(true);
    }
  };

  const onNextDay = () => {
    const newDash = addDaysDash(currentDash, 1);

    setSearchParams((prev) => ({
      ...prev,
      yyyymmdd: toCompact(newDash),
    }));

    if (setIsDateButtonClick) {
      setIsDateButtonClick(true);
    }
  };

  return (
    <Card className="form-grid mt-n2" style={{height: 50}}>
      <Card.Body>
        <Row>
          <Col md={3} className={'mt-n2'}>
            <div className="fg-row">
              <label className="fg-label">DATE</label>

              <div className="d-flex align-items-center">

                <FormControl
                  type="date"
                  name="yyyymmdd"
                  className="form-control text-center fg-control"
                  onKeyPress={handleKeyPress}
                  value={currentDash}
                  onChange={(e) =>
                    setSearchParams((prev) => ({
                      ...prev,
                      yyyymmdd: toCompact(e.target.value),
                    }))
                  }
                />

                {/* prev/next 버튼을 세로로 두고 크기만 15px로 고정 */}
                <div className="d-flex flex-column">
                  <ArrowButton
                    direction="up"
                    onClick={onPrevDay}
                    arrowWidth={16}
                    arrowHeight={16}
                  />

                  <ArrowButton
                    direction="down"
                    onClick={onNextDay}
                    arrowWidth={16}
                    arrowHeight={16}
                  />

                </div>

              </div>

            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default memo(SearchDailyReport);
