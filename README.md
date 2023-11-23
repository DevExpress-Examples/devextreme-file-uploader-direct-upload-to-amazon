<!-- default badges list -->
![](https://img.shields.io/endpoint?url=https://codecentral.devexpress.com/api/v1/VersionRange/722433368/23.1.3%2B)
[![](https://img.shields.io/badge/Open_in_DevExpress_Support_Center-FF7200?style=flat-square&logo=DevExpress&logoColor=white)](https://supportcenter.devexpress.com/ticket/details/T1202400)
[![](https://img.shields.io/badge/📖_How_to_use_DevExpress_Examples-e9f6fc?style=flat-square)](https://docs.devexpress.com/GeneralInformation/403183)
<!-- default badges end -->
# FileUploader for DevExtreme - Direct Upload to Azure

The FileUploader component supports direct-upload to blob storages. This example illustrates how to configure the [uploadChunk](https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxFileUploader/Configuration/#uploadChunk) property to upload a large file directly to Azure Blob Storage without using a user's web server. All APIs that implement access to Azure Blob Storage on the client are stored in the azure.file.system.js file (app.service.ts - for Angular framework).

To implement file upload logic, use the [uploadChunk](https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxFileUploader/Configuration/#uploadChunk) property to specify how to process a connection request to the storage.

## Files to Review

- **jQuery**
    - [index.js](jQuery/src/index.js)
- **Angular**
    - [app.component.html](Angular/src/app/app.component.html)
    - [app.component.ts](Angular/src/app/app.component.ts)
- **Vue**
    - [Home.vue](Vue/src/components/HomeContent.vue)
- **React**
    - [App.tsx](React/src/App.tsx)
- **NetCore**    
    - [Index.cshtml](ASP.NET%20Core/Views/Home/Index.cshtml)

## Documentation

- [FileUploader Overview](https://js.devexpress.com/Angular/Documentation/Guide/UI_Components/FileUploader/Overview/)
- [uploadChunk](https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxFileUploader/Configuration/#uploadChunk)
