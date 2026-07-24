import React, {forwardRef, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import styled from "styled-components";

/* Image */
import knittingState1 from "@assets/images/factory/knittingState1.png";
import knittingState2 from "@assets/images/factory/knittingState2.png";
import knittingState3 from "@assets/images/factory/knittingState3.png";

/* Component */
import ImgComponent from "@components/common/ImgComponent";

/* Constants */
import {KNITTING_COLUMNS_TYPE, KnittingContainerProps} from "@constants/factory/knitting/knitting";

/* Redux */
import {AppDispatch, RootState} from "@redux/store";
import {getKnittingStatus} from "@redux/mainfactory/knitting/KnittingSlice";

/* Common */
import {HEADER_PROPS, Payload} from "@constants/common/common";

/* Utils */
import {formatDateToYYYYMMDD, isEmpty} from "@utils/CommonUtil";
import {KnttingColorByContent} from "@utils/knittingUtils";
import EisPageTitleBar from "@components/common/EisPageTitleBar";
import useInputRefs from "@utils/useInputRefs";
import Swal from "sweetalert2";
import SearchKnttingStatus from "@pages/mainfactory/knitting/status/SearchKnttingStatus";
import {Card,Row,Col} from "react-bootstrap";

const KnittingContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(65px, 1fr));
  grid-auto-rows: auto;
  gap: 5px;
  height: 100%;
  padding: 3px;
  margin: 0;
  box-sizing: border-box;
  position: relative;
`;

const KnittingItem = styled.div<KnittingContainerProps>`
  border: ${(props) => `2px solid ${KnttingColorByContent(props.flag)}`};
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  min-height: 110px;
  max-height: 110px;
  overflow: hidden;

  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.1);

  transition: transform 0.2s ease-in-out, max-height 0.2s ease-in-out;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2), 0 12px 40px rgba(0, 0, 0, 0.2);
    max-height: 100%;
    overflow: visible;
    font-weight: bold;
  }

  .item-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 5px;

    .item-number {
      font-size: 10px;
      font-weight: bold;
      margin-bottom: 3px;
      color: ${(props) => KnttingColorByContent(props.flag)};
    }

    .item-icon img {
      max-width: 35px;
    }
  }

  .item-text {
    font-size: 10px;
    color: red;
    font-weight: bold;
  }

  .item-content {
    font-size: 10px;
    color: black;
    text-align: center;
    white-space: normal;
    word-wrap: break-word;
    word-break: break-word;
    overflow-wrap: break-word;
    height: auto;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

const KnittingStatus = forwardRef((props: HEADER_PROPS, ref) => {
  const showAlert = (message: string) => {
    Swal.fire({
      text: message,
      confirmButtonText: "OK",
      customClass: {
        popup: "small-swal-popup",
        confirmButton: "small-swal-button",
      },
    });
  };
  const dispatch = useDispatch<AppDispatch>();

  const {refs, getValues} = useInputRefs(["dtsWk"]);

  const {userEnvInfo} = useSelector((state: RootState) => ({
    userEnvInfo: state.Tablet.userEnvInfo,
  }));

  const [knittingList, setKnittingList] = useState<KNITTING_COLUMNS_TYPE[]>([]);

  // 조회버튼 클릭 이벤트
  const handleSearch = () => {

    if (!userEnvInfo.cdBizarea) {
      showAlert("법인을 선택해 주세요.");
      return;
    }

    const {dtsWk} = getValues();
    const targetDate = dtsWk
      ? formatDateToYYYYMMDD(new Date(dtsWk))
      : formatDateToYYYYMMDD(new Date());

    let params = {
      cdCompany: userEnvInfo.cdCompany || "",
      cdBizarea: userEnvInfo.cdBizarea || "",
      cdFty: userEnvInfo.cdFty || "",
      dtsWk: targetDate,
      excel: '',
      currentPage: '0',
      limitPage: '10000',
    };

    dispatch(getKnittingStatus(params)).then((res) => {
      const payload = res.payload as Payload;

      if (payload.status === 200 && !isEmpty(payload.data)) {
        setKnittingList(payload.data);
      } else {
        setKnittingList([]);
      }
    });
  };
  /** 최초 진입 + 공장 변경 시 */
  useEffect(() => {
    if (userEnvInfo.cdBizarea) {
      handleSearch();
    }
  }, [userEnvInfo.cdBizarea]);
  return (
    <>
      <EisPageTitleBar
        pageNm="Factory"
        pageUrl="/knitstatus"
        onSearchButtonClick={handleSearch}
        breadCrumbItems={[
          {label: "Knitting Status", path: "/knitstatus", active: true},
        ]}
      />

      <SearchKnttingStatus
        refs={refs}
        onSearchButtonClick={handleSearch}
        knittingList={knittingList}
      />
      <Card className="mt-n3">
        <Card.Body style={{minHeight: "calc(79vh - 45px)"}}>
          <Row className="align-items-stretch d-flex flex-wrap mt-n3">
            <Col xs={12} className="d-flex flex-column">
              <div className="card grid flex-grow-1 card-gray-border">
                <div className="eis-table-container" style={{height: 'calc(-100px + 83vh)', overflow: 'auto'}}>
                  <KnittingContainer>
                    {knittingList.map((item, idx) => (
                      <KnittingItem className="grid-item" key={idx} flag={item.nmKntmacNm.split("-")[0]}>
                        <div className="item-header">
                          <div className="item-number">{item.nmKntmacNm}</div>
                          <div className="item-icon">
                            <ImgComponent
                              src={
                                item.deviceOperatingStatus === "0" || item.deviceOperatingStatus === "2"
                                  ? knittingState3
                                  : item.status === "1"
                                    ? knittingState1
                                    : knittingState2
                              }
                              alt={"status"}
                            />
                          </div>
                        </div>
                        <div className="item-text">{item.ttQtFprid}</div>
                        <div className="item-content">{item.idStyle}</div>
                      </KnittingItem>
                    ))}
                  </KnittingContainer>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </>
  );
});

export default KnittingStatus;
