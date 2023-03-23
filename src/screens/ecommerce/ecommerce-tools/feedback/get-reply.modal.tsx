import { Form, FormInstance, Modal, Table } from "antd";
import CustomRangeDatePicker from "component/custom/new-date-range-picker";
import CustomSelect from "component/custom/select.custom";
import moment from "moment";
import { createRef, useCallback, useEffect, useMemo, useState } from "react";
import { ModalStyled } from "./reply.modal.styled";

type FormValueType = {
  [key: string]: any;
};
type GetReplyModalPropTypes = {
  visible: boolean;
  replying: boolean;
  dataReplying: any;
  shops: any[];
  onOk: (values: FormValueType) => void;
  onCancel: () => void;
};

function GetReplyModal(props: GetReplyModalPropTypes) {
  const { visible, replying, dataReplying, shops, onOk, onCancel } = props;

  const [form] = Form.useForm();
  const formRef = createRef<FormInstance>();
  const [timeClick, setTimeClick] = useState("");
  const [page, setPage] = useState(1);
  const initialFormValues = {
    shop_id: undefined,
    update_time_from: null,
    update_time_to: moment().format("DD-MM-YYYY"),
  };

  const onSubmit = () => {
    form.validateFields().then((values) => {
      if (dataReplying.finish) {
        onOk({});
      } else {
        if (!values.update_time_from || !values.update_time_to) {
          console.log("123");
          formRef?.current?.setFields([
            {
              name: "update_time_from",
              errors: ["Vui lòng chọn khoảng thời gian"],
            },
            {
              name: "update_time_to",
              errors: [""],
            },
          ]);
        } else {
          onOk({
            ...values,
            update_time_from: moment(values.update_time_from, "DD-MM-YYYY")
              .startOf("day")
              .valueOf(),
            update_time_to: moment(values.update_time_to, "DD-MM-YYYY").endOf("day").valueOf(),
          });
        }
      }
    });
  };

  const dataSource: any[] = useMemo(() => {
    let data = [];
    data =
      dataReplying.errors_msg &&
      dataReplying.errors_msg
        .split("\n")
        .filter((i: string) => i)
        .map((i: string, index: number) => {
          return {
            index: index + 1,
            value: i,
          };
        });
    return data;
  }, [dataReplying.errors_msg]);

  const columns: any = useMemo(() => {
    return [
      {
        title: "STT",
        key: "index",
        dataIndex: "index",
        visible: true,
        width: 80,
      },
      {
        title: "Chi tiết lỗi",
        key: "value",
        dataIndex: "value",
        visible: true,
      },
    ];
  }, []);

  const onPageChange = useCallback((page, size) => {
    setPage(page);
  }, []);

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        shop_id: undefined,
        update_time_from: null,
        update_time_to: moment().format("DD-MM-YYYY"),
      });
      setTimeClick("");
      setPage(1);
    }
  }, [form, visible]);

  return (
    <Modal
      onCancel={onCancel}
      onOk={() => onSubmit()}
      visible={visible}
      okText={dataReplying.finish ? "Xác nhận" : "Cập nhật dữ liệu"}
      cancelText="Huỷ"
      cancelButtonProps={{
        style:
          replying && !dataReplying.finish
            ? { color: "#ffffff", background: "#e24343", borderColor: "#e24343" }
            : dataReplying.finish
            ? { display: "none" }
            : {},
      }}
      okButtonProps={{
        loading: replying && !dataReplying.finish,
      }}
      title="Cập nhật đánh giá"
      width={600}
      closable={false}
    >
      <ModalStyled>
        {!replying && (
          <Form form={form} ref={formRef} layout="vertical" initialValues={initialFormValues}>
            <Form.Item
              name="shop_id"
              label="Lựa chọn gian hàng"
              rules={[
                {
                  required: true,
                  message: "Vui lòng lựa chọn gian hàng!",
                },
              ]}
            >
              <CustomSelect
                style={{}}
                showArrow
                maxTagCount="responsive"
                showSearch
                allowClear
                placeholder="Chọn gian hàng"
                notFoundContent="Không tìm thấy kết quả"
                optionFilterProp="children"
                getPopupContainer={(trigger) => trigger.parentNode}
              >
                {shops.length &&
                  shops.map((item, index) => (
                    <CustomSelect.Option
                      style={{ width: "100%" }}
                      key={index.toString()}
                      value={item.id.toString()}
                    >
                      {item.name}
                    </CustomSelect.Option>
                  ))}
              </CustomSelect>
            </Form.Item>

            <div className="ant-form-item-label">
              <label>Ngày tạo đơn</label>
            </div>
            <CustomRangeDatePicker
              fieldNameFrom="update_time_from"
              fieldNameTo="update_time_to"
              activeButton={timeClick}
              setActiveButton={setTimeClick}
              format="DD-MM-YYYY"
              formRef={formRef}
            />
          </Form>
        )}
        {replying && (
          <div className="replying">
            <div className="process">
              <div className="details">
                <div className="info">
                  <p>Tổng cộng</p>
                  <p className="value">{dataReplying.total}</p>
                </div>
                <div className="info">
                  <p>Đang xử lý</p>
                  <p className="value" style={{ color: "#FCAF17" }}>
                    {dataReplying.total - dataReplying.total_success - dataReplying.total_error}
                  </p>
                </div>
                <div className="info">
                  <p>Đã xử lý</p>
                  <p className="value" style={{ color: "#27AE60" }}>
                    {dataReplying.total_success}
                  </p>
                </div>
                <div className="info">
                  <p>Lỗi</p>
                  <p className="value" style={{ color: "#E24343" }}>
                    {dataReplying.total_error}
                  </p>
                </div>
              </div>
            </div>
            {dataReplying.total_error > 0 && (
              <div className="table-error">
                <Table
                  pagination={
                    dataReplying.total_error > 10
                      ? {
                          pageSize: 10,
                          total: dataReplying.total_error,
                          showSizeChanger: false,
                          current: page,
                          onChange: onPageChange,
                        }
                      : false
                  }
                  dataSource={dataSource}
                  columns={columns}
                  rowKey={(item: any) => item.index}
                  bordered
                />
              </div>
            )}
          </div>
        )}
      </ModalStyled>
    </Modal>
  );
}

export default GetReplyModal;
