param()

$ErrorActionPreference = "Stop"

function Write-Section($title) {
  Write-Host ""
  Write-Host ("=" * 70) -ForegroundColor DarkGray
  Write-Host $title -ForegroundColor Cyan
  Write-Host ("=" * 70) -ForegroundColor DarkGray
}

function Update-PackageJsonVersion($path, $newVersion) {
  if (-not (Test-Path $path)) {
    Write-Host "[skip] package.json not found" -ForegroundColor Yellow
    return
  }

  $json = Get-Content $path -Raw | ConvertFrom-Json
  $oldVersion = $json.version

  $json.version = $newVersion

  $json | ConvertTo-Json -Depth 10 | Set-Content $path -Encoding UTF8

  Write-Host "[version] $oldVersion → $newVersion" -ForegroundColor Green
}

# --------------------------------------------------

Write-Section "Resolving project root"
$projectRoot = (Get-Location).Path
Write-Host "[root] $projectRoot" -ForegroundColor Green

$packageJsonPath = Join-Path $projectRoot "package.json"
$newVersion = "1.1.0"

Write-Section "Updating version"
Update-PackageJsonVersion $packageJsonPath $newVersion

Write-Section "Ensuring staging branch"
$currentBranch = git branch --show-current

if ($currentBranch -ne "staging") {
  git checkout staging
  Write-Host "[branch] switched to staging" -ForegroundColor Green
} else {
  Write-Host "[branch] already on staging" -ForegroundColor Green
}

Write-Section "Pull latest changes (safe sync)"
git pull origin staging --rebase

Write-Section "Staging changes"
git add .

Write-Section "Committing"
$commitMessage = "release: v1.1.0 - apply links fix, filters cleanup, UI improvements"
git commit -m $commitMessage

Write-Section "Pushing to staging"
git push origin staging

Write-Section "Done"
Write-Host "Version 1.1.0 pushed to staging successfully 🚀" -ForegroundColor Green