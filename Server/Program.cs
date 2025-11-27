var builder = WebApplication.CreateBuilder(args);

// Add CORS for React frontend
// NOTE: This is a sample app with AllowAll CORS policy for simplicity.
// In production, restrict to specific origins using WithOrigins("http://localhost:5173")
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
});

var app = builder.Build();

// Use CORS
app.UseCors("AllowAll");

// Configure static file serving for frontend dist folder
var frontendPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "frontend", "dist");
if (Directory.Exists(frontendPath))
{
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(frontendPath),
        RequestPath = ""
    });
}
else
{
    Console.WriteLine("Warning: Frontend dist folder not found at " + frontendPath);
}

// Redirect root to index.html
app.MapGet("/", () => Results.Redirect("/index.html"));

app.MapGet("/api/status", () => new
{
    status = "OK",
    message = "Server is running",
    timestamp = DateTime.UtcNow
});

app.MapGet("/api/info", () => new
{
    server = "ASP.NET Core",
    version = "10.0",
    timestamp = DateTime.UtcNow
});

app.MapGet("/api/hello/{name}", (string name) => new
{
    message = $"Hello, {name}!",
    timestamp = DateTime.UtcNow
});

// Fallback route for SPA - serve index.html for any unmatched routes (except API routes)
app.MapFallback(async context =>
{
    // Only serve index.html for non-API routes
    if (!context.Request.Path.StartsWithSegments("/api"))
    {
        var indexPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "frontend", "dist", "index.html");
        if (File.Exists(indexPath))
        {
            context.Response.ContentType = "text/html";
            await context.Response.SendFileAsync(indexPath);
        }
        else
        {
            context.Response.StatusCode = 404;
            await context.Response.WriteAsync("Frontend not built. Run 'npm run build' in the frontend folder.");
        }
    }
});

// Get port from command line args or use 0 (OS assigns random port)
var port = args.Length > 0 && int.TryParse(args[0], out var p) ? p : 0;
// Use 127.0.0.1 instead of localhost for dynamic port binding (port 0)
var host = port == 0 ? "127.0.0.1" : "localhost";
app.Urls.Add($"http://{host}:{port}");

// Use a lifecycle hook to get and print the actual assigned port
app.Lifetime.ApplicationStarted.Register(() =>
{
    var addresses = app.Services.GetRequiredService<Microsoft.AspNetCore.Hosting.Server.IServer>()
        .Features.Get<Microsoft.AspNetCore.Hosting.Server.Features.IServerAddressesFeature>()?.Addresses;

    if (addresses != null && addresses.Any())
    {
        var address = addresses.First();
        // Extract port from address like "http://localhost:12345"
        var uri = new Uri(address);
        Console.WriteLine($"SERVER_PORT:{uri.Port}");
    }
});

Console.WriteLine($"Server starting on http://localhost:{port}");
app.Run();
