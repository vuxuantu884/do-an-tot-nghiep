/* eslint-disable jsx-a11y/iframe-has-title */
import React from "react";

export default function Report() {
  const width = '100%'
  const height = '100%'

  return (
    <React.Fragment>
      <iframe width={width} height={height} src="https://app.powerbi.com/reportEmbed?reportId=295ffa71-71fe-430f-8414-0bb5dac6a42a&autoAuth=true&ctid=e15d8dde-143a-41f2-aca7-e5243ef2638c&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly93YWJpLXNvdXRoLWVhc3QtYXNpYS1iLXByaW1hcnktcmVkaXJlY3QuYW5hbHlzaXMud2luZG93cy5uZXQvIn0%3D" frameBorder="0" allowFullScreen></iframe>
    </React.Fragment>
  );
}
