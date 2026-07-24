import React, { memo, useState } from "react";
import { Modal, Button, FormControl, Table, Form } from "react-bootstrap";
import { BizareaListRes } from "../../redux/system/SystemUserSlice";

interface Props {
  itemList: BizareaListRes[];
  errorMsg: string;
  show: boolean;
  onClose: () => void;
  onSearch: (nmBizarea: string) => void; // 검색 실행
  onLoadMore: () => void; // 추가 데이터 요청
}

const BizareaModalPopup = memo(({ itemList, errorMsg, show, onClose, onSearch, onLoadMore }: Props) => {
  const [nmBizareaCode, setNmBizareaCode] = useState<string>("");

  // 조회 버튼 클릭
  const handleSearchClick = () => {
    onSearch(nmBizareaCode); // 검색어 전달
  };

  // Enter 키로 검색 실행
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchClick();
    }
  };

  // 무한 스크롤 핸들러
  const handleScroll = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    // 스크롤이 끝에 도달했을 때 추가 데이터를 요청
    if (scrollHeight - scrollTop === clientHeight) {
      onLoadMore();
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>사업장 조회</Modal.Title>
      </Modal.Header>
      <Modal.Body
        style={{ maxHeight: "500px", overflowY: "auto" }} // 모달 내부 높이 제한 및 스크롤 활성화
        onScroll={handleScroll} // 스크롤 이벤트 핸들러
      >
        <div className="d-flex mb-3 align-items-center">
          <div className="d-flex align-items-center me-3">
            <FormControl
              placeholder="코드"
              value={nmBizareaCode}
              onChange={(e) => setNmBizareaCode(e.target.value)}
              onKeyPress={handleKeyPress} // Enter 키 이벤트 연결
              className="me-2"
            />
            <Form.Label className="mb-0">코드</Form.Label>
          </div>
          <div className="d-flex align-items-center me-3">
            <FormControl
              placeholder="코드명"
              value={nmBizareaCode}
              onChange={(e) => setNmBizareaCode(e.target.value)}
              onKeyPress={handleKeyPress} // Enter 키 이벤트 연결
              className="me-2"
            />
            <Form.Label className="mb-0">코드명</Form.Label>
          </div>
          <Button variant="primary" onClick={handleSearchClick}>
            조회
          </Button>
        </div>
        <Table bordered hover>
          <thead>
            <tr>
              <th className="text-center">사업장명</th>
              <th className="text-center">사업장명</th>
              <th className="text-center">코드명</th>
            </tr>
          </thead>
          <tbody>
            {itemList.length > 0 ? (
              itemList.map((bizarea, idx) => (
                <tr key={idx}>
                  <td className="text-center">{bizarea.cdBizarea}</td>
                  <td className="text-center">{bizarea.nmBizarea}</td>
                  <td className="text-center">{bizarea.cdCompany}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center">
                  {errorMsg || "데이터가 없습니다."}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          닫기
        </Button>
      </Modal.Footer>
    </Modal>
  );
});

export default BizareaModalPopup;
