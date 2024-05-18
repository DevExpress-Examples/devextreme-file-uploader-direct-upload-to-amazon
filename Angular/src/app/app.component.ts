import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

import UploadInfo from 'devextreme/file_management/upload_info';
import { ValueChangedEvent, UploadedEvent } from 'devextreme/ui/file_uploader';

import { AmazonGateway } from './services/amazon.gateway';
import { AmazonFileSystem } from './services/amazon.filesystem';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  requests: any[];

  wrapperClassName: string;

  loadPanelVisible: boolean;

  downloadFileName: string;

  downloadUrl: string;

  gateway: AmazonGateway;

  amazon: AmazonFileSystem;

  downloadPanelVisible: boolean;

  constructor(http: HttpClient) {
    const endpointUrl = 'https://localhost:52366/api/AmazonS3';
    this.gateway = new AmazonGateway(endpointUrl, this.onRequestExecuted.bind(this));
    this.amazon = new AmazonFileSystem(this.gateway);

    this.requests = [];
    this.wrapperClassName = '';
    this.loadPanelVisible = true;
    this.downloadFileName = '';
    this.downloadUrl = '';
    this.downloadPanelVisible = false;

    this.checkAmazonStatus(http);
    this.uploadChunk = this.uploadChunk.bind(this);
    this.abortUpload = this.abortUpload.bind(this);
    this.onUploaded = this.onUploaded.bind(this);
    this.onValueChanged = this.onValueChanged.bind(this);
  }

  async uploadChunk(file: File, uploadInfo: UploadInfo): Promise<any> {
    return this.amazon.uploadFileChunk(file, uploadInfo, undefined);
  }

  async abortUpload(file: File, uploadInfo: UploadInfo): Promise<any> {
    return this.amazon.abortFileUpload(file, uploadInfo, undefined);
  }

  async onUploaded(e: UploadedEvent): Promise<any> {
    const url = await this.amazon.getPresignedDownloadUrl(e.file.name);
    this.downloadFileName = e.file.name;
    this.downloadUrl = url;
    this.downloadPanelVisible = true;
  }

  onValueChanged(e: ValueChangedEvent): void {
    this.downloadPanelVisible = false;
    this.downloadFileName = '';
    this.downloadUrl = '';
  }

  onRequestExecuted({ method, urlPath, queryString }: { method: string; urlPath: string; queryString: string }): void {
    const request = { method, urlPath, queryString };
    this.requests.unshift(request);
  }

  checkAmazonStatus(http: HttpClient): void {
    lastValueFrom(http.get<{ active: boolean }>('https://localhost:52366/api/AmazonS3/getItems'))
      .then((result) => {
        result.active = true;
        this.wrapperClassName = result.active ? 'show-widget' : 'show-message';
        this.loadPanelVisible = false;
      })
      .catch(() => { });
  }
}
