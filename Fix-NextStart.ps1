param(
  [int]$Port = 3000,
  [switch]$KillExisting,
  [switch]$UseNextFreePort,
  [switch]$SkipInstall,
  [switch]$SkipBuild,
  [switch]$SkipTypecheck
)

$ErrorActionPreference = "Stop"

function Write-Section($title) {
  Write-Host ""
  Write-Host ("=" * 72) -ForegroundColor DarkGray
  Write-Host $title -ForegroundColor Cyan
  Write-Host ("=" * 72) -ForegroundColor DarkGray
}

function Test-CommandExists($name) {
  return $null -ne (Get-Command $name -ErrorAction SilentlyContinue)
}

function Get-ListeningConnectionByPort([int]$TargetPort) {
  try {
    return Get-NetTCPConnection -LocalPort $TargetPort -State Listen -ErrorAction Stop | Select-Object -First 1
  } catch {
    return $null
  }
}

function Get-ProcessSummaryById([int]$Pid) {
  try {
    return Get-Process -Id $Pid -ErrorAction Stop
  } catch {
    return $null
  }
}

function Get-NextFreePort([int]$StartPort) {
  for ($p = $StartPort; $p -le ($StartPort + 50); $p++) {
    $conn = Get-ListeningConnectionByPort -TargetPort $p
    if (-not $conn) {
      return $p
    }
  }
  throw "No free port found between $StartPort and $($StartPort + 50)."
}

function Stop-ProcessOnPort([int]$TargetPort) {
  $conn = Get-ListeningConnectionByPort -TargetPort $TargetPort
  if (-not $conn) {
    Write-Host "[INFO] No process is listening on port $TargetPort." -ForegroundColor Yellow
    return $false
  }

  $proc = Get-ProcessSummaryById -Pid $conn.OwningProcess
  if ($proc) {
    Write-Host "[INFO] Stopping process on port $TargetPort : $($proc.ProcessName) (PID $($proc.Id))" -ForegroundColor Yellow
  } else {
    Write-Host "[INFO] Stopping unknown process PID $($conn.OwningProcess) on port $TargetPort" -ForegroundColor Yellow
  }

  Stop-Process -Id $conn.OwningProcess -Force -ErrorAction Stop
  Start-Sleep -Seconds 1
  return $true
}

function Invoke-Step($label, [scriptblock]$action) {
  Write-Host "[STEP] $label" -ForegroundColor Magenta
  & $action
  if ($LASTEXITCODE -ne 0) {
    throw "$label failed with exit code $LASTEXITCODE."
  }
}

Write-Section "Searchtool Next.js Start Fix Script"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $projectRoot) {
  $projectRoot = (Get-Location).Path
}

Set-Location $projectRoot
Write-Host "[INFO] Project root: $projectRoot" -ForegroundColor Green

if (-not (Test-Path ".\package.json")) {
  throw "package.json not found in $projectRoot. Put this .ps1 file in the project root."
}

if (-not (Test-CommandExists "node")) {
  throw "Node.js is not installed or not available in PATH."
}
if (-not (Test-CommandExists "npm")) {
  throw "npm is not installed or not available in PATH."
}

Write-Section "Environment Check"
node --version
npm --version

if (-not $SkipInstall) {
  Write-Section "Install Dependencies"
  Invoke-Step "npm install" { npm install }
} else {
  Write-Host "[INFO] Skipping npm install." -ForegroundColor Yellow
}

if (-not $SkipTypecheck) {
  Write-Section "Type Check"
  Invoke-Step "npx tsc --noEmit" { npx tsc --noEmit }
} else {
  Write-Host "[INFO] Skipping TypeScript check." -ForegroundColor Yellow
}

if (-not $SkipBuild) {
  Write-Section "Production Build"
  Invoke-Step "npm run build" { npm run build }
} else {
  Write-Host "[INFO] Skipping build." -ForegroundColor Yellow
}

Write-Section "Port Check"

$selectedPort = $Port
$conn = Get-ListeningConnectionByPort -TargetPort $selectedPort

if ($conn) {
  $proc = Get-ProcessSummaryById -Pid $conn.OwningProcess
  if ($proc) {
    Write-Host "[WARN] Port $selectedPort is already in use by $($proc.ProcessName) (PID $($proc.Id))." -ForegroundColor Yellow
  } else {
    Write-Host "[WARN] Port $selectedPort is already in use by PID $($conn.OwningProcess)." -ForegroundColor Yellow
  }

  if ($KillExisting) {
    Stop-ProcessOnPort -TargetPort $selectedPort | Out-Null
  } elseif ($UseNextFreePort) {
    $selectedPort = Get-NextFreePort -StartPort ($selectedPort + 1)
    Write-Host "[INFO] Using next free port: $selectedPort" -ForegroundColor Green
  } else {
    Write-Host ""
    Write-Host "Port $Port is busy." -ForegroundColor Red
    Write-Host "Run one of these options:" -ForegroundColor Red
    Write-Host "  .\Fix-NextStart.ps1 -KillExisting" -ForegroundColor Gray
    Write-Host "  .\Fix-NextStart.ps1 -UseNextFreePort" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Or inspect the process manually:" -ForegroundColor Red
    Write-Host "  Get-NetTCPConnection -LocalPort $Port -State Listen | Select-Object LocalAddress,LocalPort,OwningProcess" -ForegroundColor Gray
    Write-Host "  Get-Process -Id <PID>" -ForegroundColor Gray
    exit 1
  }
} else {
  Write-Host "[INFO] Port $selectedPort is free." -ForegroundColor Green
}

Write-Section "Start Next.js Production Server"
Write-Host "[INFO] Launching: npx next start -p $selectedPort" -ForegroundColor Green
npx next start -p $selectedPort
