using System.Net;
using System.Net.Sockets;

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

// Function to get a random available port
static int GetAvailablePort()
{
    using var socket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
    socket.Bind(new IPEndPoint(IPAddress.Loopback, 0));
    return ((IPEndPoint)socket.LocalEndPoint!).Port;
}

// Get port from command line args or find an available port
var port = args.Length > 0 && int.TryParse(args[0], out var p) ? p : GetAvailablePort();
app.Urls.Add($"http://localhost:{port}");

// Output the port to stderr for Electron to parse (to avoid ASP.NET logging interference)
Console.Error.WriteLine($"SERVER_PORT:{port}");
app.Run();
