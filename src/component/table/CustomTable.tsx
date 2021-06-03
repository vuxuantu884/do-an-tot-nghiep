import { Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { BaseMetadata } from "model/response/base-metadata.response";
import { GetRowKey } from "rc-table/lib/interface";
import React, {Fragment} from "react";
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
  onSelect?: (select: any) => void
}

const CustomTable: React.FC<CustomTableProps> = (props: CustomTableProps) => {
  const {pagination, onChange, rowKey, onSelect, dataSource, columns, className, style} = props;
  return (
    <Fragment>
      <Table
        rowSelection={{
          type: "checkbox",
          columnWidth: 80,
          onSelect: onSelect
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