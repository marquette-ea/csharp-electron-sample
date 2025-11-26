var builder = WebApplication.CreateBuilder(args);

// Add CORS for React frontend
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

// Get port from command line args or use 5000 as default
var port = args.Length > 0 && int.TryParse(args[0], out var p) ? p : 5000;
app.Urls.Add($"http://localhost:{port}");

Console.WriteLine($"Server starting on http://localhost:{port}");
app.Run();
