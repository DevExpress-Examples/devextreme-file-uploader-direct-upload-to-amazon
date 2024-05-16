class AmazonGateway {
  defaultHeaders = { 'Content-Type': 'application/json' };

  constructor(baseUrl, onRequestExecuted) {
    this.uploadData = {};
    this.baseUrl = baseUrl;
    this.onRequestExecuted = onRequestExecuted;
  }

  getRequestUrl(methodName) {
    return `${this.baseUrl}/${methodName}`;
  }

  removeUploadData(fileName) {
    delete this.uploadData[fileName];
  }

  initUploadData(fileName, uploadId) {
    this.uploadData[fileName] = { uploadId, parts: [] };
  }

  addPartToUploadData(fileName, part) {
    this.uploadData[fileName].parts.push(part);
  }

  getUploadId(fileName) {
    return this.uploadData[fileName].uploadId;
  }

  getParts(fileName) {
    return this.uploadData[fileName].parts;
  }

  async getItems(key) {
    const params = { 'path': key };
    const requestParams = { method: 'GET' };
    return this.makeRequestAsync('getItems', params, requestParams);
  }

  async renameItem(key, parentPath, name) {
    const params = { 'key': key, 'directory': parentPath, 'newName': name };
    const requestParams = { method: 'PUT' };
    await this.makeRequestAsync('renameItem', params, requestParams);
  }

  async createDirectory(key, name) {
    const params = { 'path': key, 'name': name };
    const requestParams = { method: 'PUT' };
    await this.makeRequestAsync('createDirectory', params, requestParams);
  }

  async deleteItem(key) {
    const params = { 'item': key };
    const requestParams = { method: 'POST' };
    await this.makeRequestAsync('deleteItem', params, requestParams);
  }

  async copyItem(sourceKey, destinationKey) {
    const params = { 'sourceKey': sourceKey, 'destinationKey': destinationKey };
    const requestParams = { method: 'PUT' };
    await this.makeRequestAsync('copyItem', params, requestParams);
  }

  async moveItem(sourceKey, destinationKey) {
    const params = { 'sourceKey': sourceKey, 'destinationKey': destinationKey };
    const requestParams = { method: 'POST' };
    await this.makeRequestAsync('moveItem', params, requestParams);
  }

  async downloadItems(keys) {
    const params = {};
    const requestParams = { method: 'POST', body: JSON.stringify(keys), headers: this.defaultHeaders };
    return this.makeRequestAsync('downloadItems', params, requestParams);
  }

  async uploadPart(fileData, uploadInfo, destinationDirectory) {
    const params = {};
    const key = `${destinationDirectory?.key ?? ''}${fileData.name}`;

    const data = new FormData();
    data.append('part', uploadInfo.chunkBlob);
    data.append('fileName', key);
    data.append('uploadId', this.getUploadId(key));
    data.append('partNumber', uploadInfo.chunkIndex);
    data.append('partSize', uploadInfo.chunkBlob.size);

    const requestOptions = {
      method: 'POST',
      body: data,
    };

    const etag = await this.makeRequestAsync('uploadPart', params, requestOptions);
    // partNumber must be > 0
    this.addPartToUploadData(key, { PartNumber: uploadInfo.chunkIndex + 1, ETag: etag });
  }

  async completeUpload(fileData, uploadInfo, destinationDirectory) {
    const key = `${destinationDirectory?.key ?? ''}${fileData.name}`;
    const params = {
      key,
      uploadId: this.getUploadId(key),
    };
    const requestOptions = {
      method: 'POST',
      headers: this.defaultHeaders,
      body: JSON.stringify(this.getParts(key)),
    };

    await this.makeRequestAsync('completeUpload', params, requestOptions);
    this.removeUploadData(key);
  }

  async initUpload(fileData, destinationDirectory) {
    const params = { key: `${destinationDirectory?.key ?? ''}${fileData.name}` };
    const requestOptions = {
      method: 'POST',
      headers: this.defaultHeaders,
    };

    const uploadId = await this.makeRequestAsync('initUpload', params, requestOptions);
    this.initUploadData(params.key, uploadId);
  }

  /* eslint-disable-next-line spellcheck/spell-checker */
  async getPresignedDownloadUrl(fileName) {
    const params = { key: fileName };
    const requestOptions = {
      method: 'POST',
      headers: this.defaultHeaders,
    };
    return this.makeRequestAsync('getPresignedDownloadUrl', params, requestOptions);
  }

  async makeRequestAsync(method, queryParams, requestParams) {
    const requestUrl = this.getRequestUrl(method);
    const url = new URL(requestUrl);

    Object.keys(queryParams).forEach((key) => url.searchParams.append(key, queryParams[key]));

    if (this.onRequestExecuted) {
      const params = {
        method,
        urlPath: requestUrl,
        queryString: url.toString().replace(requestUrl, ''),
      };
      this.onRequestExecuted(params);
    }

    const response = await fetch(url.toString(), requestParams);

    if (!response.ok) {
      const errorResult = await response.text();
      throw new Error(errorResult.errorText);
    }
    const contentDisposition = response.headers.get('Content-Disposition');
    if (contentDisposition && contentDisposition.includes('attachment')) {
      // processing downloadItems request
      return response.blob();
    }
    const contentType = response.headers.get('Content-Type');
    if (!contentType || contentType.includes('text/plain')) {
      return response.text();
    }
    return response.json();
  }
}
