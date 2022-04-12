import { InfoCircleOutlined } from "@ant-design/icons";
import { Card, Form, FormInstance, Input } from "antd";
import HashTag from "component/custom/hashtag";
import RowDetail from "component/custom/RowDetail";
import { POField } from "model/purchase-order/po-field";
import React, { Fragment, useEffect } from "react";
import { POStatus } from "utils/Constants";
import { useSelector } from "react-redux";
import { RootReducerType } from "../../../model/reducers/RootReducerType";
import { useFetchMerchans } from "../../../hook/useFetchMerchans";
import BaseSelectMerchans from "../../../component/base/BaseSelect/BaseSelectMerchans";

type POInfoFormProps = {
  isEdit: boolean;
  isEditDetail?: boolean;
  formMain: FormInstance
};

const POInfoForm: React.FC<POInfoFormProps> = (props: POInfoFormProps) => {
  const { isEdit, isEditDetail, formMain } = props;
  const userReducer = useSelector((state: RootReducerType) => state.userReducer);
  const { fetchMerchans, merchans, isLoadingMerchans, setMerchans } = useFetchMerchans()
  // const [value] = useLocalStorage<any>(PO_FORM_TEMPORARY);

  const designer_code = formMain.getFieldValue(POField.designer_code);
  const designer = formMain.getFieldValue(POField.designer)
  const qc_code = formMain.getFieldValue(POField.qc_code)
  const qc = formMain.getFieldValue(POField.qc)
  const merchans_code = formMain.getFieldValue(POField.merchandiser_code)
  useEffect(() => {
    if (merchans.items?.length) {
      const findCurrentUser = merchans.items?.find(merchan => merchan.code === userReducer.account?.code);
      //Check nếu tài khoản hiện tại không có trong danh sách merchandiser thì thêm vào
      if (!findCurrentUser && userReducer) {
        setMerchans({
          ...merchans,
          items: [
            { code: userReducer.account?.code || "", full_name: userReducer.account?.full_name || "" },
            ...merchans.items,
          ]
        })
      }
    }
    props.formMain?.setFieldsValue({ [POField.merchandiser_code]: userReducer.account?.code })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(merchans)])

  if (isEdit && !isEditDetail) {
    return (
      <div>
        <Card
          className="po-form"
          title={
            <div className="d-flex">
              <span className="title-card">THÔNG TIN ĐƠN MUA HÀNG</span>
            </div>
          }
        >
          <div>
            <Form.Item name={POField.code} noStyle hidden>
              <Input />
            </Form.Item>
            <Form.Item name={POField.merchandiser_code} noStyle hidden>
              <Input />
            </Form.Item>
            <Form.Item name={POField.qc_code} noStyle hidden>
              <Input />
            </Form.Item>
            <Form.Item name={POField.designer_code} noStyle hidden>
              <Input />
            </Form.Item>
            <Form.Item name={POField.merchandiser} noStyle hidden>
              <Input />
            </Form.Item>
            <Form.Item name={POField.reference} noStyle hidden>
              <Input />
            </Form.Item>

            <RowDetail title="Mã đơn mua hàng" value={formMain.getFieldValue(POField.code)} />

            <RowDetail title="Merchandiser" value={`${merchans_code && merchans_code.toUpperCase()} - ${formMain.getFieldValue(POField.merchandiser)}`} />

            <RowDetail title="QC" value={`${qc && qc_code ? `${qc_code.toUpperCase() - qc}` : ""}`} />

            <RowDetail title="Thiết kế" value={`${designer_code && designer ? `${designer_code.toUpperCase() - designer}` : ""}`} />

            <RowDetail title="Mã tham chiếu" value={formMain.getFieldValue(POField.reference)} />

          </div>
        </Card>
        <Card
          className="po-form margin-top-20"
          title={
            <div className="d-flex">
              <span className="title-card">THÔNG TIN BỔ SUNG</span>
            </div>
          }
        >
          <div>
            <Form.Item noStyle hidden name={POField.note}>
              <Input />
            </Form.Item>
            <Form.Item
              label="Ghi chú nội bộ"
              shouldUpdate={(prev, current) =>
                prev[POField.note] !== current[POField.note]
              }
            >
              {({ getFieldValue }) => {
                let note = getFieldValue(POField.note);
                return (
                  <div className="row-view">
                    {note !== null && note !== "" ? note : ""}
                  </div>
                );
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
              shouldUpdate={(prev, current) =>
                prev[POField.tags] !== current[POField.tags]
              }
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
            <span className="title-card">THÔNG TIN ĐƠN MUA HÀNG</span>
          </div>
        }
      >
        <div>
          <Form.Item
            noStyle
            shouldUpdate={(prev, current) => prev.status !== current.status}
          >
            {({ getFieldValue }) => {
              let status = getFieldValue(POField.status);
              if (
                status === POStatus.FINISHED ||
                status === POStatus.CANCELLED ||
                status === POStatus.COMPLETED
              ) {
                return (
                  <Fragment>
                    <Form.Item name={POField.code} noStyle hidden>
                      <Input />
                    </Form.Item>
                    <Form.Item name={POField.merchandiser_code} noStyle hidden>
                      <Input />
                    </Form.Item>
                    <Form.Item name={POField.qc_code} noStyle hidden>
                      <Input />
                    </Form.Item>
                    <Form.Item name={POField.designer_code} noStyle hidden>
                      <Input />
                    </Form.Item>
                    <Form.Item name={POField.merchandiser} noStyle hidden>
                      <Input />
                    </Form.Item>
                    <Form.Item
                      shouldUpdate={(prev, current) =>
                        prev[POField.code] !== current[POField.code]
                      }
                    >
                      {({ getFieldValue }) => {
                        let code = getFieldValue(POField.code);
                        return (
                          <div className="row-view">
                            <div className="row-view-title">
                              Mã đơn mua hàng:
                            </div>
                            <div className="row-view-result row-view-result-id">
                              {code}
                            </div>
                          </div>
                        );
                      }}
                    </Form.Item>
                    <Form.Item
                      shouldUpdate={(prev, current) =>
                        prev[POField.merchandiser] !==
                        current[POField.merchandiser]
                      }
                    >
                      {({ getFieldValue }) => {
                        let merchandiser = getFieldValue(POField.merchandiser);
                        let merchandiser_code = getFieldValue(
                          POField.merchandiser_code
                        );
                        return (
                          <div className="row-view">
                            <div className="row-view-title">Merchandiser:</div>
                            <div className="row-view-result">
                              {merchandiser_code} - {merchandiser}
                            </div>
                          </div>
                        );
                      }}
                    </Form.Item>
                    <Form.Item
                      shouldUpdate={(prev, current) =>
                        prev[POField.qc] !== current[POField.qc]
                      }
                    >
                      {({ getFieldValue }) => {
                        let qc = getFieldValue(POField.qc);
                        let qc_code = getFieldValue(POField.qc_code);
                        return (
                          <div className="row-view">
                            <div className="row-view-title">QC:</div>

                            {qc_code !== null &&
                              qc_code !== "" &&
                              qc !== null &&
                              qc !== "" ? (
                              <div className="row-view-result">
                                {`${qc_code} - ${qc}`}
                              </div>
                            ) : null}
                          </div>
                        );
                      }}
                    </Form.Item>
                    <Form.Item
                      shouldUpdate={(prev, current) =>
                        prev[POField.designer] !== current[POField.designer]
                      }
                    >
                      {({ getFieldValue }) => {
                        let designer = getFieldValue(POField.designer);
                        let designer_code = getFieldValue(
                          POField.designer_code
                        );
                        return (
                          <div className="row-view">
                            <div className="row-view-title">Thiết kế:</div>
                            <div className="row-view-result">
                              {designer_code !== null &&
                                designer_code !== "" &&
                                designer !== null &&
                                designer !== "" ? (
                                <div className="row-view-result">
                                  {`${designer_code} - ${designer}`}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        );
                      }}
                    </Form.Item>
                    <Form.Item name={POField.reference} noStyle hidden>
                      <Input />
                    </Form.Item>
                    <Form.Item
                      shouldUpdate={(prev, current) =>
                        prev[POField.reference] !== current[POField.reference]
                      }
                    >
                      {({ getFieldValue }) => {
                        let reference = getFieldValue(POField.reference);
                        return (
                          <div className="row-view">
                            <div className="row-view-title">Mã tham chiếu:</div>

                            {reference !== null ? (
                              <div className="row-view-result">{`${reference}`}</div>
                            ) : null}
                          </div>
                        );
                      }}
                    </Form.Item>
                  </Fragment>
                );
              }
              return (
                <Fragment>
                  <Form.Item
                    name={POField.merchandiser_code}
                    label="Merchandiser"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn Merchandiser",
                      },
                    ]}>
                    <BaseSelectMerchans
                      merchans={merchans}
                      fetchMerchans={fetchMerchans}
                      isLoadingMerchans={isLoadingMerchans}
                      placeholder="Chọn Merchandiser"
                    />
                  </Form.Item>
                  <Form.Item name={POField.qc_code} label="QC">
                    <BaseSelectMerchans
                      merchans={merchans}
                      fetchMerchans={fetchMerchans}
                      isLoadingMerchans={isLoadingMerchans}
                      placeholder="Chọn QC"
                    />
                  </Form.Item>
                  <Form.Item name={POField.designer_code} label="Thiết kế">
                    <BaseSelectMerchans
                      merchans={merchans}
                      fetchMerchans={fetchMerchans}
                      isLoadingMerchans={isLoadingMerchans}
                      placeholder="Chọn Nhà thiết kế"
                    />
                  </Form.Item>

                  <Form.Item
                    tooltip={{
                      title: "Thêm số tham chiếu hoặc mã hợp đồng",
                      icon: <InfoCircleOutlined />,
                    }}
                    name={POField.reference}
                    label="Số tham chiếu">
                    <Input placeholder="Nhập số tham chiếu" maxLength={255} />
                  </Form.Item>
                </Fragment>
              );
            }}
          </Form.Item>
        </div>
      </Card>
      <Card
        className="po-form margin-top-20"
        title={
          <div className="d-flex">
            <span className="title-card">THÔNG TIN BỔ SUNG</span>
          </div>
        }
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
