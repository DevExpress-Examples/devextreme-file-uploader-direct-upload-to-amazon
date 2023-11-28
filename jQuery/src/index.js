$(() => {
  const endpointUrl = 'https://localhost:7021/api/file-uploader-azure-access';
  gateway = new AzureGateway(endpointUrl, onRequestExecuted);

  $('#file-uploader').dxFileUploader({
    chunkSize: 200000,
    maxFileSize: 1048576,
    uploadChunk,
  });
});

function uploadChunk(file, uploadInfo) {
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
}

function onRequestExecuted(e) {
  $('<div>').addClass('request-info').append(
    createParameterInfoDiv('Method:', e.method),
    createParameterInfoDiv('Url path:', e.urlPath),
    createParameterInfoDiv('Query string:', e.queryString),
    $('<br>'),
  )
    .prependTo('#request-panel');
}

function createParameterInfoDiv(name, value) {
  return $('<div>').addClass('parameter-info').append(
    $('<div>').addClass('parameter-name').text(name),
    $('<div>').addClass('parameter-value dx-theme-accent-as-text-color').text(value).attr('title', value),
  );
}

let gateway = null;