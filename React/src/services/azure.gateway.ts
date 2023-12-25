import {
  FileEntry, AccessUrls, AzureResponse, CommandParams, isUrlResponse, RequestParams, AzureObject,
} from './app.service.types';

export class AzureGateway {
  endpointUrl: string;

  onRequestExecuted: Function | undefined;

  constructor(endpointUrl: string, onRequestExecuted?: Function) {
    this.endpointUrl = endpointUrl;
    this.onRequestExecuted = onRequestExecuted;
  }

  getBlobList(prefix: string): Promise<FileEntry[]> {
    return this.getAccessUrl('BlobList')
      .then((accessUrls: AccessUrls) => this.executeBlobListRequest(accessUrls.url1 ?? '', prefix))
      .then((xml) => {
        if (typeof xml === 'string') return this.parseEntryListResult(xml);
        return [];
      });
  }

  parseEntryListResult(xmlString: string): FileEntry[] {
    var xml = new DOMParser().parseFromString(xmlString, 'text/xml');
    return Array.from(xml.querySelectorAll('Blob')).map(this.parseEntry);
  }

  parseEntry(xmlEntry: Element): FileEntry {
    const entry: FileEntry = {
      etag: '',
      name: '',
      lastModified: undefined,
      length: 0,
    };

    entry.etag = xmlEntry.querySelector('Etag')?.textContent;
    entry.name = xmlEntry.querySelector('Name')?.textContent;

    const dateStr = xmlEntry.querySelector('Last-Modified')?.textContent;
    if (dateStr) entry.lastModified = new Date(dateStr);

    const lengthStr = xmlEntry.querySelector('Content-Length')?.textContent;
    if (lengthStr) entry.length = parseInt(lengthStr, 10);

    return entry;
  }

  executeBlobListRequest(accessUrl: string, prefix: string): Promise<AzureResponse> {
    const params: CommandParams = {
      restype: 'container',
      comp: 'list',
    };
    if (prefix) {
      params.prefix = prefix;
    }
    return this.executeRequest(accessUrl, params);
  }

  createDirectoryBlob(name: string): Promise<AzureResponse> {
    return this.getAccessUrl('CreateDirectory', name).then((accessUrls: AccessUrls) => this.executeRequest({
      url: accessUrls.url1,
      method: 'PUT',
      headers: {
        'x-ms-blob-type': 'BlockBlob',
      },
      processData: false,
      contentType: false,
    }));
  }

  deleteBlob(name: string): Promise<AzureResponse> {
    return this.getAccessUrl('DeleteBlob', name).then((accessUrls: AccessUrls) => this.executeRequest({
      url: accessUrls.url1,
      method: 'DELETE',
    }));
  }

  copyBlob(sourceName: string, destinationName: string): Promise<AzureResponse> {
    return this.getAccessUrl('CopyBlob', sourceName, destinationName).then((accessUrls: AccessUrls) => this.executeRequest({
      url: accessUrls.url2,
      method: 'PUT',
      headers: {
        'x-ms-copy-source': accessUrls.url1 ?? '',
      },
    }));
  }

  putBlock(uploadUrl: string, blockIndex: number, blockBlob: Blob): Promise<AzureResponse> {
    const blockId = this.getBlockId(blockIndex);
    const params: CommandParams = {
      comp: 'block',
      blockid: blockId,
    };
    return this.executeRequest(
      {
        url: uploadUrl,
        method: 'PUT',
        body: blockBlob,
        processData: false,
        contentType: false,
      },
      params,
    );
  }

  putBlockList(uploadUrl: string, blockCount: number): Promise<AzureResponse> {
    const content = this.getBlockListContent(blockCount);
    const params: CommandParams = {
      comp: 'blocklist',
    };
    return this.executeRequest(
      {
        url: uploadUrl,
        method: 'PUT',
        body: content,
      },
      params,
    );
  }

  getBlockListContent(blockCount: number): string {
    const contentParts = ['<?xml version="1.0" encoding="utf-8"?>', '<BlockList>'];

    for (let i = 0; i < blockCount; i++) {
      let blockContent = `  <Latest>${this.getBlockId(i)}</Latest>`;
      contentParts.push(blockContent);
    }

    contentParts.push('</BlockList>');
    return contentParts.join('\n');
  }

  getBlockId(blockIndex: number): string {
    let res = `${blockIndex}`;
    while (res.length < 10) {
      res = `0${res}`;
    }
    return window.btoa(res);
  }

  getUploadAccessUrl(blobName: string): Promise<AccessUrls> {
    return this.getAccessUrl('UploadBlob', blobName);
  }

  getBlobUrl(blobName: string): Promise<AccessUrls> {
    return this.getAccessUrl('GetBlob', blobName);
  }

  getAccessUrl(command: string, blobName?: string, blobName2?: string): Promise<AccessUrls> {
    let url = `${this.endpointUrl}?command=${command}`;
    if (blobName) {
      url += `&blobName=${encodeURIComponent(blobName)}`;
    }
    if (blobName2) {
      url += `&blobName2=${encodeURIComponent(blobName2)}`;
    }

    return new Promise((resolve, reject) => {
      this.executeRequest(url)
        .then((x: AzureResponse) => {
          if (isUrlResponse(x)) {
            if (x.success) {
              resolve({ url1: x.accessUrl, url2: x.accessUrl2 });
            } else {
              reject(x.error);
            }
          } else { reject(new Error('wrong response type')); }
        })
        .catch(() => reject(new Error('failed to load data')));
    });
  }

  async executeRequest(args: RequestParams | string, commandParams?: CommandParams): Promise<AzureResponse> {
    const ajaxArgs = typeof args === 'string' ? { url: args } : args;

    const method = ajaxArgs.method ?? 'GET';

    const urlParts = ajaxArgs.url?.split('?');
    const urlPath = urlParts ? urlParts[0] : '';
    const restQueryString = urlParts ? urlParts[1] : '';
    const commandQueryString = commandParams ? this.getQueryString(commandParams) : '';

    let queryString = commandQueryString ?? '';
    if (restQueryString) {
      queryString = queryString ? `${queryString}&${restQueryString}` : restQueryString;
    }

    ajaxArgs.url = queryString ? `${urlPath}?${queryString}` : urlPath;

    const response = await fetch(ajaxArgs.url, ajaxArgs);
    const eventArgs = {
      method,
      urlPath,
      queryString,
    };
    if (this.onRequestExecuted) {
      this.onRequestExecuted(eventArgs);
    }
    if (response.status === 200 || response.status === 201) {
      const text = await response.text();
      try {
        return { success: true, ...JSON.parse(text) } as AzureObject;
      } catch (ex) {
        return text;
      }
    } else {
      return Promise.reject(new Error(response.statusText));
    }
  }

  getQueryString(params: CommandParams): string {
    return Object.keys(params)
      .map((key) => `${key}=${encodeURIComponent(params[key as keyof CommandParams] ?? '')}`)
      .join('&');
  }
}
