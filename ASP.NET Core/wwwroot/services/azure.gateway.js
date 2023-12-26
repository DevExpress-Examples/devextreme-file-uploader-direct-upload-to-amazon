class AzureGateway {
  constructor(endpointUrl, onRequestExecuted) {
    this.endpointUrl = endpointUrl;
    this.onRequestExecuted = onRequestExecuted;
  }

  getBlobList(prefix) {
    return this.getAccessUrl('BlobList')
      .then((accessURLs) => this.executeBlobListRequest(accessURLs.url1, prefix))
      .then((xml) => this.parseEntryListResult(xml));
  }

  parseEntryListResult(xmlString) {
    const xml = new DOMParser().parseFromString(xmlString, 'text/xml');
    return Array.from(xml.querySelectorAll('Blob')).map(this.parseEntry);
  }

  parseEntry(xmlEntry) {
    const entry = {};
    entry.etag = xmlEntry.querySelector('Etag').textContent;
    entry.name = xmlEntry.querySelector('Name').textContent;
    const dateStr = xmlEntry.querySelector('Last-Modified').textContent;
    entry.lastModified = new Date(dateStr);
    const lengthStr = xmlEntry.querySelector('Content-Length').textContent;
    entry.length = parseInt(lengthStr, 10);
    return entry;
  }

  executeBlobListRequest(accessURL, prefix) {
    const params = {
      resType: 'container',
      comp: 'list',
    };
    if (prefix) {
      params.prefix = prefix;
    }
    return this.executeRequest(accessURL, params);
  }

  createDirectoryBlob(name) {
    return this.getAccessUrl('CreateDirectory', name).then((accessURLs) => this.executeRequest({
      url: accessURLs.url1,
      method: 'PUT',
      headers: {
        'x-ms-blob-type': 'BlockBlob',
      },
      processData: false,
      contentType: false,
    }));
  }

  deleteBlob(name) {
    return this.getAccessUrl('DeleteBlob', name).then((accessURLs) => this.executeRequest({
      url: accessURLs.url1,
      method: 'DELETE',
    }));
  }

  copyBlob(sourceName, destinationName) {
    return this.getAccessUrl('CopyBlob', sourceName, destinationName).then((accessURLs) => this.executeRequest({
      url: accessURLs.url2,
      method: 'PUT',
      headers: {
        'x-ms-copy-source': accessURLs.url1,
      },
    }));
  }

  putBlock(uploadUrl, blockIndex, blockBlob) {
    const blockId = this.getBlockId(blockIndex);
    const params = {
      comp: 'block',
      blockId,
    };
    return this.executeRequest({
      url: uploadUrl,
      method: 'PUT',
      body: blockBlob,
      processData: false,
      contentType: false,
    }, params);
  }

  putBlockList(uploadUrl, blockCount) {
    const content = this.getBlockListContent(blockCount);
    const params = {
      comp: 'blocklist',
    };
    return this.executeRequest({
      url: uploadUrl,
      method: 'PUT',
      body: content,
    }, params);
  }

  getBlockListContent(blockCount) {
    const contentParts = [
      '<?xml version="1.0" encoding="utf-8"?>',
      '<BlockList>',
    ];
    for (let i = 0; i < blockCount; i += 1) {
      const blockContent = `  <Latest>${this.getBlockId(i)}</Latest>`;
      contentParts.push(blockContent);
    }
    contentParts.push('</BlockList>');
    return contentParts.join('\n');
  }

  getBlockId(blockIndex) {
    let res = `${blockIndex}`;
    while (res.length < 10) {
      res = `0${res}`;
    }
    return window.btoa(res);
  }

  getUploadAccessUrl(blobName) {
    return this.getAccessUrl('UploadBlob', blobName);
  }

  getBlobUrl(blobName) {
    return this.getAccessUrl('GetBlob', blobName);
  }

  getAccessUrl(command, blobName, blobName2) {
    let url = `${this.endpointUrl}?command=${command}`;
    if (blobName) {
      url += `&blobName=${encodeURIComponent(blobName)}`;
    }
    if (blobName2) {
      url += `&blobName2=${encodeURIComponent(blobName2)}`;
    }
    return new Promise((resolve, reject) => {
      this.executeRequest(url).then((x) => {
        if (x.success) {
          resolve({ url1: x.accessUrl, url2: x.accessUrl2 });
        } else {
          reject(x.error);
        }
      });
    });
  }

  executeRequest(args, commandParams) {
    const ajaxArgs = typeof args === 'string' ? { url: args } : args;
    const method = ajaxArgs.method || 'GET';
    const urlParts = ajaxArgs.url.split('?');
    const urlPath = urlParts[0];
    const restQueryString = urlParts[1];
    const commandQueryString = commandParams
      ? this.getQueryString(commandParams)
      : '';
    let queryString = commandQueryString || '';
    if (restQueryString) {
      queryString += queryString ? `&${restQueryString}` : restQueryString;
    }
    ajaxArgs.url = queryString ? `${urlPath}?${queryString}` : urlPath;
    return fetch(ajaxArgs.url, ajaxArgs)
      .then((x) => {
        const eventArgs = {
          method,
          urlPath,
          queryString,
        };
        if (this.onRequestExecuted) {
          this.onRequestExecuted(eventArgs);
        }
        return x;
      })
      .then(async (x) => {
        if (x.status === 200 || x.status === 201) {
          const text = await x.text();
          try {
            return { success: true, ...JSON.parse(text) };
          } catch (ex) {
            return text;
          }
        } else {
          return { error: x.statusText };
        }
      });
  }

  getQueryString(params) {
    return Object.keys(params)
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');
  }
}
