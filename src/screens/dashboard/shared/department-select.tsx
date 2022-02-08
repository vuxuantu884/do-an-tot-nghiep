import { Select, SelectProps } from "antd";
import { DepartmentGetListAction } from "domain/actions/account/account.action";
import { DepartmentResponse, DepartmentView } from "model/account/department.model";
import React, { ReactElement, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import { convertDepartment } from "utils/AppUtils";
import queryString from "query-string";

interface Props extends SelectProps<number> {}

DepartmentSelect.defaultProps = {
  showSearch: true, 
  showArrow: false,
  placeholder: "Chọn bộ phận",
  optionFilterProp: "title",
};
function DepartmentSelect(props: Props): ReactElement {
  const params = queryString.parse(useLocation().search);

  const history = useHistory();
  const dispatch = useDispatch();
  const [listDepartment, setDepartment] = useState<Array<DepartmentView>>([]);

  const handleOnChange = (value: number) => {
    history.replace("?" + queryString.stringify({ ...params, departmentId: value }));
  };

  useEffect(() => {
    dispatch(
      DepartmentGetListAction((response: DepartmentResponse[]) => {
        if (response) {
          setDepartment(convertDepartment(response));
        }
      })
    );
  }, [dispatch]);

  return (
    <Select
      {...props}
      onChange={handleOnChange}
      defaultValue={
        typeof Number(params?.departmentId) === "number" && params?.departmentId
          ? Number(params.departmentId)
          : undefined
      }>
      {listDepartment?.map((single: any) => {
        return (
          <Select.Option value={single.id} key={single.id} title={single.name}>
            <span className="hideInSelect" style={{ paddingLeft: +18 * single.level }}></span>
            {single?.parent?.name && <span className="hideInDropdown">{single?.parent?.name} - </span>}
            <span className={`${single.level === 0 && "itemParent"}`}>{single.name}</span>
          </Select.Option>
        );
      })}
    </Select>
  );
}

export default DepartmentSelect;
