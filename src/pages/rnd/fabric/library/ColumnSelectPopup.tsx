import React, { useMemo } from "react";
import { Modal, Form, Button } from "react-bootstrap";

interface Props {
  open: boolean;
  onClose: () => void;
  columns: { id: string; Header: string }[];
  value: string[];
  onChange: (v: string[]) => void;
}

const ColumnSelectPopup: React.FC<Props> = ({
                                              open,
                                              onClose,
                                              columns,
                                              value,
                                              onChange,
                                            }) => {
  /** 전체 컬럼 id 목록 */
  const allIds = useMemo(() => columns.map(c => c.id), [columns]);

  /** 전체 선택 여부 */
  const isAllChecked = allIds.length > 0 && allIds.every(id => value.includes(id));

  /** 개별 토글 */
  const toggle = (id: string) => {
    onChange(
      value.includes(id)
        ? value.filter(v => v !== id)
        : [...value, id]
    );
  };

  /** 전체 선택 / 전체 해제 */
  const toggleAll = () => {
    onChange(isAllChecked ? [] : allIds);
  };

  return (
    <Modal show={open} onHide={onClose} size="sm" centered>
      <Modal.Body style={{ maxHeight: 300, overflow: "auto" }}>
        {/* 전체 선택 */}
        <Form.Check
          type="checkbox"
          label="Select All"
          checked={isAllChecked}
          onChange={toggleAll}
          className="mb-2 fw-bold"
        />

        <hr style={{ margin: "6px 0 10px" }} />

        {/* 개별 컬럼 */}
        {columns.map(c => (
          <Form.Check
            key={c.id}
            type="checkbox"
            label={c.Header}
            checked={value.includes(c.id)}
            onChange={() => toggle(c.id)}
          />
        ))}
      </Modal.Body>

      <Modal.Footer>
        <Button size="sm" variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ColumnSelectPopup;
