import { InfoCircleOutlined } from "@ant-design/icons";
import { Card, Form, FormInstance, Input } from "antd";
import AccountSearchPaging from "component/custom/select-search/account-select-paging";
import { RootReducerType } from "model/reducers/RootReducerType";
import { useEffect, Fragment } from "react";
import { useSelector } from "react-redux";
import { RegUtil } from "utils/RegUtils";
import { StockInOutField, StockInOutTypeMapping } from "../constant";
import "../index.scss";

interface InfoFormProps {
  title: string;
  formMain: FormInstance;
  isRequireNote: boolean;
  stockInOutType: string;
}

const InfoForm: React.FC<InfoFormProps> = (props: InfoFormProps) => {
  const { title, formMain, isRequireNote, stockInOutType } = props;
  const userAccount = useSelector((state: RootReducerType) => state.userReducer.account);

  useEffect(() => {
    if (userAccount && !formMain.getFieldValue([StockInOutField.account])) {
      formMain.setFieldsValue({
        [StockInOutField.account_name]: userAccount.full_name,
      });
      formMain.setFieldsValue({
        [StockInOutField.account_code]: userAccount.code,
      });
      formMain.setFieldsValue({
        [StockInOutField.account]: `${userAccount.code} - ${userAccount.full_name}`,
      });
    }
  }, [formMain, userAccount]);

  const validatePhone = (_: any, value: any, callback: any): void => {
    if (value) {
      if (!RegUtil.PHONE.test(value)) {
        callback(`Số điện thoại không đúng định dạng`);
      } else {
        callback();
      }
    } else {
      callback();
    }
  };

  return (
    <>
      <Card title={title} bordered={false}>
        <div>
          <Fragment>
            <Form.Item name={StockInOutField.account_name} noStyle hidden>
              <Input />
            </Form.Item>
            <Form.Item name={StockInOutField.account_code} noStyle hidden>
              <Input />
            </Form.Item>
            <Form.Item name={StockInOutField.type} initialValue={stockInOutType} noStyle hidden>
              <Input />
            </Form.Item>
            <Form.Item
              className="ie-form-label"
              name={[StockInOutField.account]}
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập tên nhân viên",
                },
              ]}
              label={`Nhân viên đề nghị ${StockInOutTypeMapping[stockInOutType]}`}
            >
              <AccountSearchPaging
                placeholder="Nhập tên nhân viên"
                style={{ width: "100%" }}
                isGetName
                onSelect={(value: string) => {
                  const account = JSON.parse(value);
                  formMain.setFieldsValue({
                    [StockInOutField.account_name]: account.name,
                  });
                  formMain.setFieldsValue({
                    [StockInOutField.account_code]: account.code,
                  });
                }}
              />
            </Form.Item>
            <Form.Item
              className="ie-form-label"
              name={[StockInOutField.partner_name]}
              rules={[
                {
                  max: 225,
                  message: "Không được nhập quá 225 ký tự",
                },
              ]}
              label="Đối tác"
            >
              <Input placeholder="Nhập tên đối tác" />
            </Form.Item>
            <Form.Item
              className="ie-form-label"
              name={[StockInOutField.partner_mobile]}
              rules={[{ validator: validatePhone }]}
              label="Số điện thoại"
            >
              <Input maxLength={11} placeholder="Nhập số điện thoại" />
            </Form.Item>
            <Form.Item
              className="ie-form-label"
              tooltip={{
                title: "Địa chỉ không quá 500 ký tự",
                icon: <InfoCircleOutlined />,
              }}
              name={[StockInOutField.partner_address]}
              label="Địa chỉ"
              rules={[
                {
                  max: 500,
                  message: "Không được nhập quá 500 ký tự",
                },
              ]}
            >
              <Input.TextArea rows={2} placeholder="Nhập địa chỉ" />
            </Form.Item>
          </Fragment>
        </div>
      </Card>
      <Card className="po-form margin-top-20" title="THÔNG TIN BỔ SUNG">
        <Fragment>
          <Form.Item
            className="ie-form-label"
            name={[StockInOutField.internal_note]}
            label="Ghi chú nội bộ"
            tooltip={{
              title: "Nhập ghi chú khi chọn lý do khác",
              icon: <InfoCircleOutlined />,
            }}
            rules={[
              {
                required: isRequireNote,
                message: "Vui lòng nhập ghi chú",
              },
              {
                max: 255,
                message: "Không được nhập quá 255 ký tự",
              },
            ]}
          >
            <Input.TextArea placeholder="Nhập ghi chú" />
          </Form.Item>
        </Fragment>
        <Form.Item
          className="ie-form-label"
          label="Ghi chú đối tác"
          name={[StockInOutField.partner_note]}
          tooltip={{
            title: "Ghi chú không quá 255 ký tự",
            icon: <InfoCircleOutlined />,
          }}
          rules={[
            {
              max: 255,
              message: "Không được nhập quá 255 ký tự",
            },
          ]}
        >
          <Input.TextArea placeholder="Nhập ghi chú" />
        </Form.Item>
      </Card>
    </>
  );
};

export default InfoForm;
