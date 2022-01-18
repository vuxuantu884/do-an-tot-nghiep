import { Button, Form, Input } from "antd";
import { useForm } from "antd/es/form/Form";
import search from "assets/img/search.svg";
import "assets/css/custom-filter.scss";  
import { ProcurementQuery } from "model/purchase-order/purchase-procument";
import ButtonSetting from "component/table/ButtonSetting";

const { Item } = Form;
const BaseProcumentField = {
  content: "content",
  merchandisers: "merchandisers",
  suppliers: "suppliers"
}; 


type ProcumentLogFilterProps = { 
  onFilter?: (values: ProcurementQuery) => void; 
  onClickOpen?: () => void;
};
function TabLogFilter({ onFilter, onClickOpen }: ProcumentLogFilterProps) { 
  const [formBase] = useForm();  

  return (
    <div className="custom-filter"> 
      <div className="page-filter">
        <div className="page-filter-heading">
          <div className="page-filter-full">
            <Form onFinish={onFilter} form={formBase} layout="inline">
                <Item name={BaseProcumentField.content} style={{ flex: 1 }}>
                  <Input
                    className="input-search"
                    prefix={<img src={search} alt="" />}
                    placeholder="Tìm kiếm mã phiếu nhập kho, mã đơn hàng, tên, mã vạch"
                  />
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
