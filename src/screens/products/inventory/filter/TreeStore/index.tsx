import React , { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { Tag, TreeSelect } from "antd";
import _ from 'lodash';
import { FormInstance } from 'antd';
import { DepartmentGetListAction } from "domain/actions/account/account.action";
import { DepartmentResponse } from "model/account/department.model";

interface Props {
  form:  FormInstance;
  name: string;
  placeholder: string;
  codeDepartment: string;
}

const TreeStore = (props: Props) => {
  const { form, name, placeholder, codeDepartment } = props;
  const dispatch = useDispatch();
  const isFirstLoad = useRef(true);
  const [listDepartment, setListDepartment] = useState<Array<DepartmentResponse>>();
  const [departments, setDepartments] = useState<DepartmentResponse>();

  useEffect(() => {
    if ( isFirstLoad.current) {
      dispatch(DepartmentGetListAction(setListDepartment));
    }

    isFirstLoad.current = false;
  }, [dispatch]);

  useEffect(() => {
    const newDepartments = _.find(listDepartment, ['code', codeDepartment]); 
    newDepartments?.children.splice(0, 1);
    setDepartments(newDepartments);
  }, [listDepartment, codeDepartment]);

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

  return (
    <TreeSelect
      placeholder={placeholder}
      treeDefaultExpandAll
      className="selector"
      allowClear
      showSearch
      multiple
      treeCheckable
      treeNodeFilterProp='title'
      tagRender={tagRender}
      maxTagCount="responsive"
      onChange={(value) => form.setFieldsValue({ [name]: value })}
    >
      {
        departments?.children.map((departmentItem: DepartmentResponse) => (
          <TreeSelect.TreeNode
            key={departmentItem.id}
            value={departmentItem.id}
            title={departmentItem.name}
          >
            {
              <React.Fragment>
                {
                  departmentItem.children.map((storeItem: any) => (
                    <TreeSelect.TreeNode 
                      key={storeItem.id} 
                      value={storeItem.id} 
                      title={storeItem.name}
                    />
                  ))
                }
              </React.Fragment>
            }
          </TreeSelect.TreeNode>
        ))
      }

      {
      }     
    </TreeSelect>
  );
};

export default TreeStore;