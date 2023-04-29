import { Button, Modal, Row } from "antd";
import React, { useState } from "react";
import { StyledComponent } from "./styled";

const SHIFT = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
const WEEK = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];

type Props = {
  visible?: boolean;
};
const AddReceptionist: React.FC<Props> = (props: Props) => {
  const { visible } = props;

  // const renderReceptionistCard: React.FC = () => {
  //   return;
  // };
  if (!visible) return <></>;
  return (
    <StyledComponent>
      <Row className="sort-receptionist-header">
        <p className="text-sort-receptionist">Chọn thời gian sắp xếp nhân viên kho</p>
        <p className="text-sort-receptionist text-sort-receptionist-border">
          Từ 2 nhân viên trở lên hệ thống sẽ tự động phân phối luân phiên
        </p>
      </Row>
      <Row className="sort-receptionist">
        <div className="sort-receptionist-Card-header">
          <div className="sort-receptionist-Card-header-left" style={{ width: "86px" }}>
            Thứ
          </div>
          <div
            className="sort-receptionist-Card-header-right"
            style={{ width: "calc(100% - 86px)" }}
          >
            Ca làm việc
          </div>
        </div>
        {WEEK.map((value, index) => (
          <div className="sort-receptionist-Card" key={index}>
            <div className="sort-receptionist-Card-left">
              <Button block className="button-gray">
                {value}
              </Button>
            </div>
            <div className="sort-receptionist-Card-right">
              {SHIFT.map((value, index) => (
                <Button size="small" key={index}>
                  Ca {value}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </Row>
      <Row className="sort-receptionist-footer">
        <Button type="primary">Xác nhận</Button>
      </Row>
    </StyledComponent>
  );
};

export default AddReceptionist;
