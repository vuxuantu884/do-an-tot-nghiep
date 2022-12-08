import { ImportOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { OrderLineItemRequest } from "model/request/order.request";
import React, { useState } from "react";
import ImportFileOrderProduct from "screens/order-online/component/ImportProduct";

type Props = {
  storeId?: number | null;
  items?: OrderLineItemRequest[];
  handleItems?: (items: OrderLineItemRequest[]) => void;
  disabled?: boolean;
};

const ButtonImportProduct: React.FC<Props> = (props: Props) => {
  const { storeId, items, handleItems, disabled } = props;
  const [visible, setVisible] = useState(false);
  return (
    <React.Fragment>
      <Button onClick={() => setVisible(true)} icon={<ImportOutlined />} disabled={disabled}>
        Nhập File
      </Button>
      <ImportFileOrderProduct
        title="Nhập file sản phẩm"
        visible={visible && !disabled}
        setVisible={setVisible}
        onCancel={() => setVisible(false)}
        storeId={storeId}
        handleItems={handleItems}
        items={items}
      />
    </React.Fragment>
  );
};

export default ButtonImportProduct;
