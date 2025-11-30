use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};
use std::thread;
use tauri::{Emitter, Manager, State, WebviewWindow};

#[derive(Debug, Serialize, Deserialize)]
struct ServerInfo {
    port: Option<u16>,
    pid: Option<u32>,
}

type ServerState = Arc<Mutex<Option<Child>>>;
type ServerPortState = Arc<Mutex<Option<u16>>>;

#[tauri::command]
async fn get_api_url(port_state: State<'_, ServerPortState>) -> Result<String, String> {
    let port = port_state.lock().unwrap();
    match *port {
        Some(p) => Ok(format!("http://localhost:{}", p)),
        None => Ok("http://localhost:5000".to_string()), // fallback
    }
}

#[tauri::command]
async fn get_server_info(
    server_state: State<'_, ServerState>,
    port_state: State<'_, ServerPortState>,
) -> Result<ServerInfo, String> {
    let server = server_state.lock().unwrap();
    let port = port_state.lock().unwrap();

    let pid = server.as_ref().map(|s| s.id());

    Ok(ServerInfo { port: *port, pid })
}

fn find_server_path() -> Result<PathBuf, String> {
    let current_dir = std::env::current_dir().map_err(|e| e.to_string())?;

    // Try Release first, then Debug
    let release_path = current_dir
        .parent()
        .ok_or("Cannot find parent directory")?
        .join("Server")
        .join("bin")
        .join("Release")
        .join("net10.0")
        .join("Server.dll");

    if fs::metadata(&release_path).is_ok() {
        return Ok(release_path);
    }

    let debug_path = current_dir
        .parent()
        .ok_or("Cannot find parent directory")?
        .join("Server")
        .join("bin")
        .join("Debug")
        .join("net10.0")
        .join("Server.dll");

    if fs::metadata(&debug_path).is_ok() {
        return Ok(debug_path);
    }

    Err(format!(
        "Server not found at {} or {}. Please build the server first.",
        release_path.display(),
        debug_path.display()
    ))
}

fn start_csharp_server(
    server_state: ServerState,
    port_state: ServerPortState,
    window: WebviewWindow,
) -> Result<(), String> {
    let server_path = find_server_path()?;
    let server_dir = server_path.parent().ok_or("Cannot get server directory")?;

    println!("Starting C# server");
    println!("Server path: {}", server_path.display());

    let mut child = Command::new("dotnet")
        .arg(server_path.as_os_str())
        .current_dir(server_dir)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to start server: {}", e))?;

    let stdout = child.stdout.take().ok_or("Failed to capture stdout")?;
    let stderr = child.stderr.take().ok_or("Failed to capture stderr")?;

    // Store the child process
    {
        let mut server = server_state.lock().unwrap();
        *server = Some(child);
    }

    let port_state_clone = Arc::clone(&port_state);
    let window_clone = window.clone();

    // Monitor stdout for port assignment
    thread::spawn(move || {
        use std::io::{BufRead, BufReader};

        let reader = BufReader::new(stdout);
        for line in reader.lines() {
            if let Ok(line) = line {
                println!("Server: {}", line);

                // Look for SERVER_PORT line
                if let Some(port_str) = line.strip_prefix("SERVER_PORT:") {
                    if let Ok(port) = port_str.parse::<u16>() {
                        {
                            let mut port_state = port_state_clone.lock().unwrap();
                            *port_state = Some(port);
                        }
                        println!("Server port assigned: {}", port);

                        // Notify frontend that server is ready
                        let _ = window_clone.emit("server-ready", port);
                        break;
                    }
                }
            }
        }
    });

    // Monitor stderr
    thread::spawn(move || {
        use std::io::{BufRead, BufReader};

        let reader = BufReader::new(stderr);
        for line in reader.lines() {
            if let Ok(line) = line {
                eprintln!("Server Error: {}", line);
            }
        }
    });

    Ok(())
}

fn stop_csharp_server(server_state: ServerState) {
    let mut server = server_state.lock().unwrap();
    if let Some(mut child) = server.take() {
        println!("Stopping C# server...");
        let _ = child.kill();
        let _ = child.wait();
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let server_state: ServerState = Arc::new(Mutex::new(None));
    let port_state: ServerPortState = Arc::new(Mutex::new(None));
    let server_state_clone = Arc::clone(&server_state);
    let port_state_clone = Arc::clone(&port_state);

    tauri::Builder::default()
        .manage(Arc::clone(&server_state))
        .manage(Arc::clone(&port_state))
        .invoke_handler(tauri::generate_handler![get_api_url, get_server_info])
        .setup(move |app| {
            let window = app.get_webview_window("main").unwrap();

            // Start the C# server
            if let Err(e) = start_csharp_server(
                server_state_clone,
                port_state_clone,
                window,
            ) {
                eprintln!("Failed to start C# server: {}", e);
                std::process::exit(1);
            }

            Ok(())
        })
        .on_window_event(move |_window, event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event {
                stop_csharp_server(Arc::clone(&server_state));
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
