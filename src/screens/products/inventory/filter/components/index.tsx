import {Col, Form, Input, Radio, Row, Space, } from "antd";
import SelectPaging from "component/custom/SelectPaging";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import {CustomModalFormModel} from "model/modal/modal.model";
import {useCallback, useEffect, useState, } from "react";
import * as CONSTANTS from "utils/Constants"; 
import "./index.scss";
import { useDispatch } from "react-redux";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { AppConfig } from "config/app.config";

type FormValuesType = { 
  filter_name: string | null; 
  save_filter_type: string;
  version: number | null
};

const FormSaveFilter: React.FC<CustomModalFormModel> = (props: CustomModalFormModel) => {
  const {modalAction, formItem, form, visible} = props; 
  const dispatch = useDispatch();

  const isCreateForm = modalAction === CONSTANTS.MODAL_ACTION_TYPE.create;
  const initialFormValues: FormValuesType =
    !isCreateForm && formItem
      ? {filter_name: formItem.filter_name, 
        save_filter_type: formItem.save_filter_type,
        version: formItem.version } : { filter_name: null, save_filter_type: 1, version: null};

   const [designer, setDeisgner] = useState<PageResponse<AccountResponse>>(
     {
       items: [],
       metadata: { limit: 20, page: 1, total: 0 }
     }
   );

  const [value, setValue] = useState<number>(1);  

  const onChangeSaveFilterType = useCallback(
    (e)=>{
      setValue(e.target.value);
    },[]);

    const setDataAccounts = useCallback(
      (data: PageResponse<AccountResponse> | false) => {
        if (!data) {
          return false;
        }
        debugger
        setDeisgner(data);
      },
      []
    );

   const getAccounts = useCallback((code: string, page: number) => {
     dispatch(
       AccountSearchAction(
         { info: code, page: page, department_ids: [AppConfig.WIN_DEPARTMENT], status: "active" },
         setDataAccounts
       )
     );
   }, [dispatch, setDataAccounts]);

  useEffect(() => {
    form.resetFields();
    getAccounts("",1);
  }, [form, formItem,getAccounts, visible]);
 
  return (
      <Form
        form={form}
        name="control-hooks"
        layout="vertical"
        initialValues={initialFormValues}
      > 
        <Row gutter={30}> 
           <Col span={24}>
            <Form.Item hidden noStyle name="version">
              <Input />
            </Form.Item>
            <Form.Item name="save_filter_type">
              <Radio.Group  onChange={onChangeSaveFilterType} value={value} className="display-block">
                  <Space direction="vertical" className="display-block">
                    <Radio value={1} className="display-block">Lưu bộ lọc mới
                      {value === 1 && <Form.Item name="filter_name">
                                <Input className="item-radio-option" placeholder="Nhập tên bộ lọc mới"/>
                          </Form.Item>}
                    </Radio>
                    <Radio value={2} className="display-block">
                      Lưu vào bộ lọc đã có
                      {value === 2 && <div className="item-radio-option">
                                  <Form.Item>
                                    <SelectPaging 
                                        metadata={designer.metadata}
                                        showSearch={false}
                                        showArrow
                                        allowClear
                                        searchPlaceholder="Tìm kiếm bộ lọc"
                                        placeholder="Chọn tên bộ lọc"
                                        onPageChange={(key, page) => getAccounts(key, page)}
                                        onSearch={(key) => getAccounts(key, 1)}
                                      >

                                        {designer.items.map((item) => (
                                          <SelectPaging.Option key={item.code} value={item.code}>
                                            {`${item.code} - ${item.full_name}`}
                                          </SelectPaging.Option>
                                        ))}
                                      </SelectPaging>  
                                  </Form.Item></div>}
                    </Radio>
                  </Space>
                </Radio.Group>
                <Row>
                  <Col span={24} className={`${ value=== 2 && 'red'} text-info`}>
                      Bộ lọc được lưu sẽ hiển thị ở dạng nút chọn trong Popup <b>“Thêm bộ lọc”</b>
                  </Col>
                </Row>
              </Form.Item> 
           </Col>
        </Row> 
      </Form>
  );
};

export default FormSaveFilter;
