import { Card, Checkbox, Collapse, Form } from "antd";
import { FormInstance } from "antd/es/form/Form";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import _ from "lodash";
import { ModuleAuthorize } from "model/auth/module.model";
import { PermissionsAuthorize } from "model/auth/permission.model";
import { PageResponse } from "model/base/base-metadata.response";
import { Fragment } from "react";
import { HiChevronDoubleRight, HiOutlineChevronDoubleDown } from "react-icons/hi";
import { handleCheckedModule, handleIndeterminateModule, onChangeModule } from "utils/AuthUtil";
import { RoleStyled } from "./index.style";
const { Panel } = Collapse;

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
    onChangeCheckboxPermission?: (e: CheckboxChangeEvent, module: ModuleAuthorize, permission: PermissionsAuthorize) => void;
    isShowTitle?: boolean;
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
        isShowTitle
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

    const handleChangeCheckboxPermission =
        (
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
                    {moduleData?.items.map((module: ModuleAuthorize) => {
                        const isIndeterminate = indeterminateModules.includes(module.id.toString());
                        const isChecked = checkedModules.includes(module.id.toString());

                        return (
                            <Panel
                                header={
                                    <div className="panel-header">
                                        <Checkbox
                                            onChange={(e) => handleChangeModule(e, module)}
                                            indeterminate={isIndeterminate && !isChecked}
                                            checked={isChecked || isIndeterminate}
                                        >
                                            <b>
                                                {_.capitalize(module.name)}
                                            </b>
                                        </Checkbox>
                                        {activePanel.includes(module.id.toString()) ? (
                                            <HiOutlineChevronDoubleDown color="#2A2A86" />
                                        ) : (
                                            <HiChevronDoubleRight color="#2A2A86" />
                                        )}
                                    </div>
                                }
                                key={module.id}
                                className="site-collapse-custom-panel"
                            >
                                <div className="panel-content">
                                    {module.permissions.map((value: PermissionsAuthorize) => {
                                        return (
                                            <Form.Item name={value.id} key={value.id} valuePropName="checked">
                                                <Checkbox
                                                    className="panel-content-item"
                                                    onChange={(e) => handleChangeCheckboxPermission(e, module, value)}
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