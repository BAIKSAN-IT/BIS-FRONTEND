import React, { memo, useEffect, useCallback } from "react";
import { Modal, Button } from "react-bootstrap";

interface Props {
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ModalComponent = memo(
  ({ show, title, message, onConfirm, onCancel, confirmText = "확인", cancelText = "취소" }: Props) => {
    const handleKeyDown = useCallback(
      (event: KeyboardEvent) => {
        if (!show) return;

        if (event.key === "Enter") {
          event.preventDefault();
          onConfirm();
        } else if (event.key === "Escape") {
          event.preventDefault();
          if (onCancel) {
            onCancel();
          }
        }
      },
      [show, onConfirm, onCancel]
    );

    useEffect(() => {
      if (show) {
        document.addEventListener("keydown", handleKeyDown);
      }
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [show, handleKeyDown]);

    return (
      <Modal show={show} onHide={onCancel} centered keyboard={false}>
        <Modal.Header closeButton onHide={onCancel}>
          {" "}
          {/* X 버튼도 Esc와 동일한 동작 */}
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{message}</Modal.Body>
        <Modal.Footer className="justify-content-center">
          {onCancel && (
            <Button variant="secondary" onClick={onCancel}>
              {cancelText}
            </Button>
          )}
          <Button variant="primary" onClick={onConfirm}>
            {confirmText}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
);

export default ModalComponent;
