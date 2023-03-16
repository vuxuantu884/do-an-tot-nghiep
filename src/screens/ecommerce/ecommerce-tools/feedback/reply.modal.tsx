import { Button, Form, Input, Modal, Progress, Radio, Space, Table } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ModalStyled } from "./reply.modal.styled";

type FormValueType = {
  [key: string]: any;
};
type ReplyModalPropTypes = {
  visible: boolean;
  replying: boolean;
  dataReplying: any;
  selected: boolean;
  onOk: (values: FormValueType) => void;
  onCancel: () => void;
};

function ReplyModal(props: ReplyModalPropTypes) {
  const { visible, replying, dataReplying, selected, onOk, onCancel } = props;

  const [form] = Form.useForm();
  const [page, setPage] = useState(1);
  const initialFormValues = {
    type: "conditions",
    content: "",
  };

  const onSubmit = () => {
    form.validateFields().then((values) => {
      // !dataReplying.finish && localStorage.setItem("ecommerce-reply", values.content);
      onOk(values);
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
        type: "conditions",
        content: "",
      });
    }
  }, [form, visible]);

  return (
    <Modal
      onCancel={onCancel}
      onOk={() => onSubmit()}
      visible={visible}
      okText={dataReplying.finish ? "Xác nhận" : "Phản hồi"}
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
      title="Phản hồi đánh giá hàng loạt"
      width={600}
      closable={false}
    >
      <ModalStyled>
        {!replying && (
          <Form form={form} layout="vertical" initialValues={initialFormValues}>
            <Form.Item name="type">
              <Radio.Group>
                <Space direction="vertical">
                  <Radio value={"conditions"}>Tất cả các trang theo điều kiện đã lọc</Radio>
                  <Radio value={"selected"} disabled={!selected}>
                    Các đánh giá đã chọn
                  </Radio>
                </Space>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name="content"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập phản hồi!",
                },
              ]}
            >
              <Input.TextArea rows={4}></Input.TextArea>
            </Form.Item>
            <div className="actions">
              <Button
                type="ghost"
                onClick={() => {
                  const input: any = document.getElementById("content");
                  const value = input.value;
                  const index = value.slice(0, input.selectionStart).length;
                  const contentStart = value.substring(0, index);
                  const contentEnd = value.substring(index);
                  form.setFieldsValue({
                    content: contentStart + `{{{ SHOP }}}` + contentEnd,
                  });
                }}
              >
                Chèn tên gian hàng
              </Button>

              <Button
                type="ghost"
                onClick={() => {
                  const input: any = document.getElementById("content");
                  const value = input.value;
                  const index = value.slice(0, input.selectionStart).length;
                  const contentStart = value.substring(0, index);
                  const contentEnd = value.substring(index);
                  form.setFieldsValue({
                    content: contentStart + `{{{ KHACH_HANG }}}` + contentEnd,
                  });
                }}
              >
                Chèn tên khách hàng
              </Button>
            </div>
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
              <Progress
                percent={
                  Math.round(
                    ((dataReplying.total_error + dataReplying.total_success) / dataReplying.total) *
                      10000,
                  ) / 100
                }
                status={
                  Math.round(
                    ((dataReplying.total_error + dataReplying.total_success) / dataReplying.total) *
                      10000,
                  ) /
                    100 !==
                  100
                    ? "active"
                    : undefined
                }
              />
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

export default ReplyModal;
