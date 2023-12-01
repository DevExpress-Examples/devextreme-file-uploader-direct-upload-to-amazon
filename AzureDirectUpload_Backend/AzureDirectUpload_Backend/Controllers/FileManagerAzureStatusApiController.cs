using AzureDirectUpload_Backend.Azure;
using Microsoft.AspNetCore.Mvc;

namespace AzureDirectUpload_Backend.Controllers
{
    public class FileAzureStatusApiController : Controller
    {
        [HttpGet]
        [Route("api/file-azure-status", Name = "FileAzureApiStatus")]
        public IActionResult Get(string widgetType) {
            AzureStorageAccount account = widgetType == "fileManager"
                ? AzureStorageAccount.FileManager : AzureStorageAccount.FileUploader;

            bool active = !account.IsEmpty();
            var result = new {
                active = active
            };
            return Ok(result);
        }
    }
}
