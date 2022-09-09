import { Card } from "antd";
import CustomSelect from "component/custom/select.custom";
import { RevenueStatusModel } from "model/order/revenue-receipt.model";
import { StyledComponent } from "./styles";

type PropTypes = {
  status?: string;
  statuses: RevenueStatusModel[];
};

function RevenueStatus(props: PropTypes) {
  const { status, statuses } = props;

  return (
    <StyledComponent>
      <Card title="Trạng thái phiếu">
        <CustomSelect
          showArrow
          allowClear
          showSearch
          placeholder="Cửa hàng"
          notFoundContent="Không tìm thấy kết quả"
          optionFilterProp="children"
          getPopupContainer={(trigger) => trigger.parentNode}
          maxTagCount="responsive"
          disabled
          value={status}
        >
          {statuses?.map((status) => (
            <CustomSelect.Option key={status.value} value={status.value}>
              {status.title}
            </CustomSelect.Option>
          ))}
        </CustomSelect>
      </Card>
    </StyledComponent>
  );
}

export default RevenueStatus;
