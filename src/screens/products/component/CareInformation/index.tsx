import { Col, Modal, Popover, Row } from "antd";
import { CareLabelItem } from "model/product/product.model";
import React, { useCallback, useMemo, useState } from "react";
import { careInformation } from "./CareValues";
import { StyledComponent } from "./style";

type ModalCaresProps = {
  isVisible: boolean;
  careLabels: string;
  onCancel: () => void;
  onOk: (newCareLabels: string) => void;
};

const ModalCares: React.FC<ModalCaresProps> = (props: ModalCaresProps) => {
  const { isVisible, careLabels, onCancel, onOk } = props;

  const defaultSelected = useMemo<string[]>(() => careLabels ? careLabels.split(";"): [], [careLabels])

  const [selected, setSelected] = useState<string[]>(defaultSelected);

  const selectCareInformation = useCallback(
    (value: string, type: string) => {
      if (!selected.includes(value)) {
        setSelected(selected.concat(value));
        return;
      }

      setSelected(selected.filter(item => item !== value))
    },
    [selected],
  );

  const cancelModal = useCallback(() => {
    setSelected(defaultSelected);
    onCancel();
  }, [defaultSelected, onCancel]);

  const clickOk = useCallback(() => {
    onOk(selected.join(";"));

  }, [onOk, selected]);

  return (
    <Modal
      onOk={clickOk}
      onCancel={cancelModal}
      title="Thông tin bảo quản"
      width={900}
      visible={isVisible}
      maskClosable={false}
    >
      <StyledComponent>
        <p className="label">GIẶT</p>
        <Row gutter={24}>
          {careInformation.washing.map((item: any) => (
            <Col key={item.value} span={3} style={{ marginBottom: "20px" }}>
              <Popover content={item.name}>
                <span
                  onClick={() => selectCareInformation(item.value, "washing")}
                  className={`yody-icon ydl-${item.value} ${
                    selected.includes(item.value) ? "active" : "deactive"
                  }`}
                ></span>
              </Popover>
            </Col>
          ))}
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <p className="label">CHẤT TẨY</p>
            <Row gutter={24}>
              {careInformation.beleaching.map((item: any) => (
                <Col key={item.value} span={6} style={{ marginBottom: "20px" }}>
                  <Popover content={item.name}>
                    <span
                      onClick={() => selectCareInformation(item.value, "beleaching")}
                      className={`yody-icon ydl-${item.value} ${
                        selected.includes(item.value) ? "active" : "deactive"
                      }`}
                    ></span>
                  </Popover>
                </Col>
              ))}
            </Row>
          </Col>
          <Col span={12}>
            <p className="label">ỦI</p>
            <Row gutter={24}>
              {careInformation.ironing.map((item: any) => (
                <Col key={item.value} span={6} style={{ marginBottom: "20px" }}>
                  <Popover content={item.name}>
                    <span
                      onClick={() => selectCareInformation(item.value, "ironing")}
                      className={`yody-icon ydl-${item.value} ${
                        selected.includes(item.value) ? "active" : "deactive"
                      }`}
                    ></span>
                  </Popover>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>

        <p className="label">SẤY - PHƠI</p>
        <Row gutter={24}>
          {careInformation.drying
            .filter((e: CareLabelItem) => e.type === 1)
            .map((item: any) => (
              <Col key={item.value} span={3} style={{ marginBottom: "20px" }}>
                <Popover content={item.name}>
                  <span
                    onClick={() => selectCareInformation(item.value, "drying")}
                    className={`yody-icon ydl-${item.value} ${
                      selected.includes(item.value) ? "active" : "deactive"
                    }`}
                  ></span>
                </Popover>
              </Col>
            ))}
        </Row>
        <Row gutter={24}>
          {careInformation.drying
            .filter((e: CareLabelItem) => e.type === 2)
            .map((item: any) => (
              <Col key={item.value} span={3} style={{ marginBottom: "20px" }}>
                <Popover content={item.name}>
                  <span
                    onClick={() => selectCareInformation(item.value, "drying")}
                    className={`yody-icon ydl-${item.value} ${
                      selected.includes(item.value) ? "active" : "deactive"
                    }`}
                  ></span>
                </Popover>
              </Col>
            ))}
        </Row>

        <p className="label">GIẶT KHÔ/ƯỚT CHUYÊN NGHIỆP</p>
        <Row gutter={24}>
          {careInformation.professionalCare
            .filter((e: CareLabelItem) => e.type === 1)
            .map((item: any) => (
              <Col key={item.value} span={3} style={{ marginBottom: "20px" }}>
                <Popover content={item.name}>
                  <span
                    onClick={() => selectCareInformation(item.value, "professionalCare")}
                    className={`yody-icon ydl-${item.value} ${
                      selected.includes(item.value) ? "active" : "deactive"
                    }`}
                  ></span>
                </Popover>
              </Col>
            ))}
        </Row>
        <Row gutter={24}>
          {careInformation.professionalCare
            .filter((e: CareLabelItem) => e.type === 2)
            .map((item: any) => (
              <Col key={item.value} span={3} style={{ marginBottom: "20px" }}>
                <Popover content={item.name}>
                  <span
                    onClick={() => selectCareInformation(item.value, "professionalCare")}
                    className={`yody-icon ydl-${item.value} ${
                      selected.includes(item.value) ? "active" : "deactive"
                    }`}
                  ></span>
                </Popover>
              </Col>
            ))}
        </Row>
      </StyledComponent>
    </Modal>
  );
};

export default ModalCares;
