import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

import UploadInfo from 'devextreme/file_management/upload_info';
import { AzureGateway } from './services/azure.gateway';
import { AzureResponse } from './services/app.service.types';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  requests: any[];

  wrapperClassName: string;

  loadPanelVisible: boolean;

  gateway: AzureGateway;

  constructor(http: HttpClient) {
    const endpointUrl = 'https://localhost:7021/api/file-uploader-azure-access';
    this.gateway = new AzureGateway(endpointUrl, this.onRequestExecuted.bind(this));

    this.requests = [];
    this.wrapperClassName = '';
    this.loadPanelVisible = true;

    this.checkAzureStatus(http);
    this.uploadChunk = this.uploadChunk.bind(this);
  }

  uploadChunk(file: File, uploadInfo: UploadInfo): Promise<AzureResponse> | null {
    let promise = null;
    if (uploadInfo.chunkIndex === 0) {
      promise = this.gateway.getUploadAccessUrl(file.name).then((accessUrls) => {
        uploadInfo.customData.accessUrl = accessUrls.url1;
      });
    } else {
      promise = Promise.resolve();
    }
    promise = promise.then(() => this.gateway.putBlock(uploadInfo.customData.accessUrl, uploadInfo.chunkIndex, uploadInfo.chunkBlob));
    if (uploadInfo.chunkIndex === uploadInfo.chunkCount - 1) {
      promise = promise.then(() => this.gateway.putBlockList(uploadInfo.customData.accessUrl, uploadInfo.chunkCount));
    }
    return promise;
  }

  onRequestExecuted({ method, urlPath, queryString }: { method: string; urlPath: string; queryString: string }): void {
    const request = { method, urlPath, queryString };
    this.requests.unshift(request);
  }

  checkAzureStatus(http: HttpClient): void {
    lastValueFrom(http.get<{ active: boolean }>('https://localhost:7021/api/file-azure-status?widgetType=fileUploader'))
      .then((result) => {
        this.wrapperClassName = result.active ? 'show-widget' : 'show-message';
        this.loadPanelVisible = false;
      })
      .catch(() => { });
  }
}
