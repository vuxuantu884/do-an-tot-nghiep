import { Button, Form, Input } from "antd";
import { useForm } from "antd/es/form/Form";
import search from "assets/img/search.svg";
import "assets/css/custom-filter.scss";
import { ProcurementQuery } from "model/purchase-order/purchase-procument";
import ButtonSetting from "component/table/ButtonSetting";
import CustomDatePicker from "component/custom/date-picker.custom";
import { useEffect } from "react";
import { ProcumentLogQuery } from "model/purchase-order/purchase-order.model";
import { formatDateFilter } from "utils/DateUtils";

const { Item } = Form;

type ProcumentLogFilterProps = {
  onFilter?: (values: ProcurementQuery) => void;
  onClickOpen?: () => void;
  params?: ProcumentLogQuery;
};
function TabLogFilter({ onFilter, onClickOpen, params }: ProcumentLogFilterProps) {
  const [formBase] = useForm();

  useEffect(() => {
    if (!params) return;
    const newParams = {
      ...params,
      created_date_to: params.created_date_to ? formatDateFilter(params.created_date_to) : null,
      created_date_from: params.created_date_from ? formatDateFilter(params.created_date_from) : null,
    }
    formBase.setFieldsValue(newParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formBase]);

  return (
    <div className="custom-filter">
      <div className="page-filter">
        <div className="page-filter-heading">
          <div className="page-filter-full">
            <Form onFinish={onFilter} form={formBase} layout="inline">
                <Item name="condition" style={{ flex: 1 }}>
                  <Input
                    className="input-search"
                    prefix={<img src={search} alt="" />}
                    placeholder="Tìm kiếm theo Mã phiếu nhập kho, Mã đơn hàng, Tên sản phẩm, Mã vạch sản phẩm"
                  />
                </Item>
                <Item name="created_date_from" className="date">
                  <CustomDatePicker placeholder="Thời gian từ" style={{width: '100%'}} />
                </Item>
                <Item name="created_date_to" className="date">
                  <CustomDatePicker placeholder="Thời gian dến" style={{width: '100%'}} />
                </Item>
                <Item>
                  <Button type="primary" htmlType="submit">
                    Lọc
                  </Button>
                </Item>
                <Item>
                  <ButtonSetting onClick={onClickOpen} />
                </Item>
              </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
export default TabLogFilter;
