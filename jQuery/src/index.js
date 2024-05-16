$(() => {
  const loadPanel = $('#load-panel').dxLoadPanel({
    position: { of: '#file-uploader' },
    visible: true,
  }).dxLoadPanel('instance');

  $.ajax({
    url: 'https://localhost:52366/api/AmazonS3/getItems',
    success(result) {
      result.active = true;
      const className = result.active ? 'show-widget' : 'show-message';
      $('#wrapper').addClass(className);
      loadPanel.hide();
    },
  });

  baseUrl = `https://localhost:52366/api/AmazonS3`;
  amazon = new AmazonFileSystem(baseUrl, onRequestExecuted);

  $('#file-uploader').dxFileUploader({
    chunkSize: 5242880,
    uploadChunk,
    onValueChanged,
    onUploaded,
  });
});

async function onUploaded(e) {
  const url = await amazon.getPresignedDownloadUrl(e.file.name);
  showPresignedUrl(url, e.file.name);
}

function onValueChanged(e) {
  hidePresignedUrl();
}

async function uploadChunk(file, uploadInfo) {
  return await amazon.uploadFileChunk(file, uploadInfo);    
};

function showPresignedUrl(url, fileName) {
  $('<div>')
      .attr('id', 'url-div')
      .append(
        $('<span>').text('Download uploaded file: '),
        $('<a>')
            .attr('href', url)
            .attr('target', '_blank')
            .text(fileName)
      )
      .appendTo('#download-panel');
}

function hidePresignedUrl() {
  $('#url-div').remove();
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
