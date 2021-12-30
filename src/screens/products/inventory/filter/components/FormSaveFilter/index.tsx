import {Col, Form, Input, Radio, Row, Space, } from "antd";
import {CustomModalFormModel} from "model/modal/modal.model";
import {useCallback, useEffect, useState, } from "react";
import * as CONSTANTS from "utils/Constants"; 
import "./index.scss";
import { FilterConfig } from "model/other";
import CustomSelect from "component/custom/select.custom";

type FormValuesType = { 
  id: number|null,
  name: string | null; 
  save_filter_type: string;
  version: number | null;
};

const FILTER_TYPE_CONSTANT ={
  NEW: 1,
  UPDATE: 2
}

const FormSaveFilter: React.FC<CustomModalFormModel> = (props: CustomModalFormModel) => {
  const {modalAction, formItem, form, visible, lstConfigFilter} = props; 
  const isCreateForm = modalAction === CONSTANTS.MODAL_ACTION_TYPE.create;
  const initialFormValues: FormValuesType =
    !isCreateForm && formItem
      ? {id: formItem.id,name: formItem.name, 
        save_filter_type: formItem.save_filter_type,
        version: formItem.version } : { id:null, name: null, save_filter_type: 1, version: null};

   const [lstFilterConfig, setLstFilterConfig] = useState<Array<FilterConfig>>();

  const [filterType, setFilterType] = useState<number>(1);  

  const onChangeSaveFilterType = useCallback(
    (e)=>{
      setFilterType(e.target.value);
    },[]);

    const getData = useCallback(
      () => {
        setLstFilterConfig(lstConfigFilter);
      },
      [lstConfigFilter]
    ); 

  useEffect(() => {
    if (visible) {
      form.resetFields();
      getData();
    }
  }, [form,getData, formItem, visible]);
 
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
              <Radio.Group  onChange={onChangeSaveFilterType} value={filterType} className="display-block">
                  <Space direction="vertical" className="display-block">
                    <Radio value={FILTER_TYPE_CONSTANT.NEW} className="display-block">Lưu bộ lọc mới
                      {filterType === FILTER_TYPE_CONSTANT.NEW && 
                          <Form.Item name="name" rules={[
                            {
                              required: filterType === FILTER_TYPE_CONSTANT.NEW ? true : false,
                              message: "Bạn chưa nhập tên bộ lọc mới",
                            },
                              {
                                max: 50,
                                message: "Tên bộ lọc mới không vượt quá 50 ký tự",
                              }
                          ]}>
                                <Input className="item-radio-option" placeholder="Nhập tên bộ lọc mới"/>
                          </Form.Item>}
                    </Radio>
                    <Radio value={FILTER_TYPE_CONSTANT.UPDATE} className="display-block">
                      Lưu vào bộ lọc đã có
                      {filterType === FILTER_TYPE_CONSTANT.UPDATE && <div className="item-radio-option">
                          <Form.Item name="id" rules={[
                                  {
                                    required: filterType === FILTER_TYPE_CONSTANT.UPDATE ? true : false,
                                    message: "Bạn chưa chọn tên bộ lọc",
                                  },
                                ]}>
                            <CustomSelect
                              showArrow allowClear
                              showSearch
                              placeholder="Chọn tên bộ lọc"
                              notFoundContent="Không tìm thấy kết quả"
                              style={{
                                width: '100%'
                              }}
                              optionFilterProp="children"
                              getPopupContainer={trigger => trigger.parentNode}
                              maxTagCount='responsive'
                            >
                              {lstFilterConfig?.map((item) => (
                                <CustomSelect.Option key={item.id} value={item.id.toString()}>
                                  {item.name}
                                </CustomSelect.Option>
                              ))}
                            </CustomSelect>
                          </Form.Item></div>}
                    </Radio>
                  </Space>
                </Radio.Group>
                <Row>
                  <Col span={24} className={`${ filterType === FILTER_TYPE_CONSTANT.UPDATE && 'red'} text-info`}>
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
