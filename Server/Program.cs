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

// Minimal API endpoints
app.MapGet("/", () => new { message = "C# ASP.NET Server Running", status = "ok" });

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
