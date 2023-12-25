import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import './App.css';
import 'devextreme/dist/css/dx.material.blue.light.compact.css';
import FileUploader from 'devextreme-react/file-uploader';
import LoadPanel from 'devextreme-react/load-panel';
import UploadInfo from 'devextreme/file_management/upload_info';
import { AzureGateway } from './services/azure.gateway';
import { AzureResponse } from './services/app.service.types';

const endpointUrl = 'https://localhost:7021/api/file-uploader-azure-access';
const loadPanelPosition = { of: '#file-uploader' };

function App(): JSX.Element {
  const [requests, setRequests] = useState<{ method: string; urlPath: string; queryString: string }[]>([]);
  const [loadPanelVisible, setLoadPanelVisible] = useState<boolean>(true);
  const [wrapperClassName, setWrapperClassName] = useState<string>('');

  const uploadChunk = useCallback((file: File, uploadInfo: UploadInfo): Promise<AzureResponse> | null => {
    let promise = null;
    if (uploadInfo.chunkIndex === 0) {
      promise = gateway.getUploadAccessUrl(file.name).then((accessUrls) => {
        uploadInfo.customData.accessUrl = accessUrls.url1;
      });
    } else {
      promise = Promise.resolve();
    }
    promise = promise.then(() => gateway.putBlock(
      uploadInfo.customData.accessUrl,
      uploadInfo.chunkIndex,
      uploadInfo.chunkBlob,
    ));
    if (uploadInfo.chunkIndex === uploadInfo.chunkCount - 1) {
      promise = promise.then(() => gateway.putBlockList(
        uploadInfo.customData.accessUrl,
        uploadInfo.chunkCount,
      ));
    }
    return promise;
  }, []);

  useEffect(() => {
    fetch('https://localhost:7021/api/file-azure-status?widgetType=fileUploader')
      .then((response) => response.json())
      .then((result) => {
        const className = result.active ? 'show-widget' : 'show-message';
        setWrapperClassName(className);
        setLoadPanelVisible(false);
      })
      .catch(() => { });
  }, []);
  const onRequestExecuted = useCallback(({ method, urlPath, queryString }: { method: string; urlPath: string; queryString: string }): void => {
    const request = { method, urlPath, queryString };
    setRequests((requests) => [request, ...requests]);
  }, []);

  const gateway = useMemo((): AzureGateway => new AzureGateway(endpointUrl, onRequestExecuted), []);

  return (
    <div id="wrapper" className={wrapperClassName}>
      <LoadPanel visible={loadPanelVisible} position={loadPanelPosition} />
      <div id="widget-area">
        <FileUploader id="file-uploader" chunkSize={200000} maxFileSize={1048576} uploadChunk={uploadChunk} />
        <div id="request-panel">
          {
            requests.map((r, i) => <div key={i} className="request-info">
              <div className="parameter-info">
                <div className="parameter-name">Method:</div>
                <div className="parameter-value dx-theme-accent-as-text-color">{r.method}</div>
              </div>
              <div className="parameter-info">
                <div className="parameter-name">Url path:</div>
                <div className="parameter-value dx-theme-accent-as-text-color">{r.urlPath}</div>
              </div>
              <div className="parameter-info">
                <div className="parameter-name">Query string:</div>
                <div className="parameter-value dx-theme-accent-as-text-color">{r.queryString}</div>
              </div>
              <br />
            </div>)
          }
        </div>
      </div>
      <div id="message-box">
          To run the demo locally, specify your Azure storage account name,
          access key and container name in the web.config file.
      </div>
    </div>
  );
}

export default App;
