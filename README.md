<!-- default badges list -->
![](https://img.shields.io/endpoint?url=https://codecentral.devexpress.com/api/v1/VersionRange/800447205/23.1.3%2B)
[![](https://img.shields.io/badge/Open_in_DevExpress_Support_Center-FF7200?style=flat-square&logo=DevExpress&logoColor=white)](https://supportcenter.devexpress.com/ticket/details/T1233410)
[![](https://img.shields.io/badge/📖_How_to_use_DevExpress_Examples-e9f6fc?style=flat-square)](https://docs.devexpress.com/GeneralInformation/403183)
<!-- default badges end -->
# FileUploader for DevExtreme - Direct Upload to Amazon

The FileUploader component supports direct-upload to Amazon Simple Storage Service. This example illustrates how to configure the [uploadChunk](https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxFileUploader/Configuration/#uploadChunk) property to upload a large file directly to Amazon Simple Storage Service (S3) without using a user's web server. All APIs that implement access to Amazon Simple Storage Service (S3) on the client are stored in the amazon.file.system.js and amazon.gateway.js files.

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

## More Examples

- [FileManager for DevExtreme - Amazon S3 Client-Side Binding](https://github.com/DevExpress-Examples/devextreme-file-manager-amazon-client-side-binding)
- [FileManager for DevExtreme - Azure Client-Side Binding](https://github.com/DevExpress-Examples/devextreme-file-manager-azure-client-side-binding)
- [FileManager for DevExtreme - Azure Server-Side Binding](https://github.com/DevExpress-Examples/devextreme-file-manager-azure-server-side-binding)
- [FileUploader for DevExtreme - Direct Upload to Azure](https://github.com/DevExpress-Examples/devextreme-file-uploader-direct-upload-to-azure)
