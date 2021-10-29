import { Col, Modal, Row } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";

type ModalProps = {
  visible: boolean;
  onCancel: () => void;
  onOk: (imageId: number) => void;
  title: string;
  okText: string;
  cancelText: string;
};

const ModalAddCode: React.FC<ModalProps> = (
  props: ModalProps
) => {
  const { title, visible, okText,cancelText, onCancel, onOk } = props;
  const [selected, setSelected] = useState<number>(-1);

  const onCancelClick = useCallback(() => {
    onCancel();
  }, [onCancel]);

  const onOkClick = useCallback(() => {
    onOk(selected);
  }, [onOk, selected]);

  return (
    <Modal
      onOk={onOkClick}
      onCancel={onCancelClick}
      title={title ? title : ""}
      width={600}
      visible={visible}
      okText={okText ? okText : "Có"}
      cancelText={cancelText ? cancelText : "Không"}
    >
        <Row gutter={24}>
          <Col span={24}>
          </Col>
        </Row>
    </Modal>
  );
};

export default ModalAddCode;
