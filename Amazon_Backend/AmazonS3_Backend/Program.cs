using Amazon;
using Amazon.Runtime;
using Amazon.S3;

namespace AmazonS3Backend {
    public class Program {
        public static string BucketName { get; set; } = string.Empty;

        public static void Main(string[] args) {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddCors(options => options.AddPolicy("CorsPolicy", builder => {
                builder
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .SetIsOriginAllowed(_ => true)
                    .AllowCredentials()
                    // required to expose Content-Disposition and ETag headers
                    .WithExposedHeaders(new string[] { "Content-Disposition", "ETag"});
            }));

            builder.Services.AddControllers();

            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            // If Region is us-east-1, and server-side encryption with AWS KMS, we must specify Signature Version 4.
            // https://docs.aws.amazon.com/AmazonS3/latest/userguide/example_s3_Scenario_PresignedUrl_section.html
            AWSConfigsS3.UseSignatureVersion4 = true;

            var awsOptions = builder.Configuration.GetAWSOptions();
            var accessKey = builder.Configuration.GetValue<string>("AWS:AccessKey");
            var secretKey = builder.Configuration.GetValue<string>("AWS:SecretKey");
            var region = builder.Configuration.GetValue<string>("AWS:Region");
            BucketName = builder.Configuration.GetValue<string>("AWS:Bucket")!;

            awsOptions.Credentials = new BasicAWSCredentials(accessKey, secretKey);
            
            awsOptions.Region = RegionEndpoint.GetBySystemName(region);
            

            builder.Services.AddDefaultAWSOptions(awsOptions);
            
            builder.Services.AddAWSService<IAmazonS3>();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment()) {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseCors("CorsPolicy");

            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
