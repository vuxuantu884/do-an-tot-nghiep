import { Card, Col, Row, Tag } from "antd";
import { promotionUtils } from "component/order/promotion.utils";
import { OrderResponse } from "model/response/order/order.response";
import EditOrderNote from "screens/order-online/component/EditOrderNote";
import TextWithLineBreak from "screens/order-online/component/TextWithLineBreak";
import { primaryColor } from "utils/global-styles/variables";
import { StyledComponent } from "./styles";

type PropTypes = {
  OrderDetail: OrderResponse | null;
  editNote?: (
    note: string | null | undefined,
    customer_note: string | null | undefined,
    orderID: number | undefined,
  ) => void;
};

function SidebarOrderDetailExtraInformation(props: PropTypes) {
  const { OrderDetail, editNote } = props;

  const detailArr = [
    {
      title: (
        <EditOrderNote
          title="Ghi chú của khách: "
          color={primaryColor}
          onOk={(values) => {
            editNote && editNote(values?.note, values?.customer_note, OrderDetail?.id);
          }}
          noteFormValue={{
            note: OrderDetail?.note,
            customer_note: OrderDetail?.customer_note,
          }}
        />
      ),
      value:
        OrderDetail?.customer_note !== "" ? (
          <TextWithLineBreak note={OrderDetail?.customer_note} />
        ) : (
          "Không có ghi chú"
        ),
    },
    {
      title: (
        <EditOrderNote
          title="Ghi chú nội bộ: "
          color={primaryColor}
          onOk={(values) => {
            editNote && editNote(values?.note, values?.customer_note, OrderDetail?.id);
          }}
          noteFormValue={{
            // note: OrderDetail?.note,
            note: promotionUtils.getPrivateNoteFromResponse(OrderDetail?.note || ""),
            customer_note: OrderDetail?.customer_note,
          }}
        />
      ),
      value:
        OrderDetail?.note !== "" ? (
          <TextWithLineBreak note={promotionUtils.getPrivateNoteFromResponse(OrderDetail?.note || "")} />
        ) : (
          "Không có ghi chú"
        ),
    },
    {
      title: "Tên CTKM: ",
      value: promotionUtils.getPromotionText(OrderDetail?.note || "")
    },
    {
      title: "Nhãn: ",
      value: OrderDetail?.tags
        ? OrderDetail?.tags.split(",").map((item, index) => (
            <Tag key={index} className="orders-tag">
              {item}
            </Tag>
          ))
        : "Không có nhãn",
    },
  ];

  return (
    <StyledComponent>
      <Card className='orderDetailExtraSidebar' title={<span className="78">THÔNG TIN BỔ SUNG</span>}>
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

export default SidebarOrderDetailExtraInformation;
