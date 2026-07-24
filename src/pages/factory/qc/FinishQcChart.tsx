import React, { useImperativeHandle, forwardRef, useEffect, useState } from "react";
import { AppDispatch, RootState } from "../../../redux/store";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { createGlobalStyle } from "styled-components";
import { Card, Col, Row } from "react-bootstrap";
import { HEADER_PROPS } from "../../../constants/common/common";
import { DEFECTS_COLUMNS_TYPE, QC_COLUMNS_TYPE } from "../../../constants/factory/qc/qc";
import { formatDateToYYYYMMDD, isEmpty } from "../../../utils/CommonUtil";
import BarChartFactoryQcDetail from "./chart/BarChartFactoryQcDetail";
import PieChartFactoryQcDetail from "./chart/PieChartFactoryQcDetail";
import { getQcActualChart } from "../../../redux/factory/factoryQcSlice";
import { Payload } from "../../../constants/common/common";

// Global Style
const GlobalStyle = createGlobalStyle`
  html,
  body {
    height: 100%;
    background-color: white;
    overflow-y: auto;
  }
`;

const FinishQcChart = forwardRef((props: HEADER_PROPS, ref) => {
	const { t } = useTranslation();
	const dispatch = useDispatch<AppDispatch>();

	useImperativeHandle(ref, () => ({
		handleSearch,
	}));

	const { line, userEnvInfo } = useSelector((state: RootState) => ({
		line: state.Tablet.line,
		userEnvInfo: state.Tablet.userEnvInfo,
	}));

	const [defectList, setDefectList] = useState<DEFECTS_COLUMNS_TYPE[]>([]);
	const [topDefectList, setTopDefectList] = useState<DEFECTS_COLUMNS_TYPE[]>([]);

	useEffect(() => {
		const params = {
			titleName: "QC DEFECT STATUS",
			lnInfo: { isShow: false },
			type: "qcChart",
		};

		setHeaderLayoutInfo(params);
	}, [line]);

	// 데이터를 부모로 보내기
	const setHeaderLayoutInfo = (data: any) => {
		if (props?.sendDataToParent) {
			props.sendDataToParent(data);
		}
	};

	// 조회버튼 클릭 이벤트
	const handleSearch = (val: any) => {
		let params = {
			cdCompany: userEnvInfo.cdCompany || "",
			cdBizarea: userEnvInfo.cdBizarea || "",
			cdFty: userEnvInfo.cdFty || "",
			dtsWk: formatDateToYYYYMMDD(val.selectedDate),
			isEndLine: val.isEndLine,
		};

		dispatch(getQcActualChart(params)).then((res) => {
			const payload = res.payload as Payload;

			if (payload.status === 200) {
				if (!isEmpty(payload.data)) {
					if (!isEmpty(payload.data[0])) {
						setDefectList(payload.data[0]);
					}
					if (!isEmpty(payload.data[1])) {
						setTopDefectList(payload.data[1]);
					}

					setHeaderLayoutInfo({ firstLoading: false });
				}
			} else {
				if (payload.errorCode === "100") {
					setHeaderLayoutInfo({ firstLoading: false });
				}
			}
		});
	};

	return (
		<>
			<GlobalStyle />

			<Card style={{ marginTop: "2px" }}>
				<Row>
					<Col xl={8}>
						<BarChartFactoryQcDetail defectList={defectList} />
					</Col>
					<Col xl={4}>
						<PieChartFactoryQcDetail topDefectList={topDefectList} />
					</Col>
				</Row>
			</Card>
		</>
	);
});

export default FinishQcChart;
