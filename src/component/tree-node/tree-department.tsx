import React from "react";
import { Tag, TreeSelect, TreeSelectProps } from "antd";
import { DepartmentResponse } from "model/account/department.model";
import { strForSearch } from "../../utils/StringUtils";

interface Props extends TreeSelectProps<string> {
    name?: string;
    placeholder?: string;
    treeCheckable?: boolean;
    multiple?: boolean;
    listDepartment: Array<DepartmentResponse> | undefined;
    onChange?: (value: any) => void;
}

const TreeDepartment = (props: Props) => {
    const { name, placeholder, listDepartment, onChange, multiple = true, treeCheckable = true, ...restProps } = props;

    const propConvert = () => {
        if (!treeCheckable) return;
        const restPropsExt: any = { ...restProps, }
        return {
            ...restProps,
            value: restPropsExt?.value?.map((p: string | number) => +p)
        };
    }

    function tagRender(props: any) {
        const { label, closable, onClose } = props;
        const onPreventMouseDown = (event: any) => {
            event.preventDefault();
            event.stopPropagation();
        };
        return (
            <Tag
                className="primary-bg"
                onMouseDown={onPreventMouseDown}
                closable={closable}
                onClose={onClose}
            >
                {label}
            </Tag>
        );
    }

    const TreeDepartment = (item: DepartmentResponse) => {
        return (
          <TreeSelect.TreeNode value={item.id} title={item.name}>
            {item.children.length > 0 && (
              <React.Fragment>
                {item.children.map((item, index) => (
                  <React.Fragment key={index}>{TreeDepartment(item)}</React.Fragment>
                ))}
              </React.Fragment>
            )}
          </TreeSelect.TreeNode>
        );
      };

    return (
        <TreeSelect
            placeholder={placeholder}
            treeDefaultExpandAll
            className="selector"
            allowClear
            showSearch
            multiple={multiple}
            treeCheckable={treeCheckable}
            treeNodeFilterProp='title'
            tagRender={tagRender}
            maxTagCount="responsive"
            showCheckedStrategy={TreeSelect.SHOW_ALL}
            onChange={onChange}
            {...propConvert()}
            filterTreeNode={(input: String, option: any) => {
                if (option.value) {
                    return strForSearch(option.title).includes(strForSearch(input));
                }

                return false;
            }}
        >
              {listDepartment?.map((item, index) => (
                <React.Fragment key={index}>{TreeDepartment(item)}</React.Fragment>
              ))}
        </TreeSelect>
    );
};
TreeDepartment.defaultProps = {
    placeholder: "Chọn phòng ban"
}
export default TreeDepartment;
