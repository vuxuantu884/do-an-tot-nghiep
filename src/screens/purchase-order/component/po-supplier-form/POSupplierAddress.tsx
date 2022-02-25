import React from "react";
import { Button, Col, Row } from "antd";
import { EditOutlined, PhoneOutlined, UserOutlined } from "@ant-design/icons";
import { IconLocationOutlined } from "../../../../component/icon/IconLocation";
import { NamePath, StoreValue } from "rc-field-form/es/interface";

type PoSupplierInfoProps = {
  getFieldValue: (name: NamePath) => StoreValue;
  onEdit?: () => void;
  field: 'billing_address' | 'supplier_address'
};
const POSupplierAddress = ({ getFieldValue, field, onEdit }: PoSupplierInfoProps) => {
  let address = getFieldValue(field);

  return (
    <>
      <Row align="middle" justify={"space-between"}>
        <Row style={{ flex: 1 }}>
          <Col span={5}>
            <Row align="middle">
              <UserOutlined />
              <span style={{ marginLeft: 10 }}>{address.name}</span>
            </Row>
          </Col>
          <Col span={5}>
            <Row align="middle">
              <PhoneOutlined />
              <span style={{ marginLeft: 10 }}>{address.phone}</span>
            </Row>
          </Col>
          <Col span={14}>
            <Row align="middle">
              <IconLocationOutlined width={16} height={16} style={{ marginRight: 10 }} />
              <span>
                {address.full_address ? `${address.full_address}` : ""}
                {address.full_address && address.ward ? `, ${address.ward}` : address.ward}
                {address.district ? `, ${address.district}` : ""}
                {address.city ? `, ${address.city}` : ""}
                {address.country ? `, ${address.country}` : ""}
              </span>
            </Row>
          </Col>
        </Row>
        <Button type="link" icon={<EditOutlined size={24} />} onClick={onEdit} />
      </Row>
    </>
  );
};

export default POSupplierAddress;
