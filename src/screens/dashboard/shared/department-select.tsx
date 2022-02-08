import { Select, SelectProps } from 'antd';
import { DepartmentGetListAction } from 'domain/actions/account/account.action';
import { DepartmentResponse, DepartmentView } from 'model/account/department.model';
import React, { ReactElement, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { convertDepartment } from 'utils/AppUtils';

interface Props extends SelectProps<string> { }

DepartmentSelect.defaultProps = {
    showSearch: true,
    allowClear: true,
    showArrow: false,
    placeholder: "Chọn bộ phận",
    optionFilterProp: "title"
}
function DepartmentSelect(props: Props): ReactElement {
    const dispatch = useDispatch();
    const [listDepartment, setDepartment] = useState<Array<DepartmentView>>([]);

    useEffect(() => {
        dispatch(DepartmentGetListAction((response: DepartmentResponse[]) => {
            if (response) {
                setDepartment(convertDepartment(response));
            }
        }));
    }, [dispatch]);

    return (
        <Select {...props}>
            {listDepartment?.map((single: any) => {
                return (
                    <Select.Option value={single.id} key={single.id} title={single.name}>
                        <span
                            className="hideInSelect"
                            style={{ paddingLeft: +18 * single.level }}
                        ></span>
                        {single?.parent?.name && (
                            <span className="hideInDropdown">
                                {single?.parent?.name} -{" "}
                            </span>
                        )}
                        <span className={`${single.level === 0 && "itemParent"}`}>{single.name}</span>
                    </Select.Option>
                );
            })}
        </Select>

    )
}

export default DepartmentSelect
