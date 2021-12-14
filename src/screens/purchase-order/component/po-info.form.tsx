import { InfoCircleOutlined } from "@ant-design/icons";
import { Card, Form, Input, Select } from "antd";
import HashTag from "component/custom/hashtag";
import SelectPaging from "component/custom/SelectPaging";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { POField } from "model/purchase-order/po-field";
import { Fragment } from "react";
import { POStatus } from "utils/Constants";

type POInfoFormProps = {
  winAccount: PageResponse<AccountResponse>;
  rdAccount: Array<AccountResponse>;
  isEdit: boolean;
  isEditDetail?: boolean;
};

const POInfoForm: React.FC<POInfoFormProps> = (props: POInfoFormProps) => {
  const { winAccount, rdAccount, isEdit, isEditDetail } = props;
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
            <Form.Item
              shouldUpdate={(prev, current) =>
                prev[POField.code] !== current[POField.code]
              }
            >
              {({ getFieldValue }) => {
                let code = getFieldValue(POField.code);
                return (
                  <div className="row-view">
                    <div className="row-view-title">Mã đơn mua hàng:</div>
                    <div className="row-view-result row-view-result-id">
                      {code}
                    </div>
                  </div>
                );
              }}
            </Form.Item>
            <Form.Item
              shouldUpdate={(prev, current) =>
                prev[POField.merchandiser] !== current[POField.merchandiser]
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
                let designer_code = getFieldValue(POField.designer_code);
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
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn Merchandiser",
                      },
                    ]}
                    name={POField.merchandiser_code}
                    label="Merchandiser"
                  >
                    <SelectPaging
                      metadata={winAccount.metadata}
                      showArrow
                      searchPlaceholder="Tìm kiếm merchandiser"
                      allowClear
                      optionFilterProp="children"
                      placeholder="Chọn Merchandiser"
                    >
                      {winAccount.items.map((item) => (
                        <SelectPaging.Option key={item.code} value={item.code}>
                          {[item.code, item.full_name].join(" - ")}
                        </SelectPaging.Option>
                      ))}
                    </SelectPaging>
                  </Form.Item>
                  <Form.Item name={POField.qc_code} label="QC">
                    <Select
                      showArrow
                      showSearch
                      allowClear
                      optionFilterProp="children"
                      placeholder="Chọn QC"
                    >
                      <Select.Option value="">Chọn QC</Select.Option>
                      {rdAccount.map((item) => (
                        <Select.Option key={item.code} value={item.code}>
                          {item.code} - {item.full_name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item name={POField.designer_code} label="Thiết kế">
                    <Select
                      showArrow
                      allowClear
                      optionFilterProp="children"
                      placeholder="Chọn nhà thiết kế"
                    >
                      {winAccount.items.map((item) => (
                        <Select.Option key={item.code} value={item.code}>
                          {[item.code, item.full_name].join(" - ")}
                        </Select.Option>
                      ))}
                      <Select.Option value="">Chọn thiết kế</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    tooltip={{
                      title: "Thêm số tham chiếu hoặc mã hợp đồng",
                      icon: <InfoCircleOutlined />,
                    }}
                    name={POField.reference}
                    label="Số tham chiếu"
                  >
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
