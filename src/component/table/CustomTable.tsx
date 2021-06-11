import { Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { BaseMetadata } from "model/base/base-metadata.response";
import { GetRowKey } from "rc-table/lib/interface";
import React, {Fragment, useCallback} from "react";
import CustomPagination from "./CustomPagination";


type CustomTableProps = {
  pagination: false|BaseMetadata
  onChange?: (size: number, page: number) => void
  dataSource?:  Array<any>
  columns?: ColumnsType<any>
  rowKey: string|GetRowKey<any>
  className?: string
  style?: React.CSSProperties
  emptyText?: React.ReactNode | (() => React.ReactNode)
  onSelectedChange?: (selectedRows: any[]) => void
}

const CustomTable: React.FC<CustomTableProps> = (props: CustomTableProps) => {
  const {pagination, onChange, rowKey, onSelectedChange, dataSource, columns, className, style} = props;
  const onSelect = useCallback((item: any, selected: boolean, selectedRow: any[]) => {
    onSelectedChange && onSelectedChange(selectedRow);
  }, [onSelectedChange]);
  const onSelectAll = useCallback((selected, selectedRow: any[], changeRow: any[]) => {
    onSelectedChange && onSelectedChange(selectedRow);
  }, [onSelectedChange]);
  return (
    <Fragment>
      <Table
        rowSelection={{
          fixed: true,
          type: "checkbox",
          columnWidth: 80,
          onSelect: onSelect,
          onSelectAll: onSelectAll,
        }}
        dataSource={dataSource}
        rowKey={rowKey}
        columns={columns}
        className={className}
        style={style}
        tableLayout="fixed"
        pagination={false}
      />
      {
        pagination !== false && (
          <CustomPagination
            metadata={pagination}
            onChange={onChange}
          />  
        )
      }
    </Fragment>
  )
}

export default React.memo(CustomTable);