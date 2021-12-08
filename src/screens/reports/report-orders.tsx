import React, { useEffect, useState } from 'react';
import { models, Embed } from 'powerbi-client';
import { PowerBIEmbed } from 'powerbi-client-react';
import { useDispatch } from 'react-redux';
import { powerBIEmbededAction } from 'domain/actions/account/account.action';
import './reports.scss'
// import 'powerbi-report-authoring';

const config = {
  // embedUrl: 'https://app.powerbi.com/reportEmbed?reportId=61281888-f6ed-4379-a326-e23b581df0dc&groupId=38195b18-39f2-4667-8633-b09b0d339e72&w=2&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly9XQUJJLVNPVVRILUVBU1QtQVNJQS1CLVBSSU1BUlktcmVkaXJlY3QuYW5hbHlzaXMud2luZG93cy5uZXQiLCJlbWJlZEZlYXR1cmVzIjp7Im1vZGVybkVtYmVkIjp0cnVlLCJjZXJ0aWZpZWRUZWxlbWV0cnlFbWJlZCI6dHJ1ZSwidXNhZ2VNZXRyaWNzVk5leHQiOnRydWV9fQ%3d%3d',
  group_id: '38195b18-39f2-4667-8633-b09b0d339e72',
  report_id: '61281888-f6ed-4379-a326-e23b581df0dc'
}

function ReportYody (): JSX.Element {
  const dispatch = useDispatch();
	const [sampleReportConfig, setReportConfig] = useState<models.IReportEmbedConfiguration>({
		type: 'report',
		embedUrl: '',
		tokenType: models.TokenType.Embed,
		accessToken: '',
		settings: {
      localeSettings: {
        language: "vi",
        formatLocale: "vi"
      }
    },
	});
	
  useEffect(() => {
    const params = {
      group_id: config.group_id,
      report_id: config.report_id
    }
    dispatch(powerBIEmbededAction(params, (data: any) => setReportConfig({
      // ...sampleReportConfig,
      type: 'report',
      tokenType: models.TokenType.Embed,
      settings: {
        localeSettings: {
          language: "vi",
          formatLocale: "vi"
        }
      },
      embedUrl: data.embed_url,
      accessToken: data.token
    })));
  }, [dispatch]);

	return (
    <PowerBIEmbed
      embedConfig={sampleReportConfig}
      cssClassName={"report-style-class"}
      getEmbeddedComponent = {(embedObject:Embed) => {
        console.log(`Embedded object of type "${ embedObject.embedtype }" received`);
      }}
    />
	);
}

export default ReportYody;