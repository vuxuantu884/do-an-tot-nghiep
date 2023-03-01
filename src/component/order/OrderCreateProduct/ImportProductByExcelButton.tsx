import { ImportOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { OrderLineItemRequest } from "model/request/order.request";
import React, { useState } from "react";
import ProductImportByExcel from "screens/order-online/component/ProductImportByExcel";

type Props = {
  storeId?: number | null;
  items?: OrderLineItemRequest[];
  handleItems?: (items: OrderLineItemRequest[]) => void;
  disabled?: boolean;
  title?: string;
  orderType?: string;
};

const ImportProductByExcelButton: React.FC<Props> = (props: Props) => {
  const { storeId, items, handleItems, disabled } = props;
  const [visible, setVisible] = useState(false);
  return (
    <React.Fragment>
      <Button onClick={() => setVisible(true)} icon={<ImportOutlined />} disabled={disabled}>
        {props.title || "Nhập File"}
      </Button>
      <ProductImportByExcel
        title="Nhập file sản phẩm"
        visible={visible && !disabled}
        setVisible={setVisible}
        onCancel={() => setVisible(false)}
        storeId={storeId}
        handleItems={handleItems}
        items={items}
        orderType={props.orderType}
      />
    </React.Fragment>
  );
};

export default ImportProductByExcelButton;
