import { Card, Col, Form, Input, Row, Tag } from "antd";
import { DailyRevenueDetailModel } from "model/order/daily-revenue.model";
import { OrderResponse } from "model/response/order/order.response";
import React from "react";
import EditNote from "screens/order-online/component/EditNote";
import TextWithLineBreak from "screens/order-online/component/TextWithLineBreak";
import { primaryColor } from "utils/global-styles/variables";
import { StyledComponent } from "./styles";

type PropTypes = {
  dailyRevenueDetail: DailyRevenueDetailModel | undefined;
  editStoreNote?: (dailyRevenueID: number, storeNote: string) => void;
  editAccountantNote?: (dailyRevenueID: number, accountantNote: string) => void;
};

function RevenueNote(props: PropTypes) {
  const { dailyRevenueDetail, editStoreNote, editAccountantNote } = props;

  const formStoreNoteNode = (
    <React.Fragment>
      <Form.Item name="store_note" label="Ghi chú của cửa hàng">
        <Input.TextArea rows={3} />
      </Form.Item>
    </React.Fragment>
  );

  const formAccountantNoteNode = (
    <React.Fragment>
      <Form.Item name="accountant_note" label="Ghi chú của kế toán">
        <Input.TextArea rows={3} />
      </Form.Item>
    </React.Fragment>
  );

  const detailArr = [
    {
      title: (
        <EditNote
          title="Cửa hàng: "
          color={primaryColor}
          onOk={(values) => {
            dailyRevenueDetail?.id &&
              editStoreNote &&
              editStoreNote(dailyRevenueDetail?.id, values?.store_note);
          }}
          noteFormValue={{
            store_note: dailyRevenueDetail?.store_note,
          }}
          formItemNode={formStoreNoteNode}
        />
      ),
      value:
        dailyRevenueDetail?.store_note !== "" ? (
          <TextWithLineBreak note={dailyRevenueDetail?.store_note} />
        ) : (
          "Không có ghi chú"
        ),
    },
    {
      title: (
        <EditNote
          title="Kế toán: "
          color={primaryColor}
          onOk={(values) => {
            dailyRevenueDetail?.id &&
              editAccountantNote &&
              editAccountantNote(dailyRevenueDetail?.id, values?.accountant_note);
          }}
          noteFormValue={{
            accountant_note: dailyRevenueDetail?.accountant_note,
          }}
          formItemNode={formAccountantNoteNode}
        />
      ),
      value:
        dailyRevenueDetail?.accountant_note !== "" ? (
          <TextWithLineBreak note={dailyRevenueDetail?.accountant_note} />
        ) : (
          "Không có ghi chú"
        ),
    },
  ];

  return (
    <StyledComponent>
      <Card title={<span className="78">Ghi chú</span>}>
        {detailArr.map((single, index) => {
          return (
            <Row gutter={5} className="singleRow" key={index}>
              <Col span={24} className="colTitle">
                {single.title}
              </Col>
              <Col span={24}>
                <span className="text-focus">{single.value}</span>
              </Col>
            </Row>
          );
        })}
      </Card>
    </StyledComponent>
  );
}

export default RevenueNote;
