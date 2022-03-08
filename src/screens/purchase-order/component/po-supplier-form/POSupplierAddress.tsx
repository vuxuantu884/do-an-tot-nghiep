import React, {useEffect, useMemo, useRef, useState} from "react";
import { Button, Col, Row, Tooltip } from "antd";
import { EditOutlined, PhoneOutlined, UserOutlined } from "@ant-design/icons";
import { IconLocationOutlined } from "../../../../component/icon/IconLocation";
import { NamePath, StoreValue } from "rc-field-form/es/interface";

type PoSupplierInfoProps = {
  getFieldValue: (name: NamePath) => StoreValue;
  onEdit?: () => void;
  field: "billing_address" | "supplier_address";
};
const POSupplierAddress = ({ getFieldValue, field, onEdit }: PoSupplierInfoProps) => {
  let address = getFieldValue(field);
  const fullAddressRef = useRef(null)
  const [isOverFlown, setIsOverFlown] = useState(false)

  const addressTransform = useMemo(() => {
    return (
      <span className="text-truncate-1" style={{ flex: 1 }} ref={fullAddressRef}>
        {address.full_address ? `${address.full_address}` : ""}
        {address.full_address && address.ward ? `, ${address.ward}` : address.ward}
        {address.district ? `, ${address.district}` : ""}
        {address.city ? `, ${address.city}` : ""}
        {address.country ? `, ${address.country}` : ""}
      </span>
    );
  }, [address]);

  function checkOverFlown(element: HTMLElement) {
    return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
  }

  useEffect(() => {
    if(fullAddressRef.current) {
      setIsOverFlown(checkOverFlown(fullAddressRef.current))
    }
  }, [address])

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
              {
                isOverFlown ? (
                  <Tooltip placement="topLeft" title={addressTransform} overlayStyle={{ maxWidth: 800 }}>
                    {addressTransform}
                  </Tooltip>
                ) : addressTransform
              }
            </Row>
          </Col>
        </Row>
        <Button
          style={{ display: "flex", alignItems: "center" }}
          type="link"
          icon={<EditOutlined size={24} />}
          onClick={onEdit}
        />
      </Row>
    </>
  );
};

export default POSupplierAddress;
