import React, { memo, useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import Swal from "sweetalert2";

/* Redux */
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../../../redux/store";
/*import { updateUserPassword } from "../../../../redux/system/SystemUserSlice";*/
import { Payload } from "../../../../constants/common/common";
import {updateUserPwd} from "@redux/system/SystemUserSlice";

interface PasswordChangeModalProps {
  show: boolean;
  onClose: () => void;
  userId: string | null;
  userNm: string | null;
  modId: string;
}

const PasswordChangeModal: React.FC<PasswordChangeModalProps> = memo(
  ({ show, onClose, userId, userNm, modId }) => {
    const dispatch = useDispatch<AppDispatch>();

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const { user } = useSelector((state: RootState) => ({
      user: state.Auth.user,
    }));

    /* 모달 열릴 때 입력값 초기화 */
    useEffect(() => {
      if (show) {
        setNewPassword("");
        setConfirmPassword("");
      }
    }, [show]);

    /* Alert 공통 */
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

     /*확인 버튼 */
    const onConfirmClick = () => {
      if (!userId) {
        showAlert("사용자를 선택해주세요.");
        return;
      }

      if (!newPassword || !confirmPassword) {
        showAlert("새 비밀번호를 입력해주세요.");
        return;
      }

      if (newPassword !== confirmPassword) {
        showAlert("비밀번호가 일치하지 않습니다.");
        return;
      }

      dispatch(
        updateUserPwd({
          loginId: userId,
          loginPwd: newPassword, // ✔ 이름 맞추기
          modId: user?.userId ?? "",
        })
      )
        .then((res) => {
          const payload = res.payload as Payload;
          if (payload?.status === 200) {
            showAlert("비밀번호가 변경되었습니다.");
            onClose();
          } else {
            showAlert(payload?.errorMessage || "비밀번호 변경에 실패했습니다.");
          }
        })
        .catch((err) => {
          let message = "저장에 실패했습니다.";

          if (typeof err === "object" && err !== null) {
            const anyErr = err as any;

            message =
              anyErr?.message ??
              anyErr?.response?.data?.message ??
              message;
          }
          showAlert(message);
        });
    };

    return (
      <Modal
        show={show}
        onHide={onClose}
        centered
        backdrop="static"
        size={"sm"}
      >
        <Modal.Header closeButton>
          <Modal.Title>비밀번호 변경 ({userNm})</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label>새 비밀번호</Form.Label>
            <Form.Control
              type="password"
              value={newPassword}
              placeholder="새 비밀번호 입력"
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>새 비밀번호 확인</Form.Label>
            <Form.Control
              type="password"
              value={confirmPassword}
              placeholder="새 비밀번호 확인"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button variant="primary" onClick={onConfirmClick}>
            확인
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
);

export default PasswordChangeModal;
