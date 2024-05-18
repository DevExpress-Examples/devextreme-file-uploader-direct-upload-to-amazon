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

  logRequest(method, url, requestUrl) {
    if (!this.onRequestExecuted) {
      return;
    }
    const params = {
      method,
      urlPath: requestUrl,
      queryString: url.toString().replace(requestUrl, ''),
    };
    this.onRequestExecuted(params);
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

  getItems(key) {
    const params = { 'path': key };
    const requestParams = { method: 'GET' };
    return this.makeRequest('getItems', params, requestParams);
  }

  renameItem(key, parentPath, name) {
    const params = { 'key': key, 'directory': parentPath, 'newName': name };
    const requestParams = { method: 'PUT' };
    return this.makeRequest('renameItem', params, requestParams);
  }

  createDirectory(key, name) {
    const params = { 'path': key, 'name': name };
    const requestParams = { method: 'PUT' };
    return this.makeRequest('createDirectory', params, requestParams);
  }

  async deleteItem(key) {
    const params = { 'item': key };
    const requestParams = { method: 'POST' };
    await this.makeRequest('deleteItem', params, requestParams);
  }

  async copyItem(sourceKey, destinationKey) {
    const params = { 'sourceKey': sourceKey, 'destinationKey': destinationKey };
    const requestParams = { method: 'PUT' };
    await this.makeRequest('copyItem', params, requestParams);
  }

  async moveItem(sourceKey, destinationKey) {
    const params = { 'sourceKey': sourceKey, 'destinationKey': destinationKey };
    const requestParams = { method: 'POST' };
    await this.makeRequest('moveItem', params, requestParams);
  }

  async downloadItems(keys) {
    const params = {};
    const requestParams = { method: 'POST', body: JSON.stringify(keys), headers: this.defaultHeaders };
    return this.makeRequest('downloadItems', params, requestParams);
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

    const etag = await this.makeRequest('uploadPart', params, requestOptions);
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

    await this.makeRequest('completeUpload', params, requestOptions);
    this.removeUploadData(key);
  }

  async initUpload(fileData, destinationDirectory) {
    const params = { key: `${destinationDirectory?.key ?? ''}${fileData.name}` };
    const requestOptions = {
      method: 'POST',
      headers: this.defaultHeaders,
    };

    const uploadId = await this.makeRequest('initUpload', params, requestOptions);
    this.initUploadData(params.key, uploadId);
  }

  async abortFileUpload(fileData, uploadInfo, destinationDirectory) {
    const key = `${destinationDirectory?.key ?? ''}${fileData.name}`;
    const uploadId = this.getUploadId(fileData.name);
    const params = { uploadId, key };
    const requestOptions = {
      method: 'POST',
      headers: this.defaultHeaders,
    };
    return this.makeRequest('abortUpload', params, requestOptions);
  }

  /* eslint-disable-next-line spellcheck/spell-checker */
  async getPresignedDownloadUrl(fileName) {
    const params = { key: fileName };
    const requestOptions = {
      method: 'POST',
      headers: this.defaultHeaders,
    };
    return this.makeRequest('getPresignedDownloadUrl', params, requestOptions);
  }

  async makeRequest(method, queryParams, requestParams) {
    const requestUrl = this.getRequestUrl(method);
    const url = new URL(requestUrl);

    Object.keys(queryParams).forEach((key) => url.searchParams.append(key, queryParams[key]));
    this.logRequest(method, url, requestUrl);

    try {
      const response = await fetch(url.toString(), requestParams);
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      }
      return await this.getResponseData(response);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getResponseData(response) {
    if (this.containsAttachment(response)) {
      return response.blob();
    }
    if (this.containsPlainText(response)) {
      return response.text();
    }
    return response.json();
  }

  containsAttachment(response) {
    const contentDisposition = response.headers.get('Content-Disposition');
    if (contentDisposition && contentDisposition.includes('attachment')) {
      return true;
    }
    return false;
  }

  containsPlainText(response) {
    const contentType = response.headers.get('Content-Type');
    if (!contentType || contentType.includes('text/plain')) {
      return true;
    }
    return false;
  }
}
