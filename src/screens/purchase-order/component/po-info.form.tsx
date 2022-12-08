import { InfoCircleOutlined } from "@ant-design/icons";
import { Card, Form, Input } from "antd";
import HashTag from "component/custom/hashtag";
import { POField } from "model/purchase-order/po-field";
import React, { useContext, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootReducerType } from "model/reducers/RootReducerType";
import { PurchaseOrderCreateContext } from "../provider/purchase-order.provider";

type POInfoFormProps = {
  isEdit: boolean;
  isEditDetail?: boolean;
};

const POInfoForm: React.FC<POInfoFormProps> = (props: POInfoFormProps) => {
  const { isEdit, isEditDetail } = props;
  const userReducer = useSelector((state: RootReducerType) => state.userReducer);

  const { fetchMerchandiser } = useContext(PurchaseOrderCreateContext);
  const { setMerchans, merchans } = fetchMerchandiser;

  useEffect(() => {
    if (Array.isArray(merchans?.items)) {
      const findCurrentUser = merchans.items.find(
        (merchan) => merchan.code === userReducer.account?.code,
      );
      //Check nếu tài khoản hiện tại không có trong danh sách merchandiser thì thêm vào
      if (!findCurrentUser && userReducer) {
        setMerchans({
          ...merchans,
          items: [
            {
              code: userReducer.account?.code || "",
              full_name: userReducer.account?.full_name || "",
            },
            ...merchans.items,
          ],
        });
      }
    }
  }, [merchans, setMerchans, userReducer]);

  if (isEdit && !isEditDetail) {
    return (
      <div style={{ height: "100%" }}>
        <Card
          className="po-form"
          title={
            <div className="d-flex">
              <span className="title-card">THÔNG TIN BỔ SUNG</span>
            </div>
          }
          style={{ marginBottom: "0px", height: "100%" }}
        >
          <div>
            <Form.Item noStyle hidden name={POField.note}>
              <Input />
            </Form.Item>
            <Form.Item
              label="Ghi chú nội bộ"
              shouldUpdate={(prev, current) => prev[POField.note] !== current[POField.note]}
            >
              {({ getFieldValue }) => {
                let note = getFieldValue(POField.note);
                return <div className="row-view">{note !== null && note !== "" ? note : ""}</div>;
              }}
            </Form.Item>
            <Form.Item noStyle hidden name={POField.supplier_note}>
              <Input />
            </Form.Item>
            <Form.Item
              label="Ghi chú của nhà cung cấp"
              shouldUpdate={(prev, current) =>
                prev[POField.supplier_note] !== current[POField.supplier_note]
              }
            >
              {({ getFieldValue }) => {
                let supplierNote = getFieldValue(POField.supplier_note);
                return (
                  <div className="row-view">
                    {supplierNote !== null && supplierNote !== "" ? supplierNote : ""}
                  </div>
                );
              }}
            </Form.Item>
            <Form.Item noStyle hidden name={POField.tags}>
              <Input />
            </Form.Item>
            <Form.Item
              tooltip={{
                title: "Thẻ ngày giúp tìm kiếm đơn hàng",
                icon: <InfoCircleOutlined />,
              }}
              shouldUpdate={(prev, current) => prev[POField.tags] !== current[POField.tags]}
              label="Tag"
            >
              {({ getFieldValue }) => {
                let tags: string = getFieldValue(POField.tags);
                let listTag = tags && tags !== null ? tags.split(",") : [];
                return (
                  <div style={{ flexWrap: "wrap" }} className="row-view">
                    {listTag.map((value, index) => (
                      <div className="row-view-hash-tag" key={index.toString()}>
                        {value}
                      </div>
                    ))}
                  </div>
                );
              }}
            </Form.Item>
          </div>
        </Card>
      </div>
    );
  }
  return (
    <div>
      <Card
        className="po-form"
        title={
          <div className="d-flex">
            <span className="title-card">THÔNG TIN BỔ SUNG</span>
          </div>
        }
        style={{ marginBottom: "0" }}
      >
        <div>
          <Form.Item label="Ghi chú nội bộ" name="note">
            <Input.TextArea maxLength={500} placeholder="Nhập ghi chú" />
          </Form.Item>
          <Form.Item label="Ghi chú của nhà cung cấp" name="supplier_note">
            <Input.TextArea maxLength={500} placeholder="Nhập ghi chú" />
          </Form.Item>
          <Form.Item
            tooltip={{
              title: "Thẻ ngày giúp tìm kiếm đơn hàng",
              icon: <InfoCircleOutlined />,
            }}
            name="tags"
            label="Tag"
          >
            <HashTag placeholder="Thêm tag" />
          </Form.Item>
        </div>
      </Card>
    </div>
  );
};

export default POInfoForm;
