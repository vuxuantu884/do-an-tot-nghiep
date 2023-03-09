import { customerReceptedTitle } from "config/report/customer-visitor-titles";
import { CustomerVisitorsType } from "screens/reports/common/enums/customer-visitors-type.enum";
import CustomerVisitors from "../shared/customer-visitors";

function CustomerRecepted() {
  return (
    <CustomerVisitors
      title={customerReceptedTitle}
      source={CustomerVisitorsType.Receptionist}
      name={"khách vào cửa hàng"}
      employee={"nhân viên tiếp đón"}
      tableTitle={"khách hàng vào tại các cửa hàng"}
    ></CustomerVisitors>
  );
}

export default CustomerRecepted;
