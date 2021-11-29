import {Card, Checkbox, Collapse, Form} from "antd";
import {FormInstance} from "antd/es/form/Form";
import {CheckboxChangeEvent} from "antd/lib/checkbox";
import {ADMIN_MODULE} from "config/permissions/admin.permission";
import _ from "lodash";
import {ModuleAuthorize} from "model/auth/module.model";
import {PermissionsAuthorize} from "model/auth/permission.model";
import {PageResponse} from "model/base/base-metadata.response";
import {Fragment, useCallback, useMemo} from "react";
import {HiChevronDoubleRight, HiOutlineChevronDoubleDown} from "react-icons/hi";
import {
  handleCheckedModule,
  handleIndeterminateModule,
  onChangeModule,
} from "utils/AuthUtil";
import {RoleStyled} from "./index.style";
const {Panel} = Collapse;

interface AuthorizeDetailCardProps {
  activePanel: string | string[];
  setActivePanel: (data: string | string[]) => void;
  indeterminateModules: string[];
  setIndeterminateModules: (data: string[]) => void;
  checkedModules: string[];
  setCheckedModules: (data: string[]) => void;
  moduleData: PageResponse<ModuleAuthorize> | undefined;
  form: FormInstance<any>;
  onChangeCheckboxModule?: (e: CheckboxChangeEvent, module: ModuleAuthorize) => void;
  onChangeCheckboxPermission?: (
    e: CheckboxChangeEvent,
    module: ModuleAuthorize,
    permission: PermissionsAuthorize
  ) => void;
  isShowTitle?: boolean;
  disabled?: boolean;
}

export const AuthorizeDetailCard = (props: AuthorizeDetailCardProps) => {
  const {
    activePanel,
    setActivePanel,
    indeterminateModules,
    setIndeterminateModules,
    checkedModules,
    setCheckedModules,
    moduleData,
    form,
    onChangeCheckboxModule,
    onChangeCheckboxPermission,
    isShowTitle,
    disabled,
  } = props;

  const handleChangeModule = (e: CheckboxChangeEvent, module: ModuleAuthorize) => {
    onChangeModule(
      e,
      module,
      form,
      checkedModules,
      setCheckedModules,
      indeterminateModules,
      setIndeterminateModules,
      moduleData,
      activePanel,
      setActivePanel
    );
    onChangeCheckboxModule && onChangeCheckboxModule(e, module);
  };

  const handleChangeCheckboxPermission = (
    e: CheckboxChangeEvent,
    module: ModuleAuthorize,
    permission: PermissionsAuthorize
  ) => {
    handleCheckedModule(module, form, checkedModules, setCheckedModules);
    handleIndeterminateModule(
      module,
      form,
      indeterminateModules,
      setIndeterminateModules
    );
    onChangeCheckboxPermission && onChangeCheckboxPermission(e, module, permission);
  };

  const sortPermissionName = useCallback((a, b) => {
    var nameA = a.name.toUpperCase(); // ignore upper and lowercase
    var nameB = b.name.toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }

    // names is equal
    return 0;
  }, []);

  const finalModule = useMemo(() => {
    if (Array.isArray(moduleData?.items)) {
      return _.filter(moduleData?.items, function (item) {
        return item.code !== ADMIN_MODULE;
      });
    }
    return [];
  }, [moduleData]);

  return (
    <RoleStyled>
      <Card title={isShowTitle ? "PHÂN QUYỀN CHI TIẾT" : ""}>
        <Collapse
          bordered={false}
          activeKey={activePanel}
          onChange={(key: string | string[]) => {
            setActivePanel(key);
          }}
          expandIcon={() => <Fragment />}
          className="site-collapse-custom-collapse"
        >
          {finalModule.map((module: ModuleAuthorize) => {
            const isIndeterminate = indeterminateModules.includes(module.code);
            const isChecked = checkedModules.includes(module.code);

            return (
              <Panel
                header={
                  <div className="panel-header">
                    <Checkbox
                      onChange={(e) => handleChangeModule(e, module)}
                      indeterminate={isIndeterminate && !isChecked}
                      checked={isChecked || isIndeterminate}
                      disabled={disabled}
                    >
                      <b>{_.capitalize(module.name)}</b>
                    </Checkbox>
                    {activePanel.includes(module.code) ? (
                      <HiOutlineChevronDoubleDown color="#2A2A86" />
                    ) : (
                      <HiChevronDoubleRight color="#2A2A86" />
                    )}
                  </div>
                }
                key={module.code}
                className="site-collapse-custom-panel"
              >
                <div className="panel-content">
                  {module.permissions
                    .sort(sortPermissionName)
                    .map((value: PermissionsAuthorize) => {
                      return (
                        <Form.Item name={value.id} key={value.id} valuePropName="checked">
                          <Checkbox
                            className="panel-content-item"
                            onChange={(e) =>
                              handleChangeCheckboxPermission(e, module, value)
                            }
                            disabled={disabled}
                          >
                            {_.capitalize(value.name)}
                          </Checkbox>
                        </Form.Item>
                      );
                    })}
                </div>
              </Panel>
            );
          })}
        </Collapse>
      </Card>
    </RoleStyled>
  );
};

AuthorizeDetailCard.defaultProps = {
  disabled: false,
};
