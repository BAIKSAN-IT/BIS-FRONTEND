import React, { memo, useEffect, useState } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { SewingQrSystemRes } from "../../redux/factory/factoryQrSystemSlice";
import QrSystemTable from "./QrSystemInfoTable";
import CameraUploadImage from "./CameraUploadImage";

const ImageSection = styled.div`
  display: flex;
  width: 100%;
  margin-bottom: 20px;
`;

const InfoArea = styled.div`
  width: 60%;
  border: 1px solid #dee2e6;
`;

// 서비스키를 환경변수로 관리 (REACT_APP_HOLIDAY_API_KEY)
const IMG_DOMAIN = process.env.REACT_APP_IMG_DOMAIN || "";

interface Props {
  sewingQrSystemInfo?: SewingQrSystemRes | null;
  onImageMetaChange: (path: string, fname: string) => void;
}

const FactoryMachineQrImgIfno = memo(({ sewingQrSystemInfo, onImageMetaChange }: Props) => {
  const { t } = useTranslation();

  const [imageSrc, setImageSrc] = useState<string>("");

  const handleImageChange = (path: string, fname: string, previewUrl: string) => {
    const fullImageUrl = previewUrl || (path && fname ? `${path}/${fname}` : "");
    setImageSrc(fullImageUrl);

    // 서버에 저장된 실제 경로는 상위로 전달 (예: DB 저장용)
    onImageMetaChange(path, fname);
  };

  const handleImageDelete = () => {
    setImageSrc("");
    onImageMetaChange("", "");
  };
  useEffect(() => {
    if (sewingQrSystemInfo?.imgPath && sewingQrSystemInfo?.imgFname) {
      const fullImageUrl = `${IMG_DOMAIN}${sewingQrSystemInfo.imgPath}${sewingQrSystemInfo.imgFname}`;
      setImageSrc(fullImageUrl);
    }
  }, [sewingQrSystemInfo]);
  const rows = [
    [
      { isTh: true, content: "Model" },
      { isTh: false, content: sewingQrSystemInfo?.model ?? "" },
      { isTh: true, content: "Serial #" },
      { isTh: false, content: sewingQrSystemInfo?.serialNo ?? "" },
    ],
    [
      { isTh: true, content: "Part" },
      { isTh: false, content: sewingQrSystemInfo?.nmAstMcode ?? "" },
      { isTh: true, content: "Machine Type" },
      { isTh: false, content: sewingQrSystemInfo?.nmAstScode1 ?? "" },
    ],
    [
      { isTh: true, content: "Transfer" },
      { isTh: false, content: sewingQrSystemInfo?.nmAstScode2 ?? "" },
      { isTh: true, content: "Head" },
      { isTh: false, content: sewingQrSystemInfo?.nmAstScode3 ?? "" },
    ],
    [
      { isTh: true, content: "Needle/Thread" },
      { isTh: false, content: sewingQrSystemInfo?.nmAstScode4 ?? "" },
      { isTh: true, content: "Brand" },
      { isTh: false, content: sewingQrSystemInfo?.nmAstScode7 ?? "" },
    ],
    [
      { isTh: true, content: "Manufacture Date" }, //제조 일자
      { isTh: false, content: sewingQrSystemInfo?.prYymm ?? "" },
      { isTh: true, content: "Purchase Date" }, // 구입 일자
      { isTh: false, content: sewingQrSystemInfo?.dtsPurchase ?? "" },
    ],
    [
      { isTh: true, content: "Company" },
      { isTh: false, content: sewingQrSystemInfo?.nmComp ?? "" },
      { isTh: true, content: "Status" },
      { isTh: false, content: sewingQrSystemInfo?.nmStatus ?? "" },
    ],
    [
      { isTh: true, content: "Rental Date" }, //렌탈 시작일자
      { isTh: false, content: sewingQrSystemInfo?.dtsRentS ?? "" },
      { isTh: true, content: "Rental Cost" }, //렌탈 가격
      { isTh: false, content: sewingQrSystemInfo?.amAmtR ?? "" },
    ],
    [
      { isTh: true, content: "User", rowSpan: 2 }, //사용
      { isTh: false, content: sewingQrSystemInfo?.nmFty ?? "" },
      { isTh: true, content: "Owner", rowSpan: 2 }, // 소유
      { isTh: false, content: sewingQrSystemInfo?.nmFty ?? "" },
    ],
    [
      { isTh: false, content: sewingQrSystemInfo?.nmSew ?? "" },
      { isTh: false, content: sewingQrSystemInfo?.cdBizarea ?? "" },
    ],
  ];

  return (
    <ImageSection>
      <CameraUploadImage
        imageSrc={imageSrc}
        onImageChange={handleImageChange}
        onImageDelete={handleImageDelete}
        sewingQrSystemInfo={sewingQrSystemInfo}
      />
      <InfoArea>
        <QrSystemTable rows={rows} />
      </InfoArea>
    </ImageSection>
  );
});

export default FactoryMachineQrImgIfno;
