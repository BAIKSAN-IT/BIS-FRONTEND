import React, {memo} from "react";
import {Col, Row} from "react-bootstrap";

/* Redux */
import {
  SaveRndArticleCompositionReq,
  SaveRndArticleFileReq,
  SaveRndArticleProcessReq,
  SaveRndArticleReq,
  SaveRndArticleStyleReq,
  SaveRndArticleYarnReq,
} from "@redux/rnd/RndSlice";

/* Component */
import FabricLibraryRegisterCompositionInfo from "./FabricLibraryRegisterCompositionInfo";
import FabricLibraryRegisterBasicInfo from "./FabricLibraryRegisterBasicInfo";
import FabricLibraryRegisterProcessInfo from "./FabricLibraryRegisterProcessInfo";
import FabricLibraryRegisterRemarkInfo from "./FabricLibraryRegisterRemarkInfo";
import FabricLibraryRegisterYarnInfo from "./FabricLibraryRegisterYarnInfo";
import FabricLibraryRegisterKnttingInfo from "./FabricLibraryRegisterKnttingInfo";
import FabricLibraryRegisterPriceInfo from "./FabricLibraryRegisterPriceInfo";
import FabricLibraryRegisterFileInfo from "./FabricLibraryRegisterFileInfo";
import FabricLibraryRegisterGarmentInfo from "./FabricLibraryRegisterGarmentInfo";
import FabricLibraryRegisterStyleErpInfo from "./FabricLibraryRegisteStyleInfo";

interface Props {
  articleList: SaveRndArticleReq[];
  setArticleList: React.Dispatch<React.SetStateAction<SaveRndArticleReq[]>>;
  yarnList: SaveRndArticleYarnReq[];
  setYarnList: React.Dispatch<React.SetStateAction<SaveRndArticleYarnReq[]>>;
  processList: SaveRndArticleProcessReq[];
  setProcessList: React.Dispatch<React.SetStateAction<SaveRndArticleProcessReq[]>>;
  compositionList: SaveRndArticleCompositionReq[];
  setCompositionList: React.Dispatch<React.SetStateAction<SaveRndArticleCompositionReq[]>>;
  fileList: SaveRndArticleFileReq[];
  setFileList: React.Dispatch<React.SetStateAction<SaveRndArticleFileReq[]>>;
  styleList: SaveRndArticleStyleReq[];
  setStyleList: React.Dispatch<React.SetStateAction<SaveRndArticleStyleReq[]>>;
  onFileUpload?: (files: File[]) => void; // 선택된 파일을 "대기 큐"에 추가
  onFileRemove?: (fileName: string) => void; // 대기 큐 / UI 목록에서 제거
  onFileDownload?: (fileName: string) => void; // 다운로드 트리거(선택)
}

const FabricLibraryRegister = memo(
  ({
     articleList,
     setArticleList,
     yarnList,
     setYarnList,
     processList,
     setProcessList,
     compositionList,
     setCompositionList,
     fileList,
     setFileList,
     styleList,
     setStyleList,
     onFileUpload,
     onFileRemove,
     onFileDownload,
   }: Props) => {
    return (
      <>
        <div className="container-fluid p-0">
          <>
            <Row className={"mb-0"}>
              <Col xs={12} sm={12} md={3} lg={3}>
                {/* Composition */}
                <FabricLibraryRegisterCompositionInfo
                  articleList={articleList}
                  setArticleList={setArticleList}
                  compositionList={compositionList}
                  setCompositionList={setCompositionList}
                  yarnList={yarnList}
                  setYarnList={setYarnList}
                  processList={processList}
                  setProcessList={setProcessList}
                  fileList={fileList}
                  setFileList={setFileList}
                  styleList={styleList}
                  setStyleList={setStyleList}
                />
              </Col>
              <Col xs={12} sm={12} md={9} lg={9} className={"gx-0"}>
                {/* Basic Information */}
                <FabricLibraryRegisterBasicInfo
                  articleList={articleList}
                  setArticleList={setArticleList}
                  yarnList={yarnList}
                  setYarnList={setYarnList}
                  processList={processList}
                  setProcessList={setProcessList}
                />
                <div className="d-flex gap-2">
                  {/* Knitting */}
                  <FabricLibraryRegisterKnttingInfo articleList={articleList} setArticleList={setArticleList}/>
                  {/* Price */}
                  <FabricLibraryRegisterPriceInfo articleList={articleList} setArticleList={setArticleList}/>
                </div>
              </Col>
            </Row>
            <Row className={"mt-n3"}>
              <Col xs={12} sm={12} md={6} lg={6}>
                <div className="d-flex gap-2">
                  {/* Garment Erp */}
                  <FabricLibraryRegisterGarmentInfo styleList={styleList} setStyleList={setStyleList}/>
                  {/* Style Erp 및 Keep Qty */}
                  <FabricLibraryRegisterStyleErpInfo articleList={articleList} setArticleList={setArticleList}/>
                </div>
              </Col>
              <Col xs={12} sm={12} md={6} lg={6} className={"gx-0"}>
                <div className="d-flex gap-2">
                  {/* Process Information */}
                  <FabricLibraryRegisterProcessInfo processList={processList} setProcessList={setProcessList}/>
                  {/* Yarn Information */}
                  <FabricLibraryRegisterYarnInfo yarnList={yarnList} setYarnList={setYarnList}/>
                </div>
              </Col>
            </Row>
            {/* File Information*/}
            <Row>
              <Col xs={12} sm={12} md={6} lg={6}>
                {/* Remark */}
                <FabricLibraryRegisterRemarkInfo articleList={articleList} setArticleList={setArticleList}/>
              </Col>
              <Col xs={12} sm={12} md={6} lg={6} className={"gx-0"}>
                <FabricLibraryRegisterFileInfo
                  articleList={articleList}
                  fileList={fileList}
                  setFileList={setFileList}
                  onFileUpload={onFileUpload}
                  onFileRemove={onFileRemove}
                  onFileDownload={onFileDownload}
                />
              </Col>
            </Row>
          </>
        </div>
      </>
    );
  }
);
export default FabricLibraryRegister;
