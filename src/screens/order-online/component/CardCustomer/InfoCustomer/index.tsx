import { CloseOutlined } from "@ant-design/icons";
import { Avatar, Divider, Row, Space, Tag, Typography } from "antd";
import UrlConfig from "config/url.config";
import { CustomerResponse } from "model/response/customer/customer.response";
import { LoyaltyPoint } from "model/response/loyalty/loyalty-points.response";
import { LoyaltyUsageResponse } from "model/response/loyalty/loyalty-usage.response";
import { Link } from "react-router-dom";
import { StyleComponent } from "./style";
import birthdayIcon from "assets/img/bithday.svg";
import callIcon from "assets/img/call.svg";
import pointIcon from "assets/img/point.svg";
import moment from "moment";

type Props = {
  customer: CustomerResponse;
  loyaltyPoint: LoyaltyPoint | null;
  loyaltyUsageRules: Array<LoyaltyUsageResponse>;
  levelOrder?: number;
  CustomerDeleteInfo?: () => void;
};

const InfoCustomer: React.FC<Props> = (props: Props) => {
  const { customer, loyaltyPoint, loyaltyUsageRules, levelOrder = 0, CustomerDeleteInfo } = props;
  let customerBirthday = moment(customer.birthday).format("DD/MM/YYYY");

  const rankName = loyaltyUsageRules.find(
    (x) =>
      x.rank_id === (loyaltyPoint?.loyalty_level_id === null ? 0 : loyaltyPoint?.loyalty_level_id),
  )?.rank_name;
  return (
    <StyleComponent>
      <Row align="middle" justify="space-between" className="row-customer-detail">
        <Space>
          <Avatar size={32}>A</Avatar>
          <Link
            target="_blank"
            to={`${UrlConfig.CUSTOMER}/${customer.id}`}
            className="primary"
            style={{ fontSize: "16px" }}
          >
            {customer.full_name}
          </Link>
          <Tag className="orders-tag orders-tag-vip">
            <b>{!rankName ? "Không có hạng" : rankName}</b>
          </Tag>
        </Space>
        <Space className="customer-detail-phone">
          <span className="customer-detail-icon">
            <img src={callIcon} alt="" className="icon-customer-info" />
          </span>
          <a
            className="customer-detail-text text-body primary"
            style={{ color: "#5656A2" }}
            href={`tel:${customer?.phone === undefined ? "0987654321" : customer?.phone}`}
          >
            {" "}
            {customer?.phone === undefined ? "0987654321" : customer?.phone}
          </a>
        </Space>

        <Space className="customer-detail-point">
          <span className="customer-detail-icon">
            <img src={pointIcon} alt="" />
          </span>
          <span className="customer-detail-text">
            Tổng điểm:
            <Typography.Text type="success" style={{ color: "#FCAF17", marginLeft: "5px" }} strong>
              {loyaltyPoint?.point === undefined ? "0" : loyaltyPoint?.point}
            </Typography.Text>
          </span>
        </Space>

        <Space className="customer-detail-birthday">
          <span className="customer-detail-icon">
            <img src={birthdayIcon} alt="" className="icon-customer-info" />
          </span>
          <span className="customer-detail-text">
            {customer?.birthday !== null ? customerBirthday : "Không xác định"}
          </span>
        </Space>

        {levelOrder < 3 && CustomerDeleteInfo &&(
          <Space className="customer-detail-action">
            <CloseOutlined onClick={CustomerDeleteInfo} style={{ marginRight: "5px" }} />
          </Space>
        )}
      </Row>
      <Divider style={{ padding: 0, marginBottom: 0 }} />
    </StyleComponent>
  );
};

export default InfoCustomer;
