import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import './App.css';
import 'devextreme/dist/css/dx.material.blue.light.compact.css';
import FileUploader from 'devextreme-react/file-uploader';
import LoadPanel from 'devextreme-react/load-panel';
import UploadInfo from 'devextreme/file_management/upload_info';
import { UploadedEvent } from 'devextreme/ui/file_uploader';
import { AmazonGateway } from './services/amazon.gateway';
import { AmazonFileSystem } from './services/amazon.filesystem';

const endpointUrl = 'https://localhost:52366/api/AmazonS3';
const loadPanelPosition = { of: '#widget-area' };

function App(): JSX.Element {
  const [requests, setRequests] = useState<{ method: string; urlPath: string; queryString: string }[]>([]);
  const [loadPanelVisible, setLoadPanelVisible] = useState<boolean>(true);
  const [wrapperClassName, setWrapperClassName] = useState<string>('');
  const [downloadFileName, setDownloadFileName] = useState<string>('');
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [downloadPanelVisible, setDownloadPanelVisible] = useState<boolean>(false);

  const uploadChunk = useCallback((file: File, uploadInfo: UploadInfo): Promise<any> => amazon.uploadFileChunk(file, uploadInfo, undefined), []);
  const onValueChanged = useCallback((): void => {
    setDownloadPanelVisible(false);
    setDownloadFileName('');
    setDownloadUrl('');
  }, []);

  const onUploaded = useCallback((e: UploadedEvent): void => {
    amazon.getPresignedDownloadUrl(e.file.name).then((url: string) => {
      setDownloadFileName(e.file.name);
      setDownloadUrl(url);
      setDownloadPanelVisible(true);
    }).catch((error: any) => {
      throw error;
    });
  }, []);

  useEffect(() => {
    fetch('https://localhost:52366/api/AmazonS3/getItems')
      .then((response) => response.json())
      .then((result) => {
        result.active = true;
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

  const gateway = useMemo((): AmazonGateway => new AmazonGateway(endpointUrl, onRequestExecuted), []);
  const amazon = useMemo((): AmazonFileSystem => new AmazonFileSystem(gateway), []);
  return (
    <div id="wrapper" className={wrapperClassName}>
      <LoadPanel visible={loadPanelVisible} position={loadPanelPosition} />
      <div id="widget-area">
        <FileUploader id="file-uploader"
          chunkSize={5242880}
          uploadChunk={uploadChunk}
          onUploaded={onUploaded}
          onValueChanged={onValueChanged}
        />
        {downloadPanelVisible && (
          <div id="download-panel">
            <span>Download uploaded file:</span>
            <a href={downloadUrl} target="_blank">{downloadFileName}</a>
          </div>
        )}
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
          To run the demo locally, specify your Amazon access key, secret key,
          region and bucket name in the web.config file.
      </div>
    </div>
  );
}

export default App;
