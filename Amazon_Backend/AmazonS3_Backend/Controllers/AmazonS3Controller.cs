using Amazon.S3;
using Amazon.S3.Model;
using AmazonS3_Backend.Providers;
using Microsoft.AspNetCore.Mvc;

namespace AmazonS3Backend.Controllers {
    [Route("api/[controller]")]
    [ApiController]
    public class AmazonS3Controller : ControllerBase {
        AmazonS3Provider provider;
        public AmazonS3Controller(IAmazonS3 client) {
            provider = new AmazonS3Provider(client, Program.BucketName);
        }

        [HttpGet("getItems")]
        public async Task<IActionResult> GetItems(string? path) {
            try {
                var items = await provider.GetItemsAsync(path);
                return Ok(items);
            } catch (Exception ex) {
                throw new Exception(ex.Message);
            }
        }

        [HttpPut("createDirectory")]
        public async Task<IActionResult> CreateDirectory(string? path, string name) {
            try {
                await provider.CreateDirectoryAsync(path, name);
                return Ok();
            } catch (AmazonS3Exception ex) {
                return StatusCode(500, ex.Message);
            }
        }
        [HttpPut("renameItem")]
        public async Task<IActionResult> RenameItem(string key, string? directory, string newName) {
            try {
                await provider.RenameItemAsync(key, directory, newName);
                return Ok();
            } catch (Exception ex) {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("moveItem")]
        public async Task<IActionResult> MoveItem(string sourceKey, string destinationKey) {
            try {
                await provider.MoveItemAsync(sourceKey, destinationKey);
                return Ok();
            } catch (Exception ex) {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("deleteItem")]
        public async Task<IActionResult> DeleteItem(string item) {
            try {
                await provider.DeleteItemAsync(item);
                return Ok();
            } catch (Exception ex) {
                return StatusCode(500, ex.Message);
            }
        }
        [HttpPut("copyItem")]
        public async Task<IActionResult> CopyItem(string sourceKey, string destinationKey) {
            try {
                await provider.CopyItemAsync(sourceKey, destinationKey);
                return Ok();
            } catch (Exception ex) {
                return StatusCode(500, ex.Message);
            }
        }
        [HttpPost("downloadItems")]
        public async Task<IActionResult> DownloadItems([FromBody] string[] keys) {
            try {
                var response = await provider.DownloadItemsAsync(keys);
                // returning file with Content-Disposition header exposed
                return response;
            } catch (Exception ex) {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("initUpload")]
        public async Task<IActionResult> InitUpload(string key) {
            try {
                var uploadId = await provider.InitUploadAsync(key);
                return Ok(uploadId);
            } catch (Exception ex) {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("getPresignedUrl")]
        public async Task<IActionResult> GetPresignedUrl(string uploadId, string key, int partNumber) {
            try {
                var presignedUrl = await provider.GetPresignedUrlAsync(uploadId, key, partNumber);
                return Ok(presignedUrl);
            } catch (Exception ex) {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("getPresignedDownloadUrl")]
        public async Task<IActionResult> GetPresignedDownloadUrl(string key) {
            try {
                var presignedDownloadUrl = await provider.GetPresignedDownloadUrlAsync(key);
                return Ok(presignedDownloadUrl);
            } catch (Exception ex) {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("uploadPart")]
        public async Task<IActionResult> UploadPart([FromForm] IFormFile part, [FromForm] int partNumber, [FromForm] long partSize, [FromForm] string fileName, [FromForm] string uploadId) {
            try {
                using (var filePart = part.OpenReadStream()) {
                    var response = await provider.UploadPartAsync(filePart, partNumber, partSize, fileName, uploadId);
                    // returning result with ETag header exposed
                    return Ok(response.ETag);
                }
            } catch (Exception ex) {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("completeUpload")]
        public async Task<IActionResult> CompleteUpload([FromBody] List<PartETag> parts, string key, string uploadId) {
            try {
                var response = await provider.CompleteUploadAsync(key, uploadId, parts);
                // use response if you need to pass ETag or something else when upload is finished
                return Ok(response.ETag);
            } catch (Exception ex) {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("abortUpload")]
        public async Task<IActionResult> AbortUpload(string uploadId) {
            try {
                var response = await provider.AbortUploadAsync(uploadId);
                // user response if you need to pass something to the client after aborting upload
                return Ok(response.HttpStatusCode);
            } catch (Exception ex) {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
