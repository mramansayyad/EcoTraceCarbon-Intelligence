# Setup portable JDK 21 for Firebase Emulator Suite (non-admin, local to project)
$JdkUrl = "https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.3%2B9/OpenJDK21U-jdk_x64_windows_hotspot_21.0.3_9.zip"
$ZipPath = Join-Path $PSScriptRoot "jdk21_v2.zip"
$ExtractPath = Join-Path $PSScriptRoot "..\.jdk21"

Write-Host "Checking for local JDK 21..." -ForegroundColor Cyan

if (-not (Test-Path $ExtractPath)) {
    Write-Host "Local JDK 21 not found. Downloading portable JDK 21 (approx 200MB)..." -ForegroundColor Yellow
    
    # Download using curl.exe
    curl.exe -L -o $ZipPath $JdkUrl
    
    if (-not (Test-Path $ZipPath) -or (Get-Item $ZipPath).Length -lt 1MB) {
        Write-Error "Failed to download JDK 21 zip. Please verify internet connection."
        Exit 1
    }
    
    Write-Host "Extracting JDK 21 to local project directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path $ExtractPath | Out-Null
    
    # Extract
    Expand-Archive -Path $ZipPath -DestinationPath $ExtractPath -Force
    
    # Cleanup zip
    Remove-Item $ZipPath -Force
    
    # Locate bin directory (it extracts into a subfolder e.g. jdk-21.0.3+9)
    $SubDirs = Get-ChildItem $ExtractPath -Directory
    if ($SubDirs.Count -eq 1) {
        # Move files up one level to make it clean
        $SubDir = $SubDirs[0].FullName
        Get-ChildItem $SubDir | Move-Item -Destination $ExtractPath -Force
        Remove-Item $SubDir -Force
    }
    
    Write-Host "JDK 21 installed successfully to local folder: $ExtractPath" -ForegroundColor Green
} else {
    Write-Host "JDK 21 already installed locally at: $ExtractPath" -ForegroundColor Green
}

# Instruct user on how to run emulators with this portable JDK
$JavaBinPath = Join-Path $ExtractPath "bin"
Write-Host "`nTo start the firebase emulator using this JDK 21, run the following in your terminal:" -ForegroundColor Cyan
Write-Host "--------------------------------------------------------" -ForegroundColor White
Write-Host "`$env:JAVA_HOME = '$ExtractPath'" -ForegroundColor Yellow
Write-Host "`$env:PATH = '$JavaBinPath;' + `$env:PATH" -ForegroundColor Yellow
Write-Host "npx firebase emulators:start --project virtual-promptwars-492614" -ForegroundColor Yellow
Write-Host "--------------------------------------------------------" -ForegroundColor White
