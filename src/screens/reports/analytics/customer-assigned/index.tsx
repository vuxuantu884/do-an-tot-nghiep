import { customerAssignedTitle } from "config/report/customer-visitor-titles";
import { CustomerVisitorsType } from "screens/reports/common/enums/customer-visitors-type.enum";
import CustomerVisitors from "../shared/customer-visitors";

function CustomerAssigned() {
  return (
    <CustomerVisitors
      title={customerAssignedTitle}
      source={CustomerVisitorsType.Assignee}
      name={"khách được tiếp"}
      employee={"nhân viên tư vấn"}
    ></CustomerVisitors>
  );
}

export default CustomerAssigned;
