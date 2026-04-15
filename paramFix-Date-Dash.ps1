param()

$ErrorActionPreference = "Stop"

function Fix-File($path) {
  if (-not (Test-Path $path)) { return }

  $content = Get-Content $path -Raw

  # Replace em dash and broken encoding
  $content = $content -replace "—", "-"
  $content = $content -replace "â€”", "-"

  [System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))

  Write-Host "[fixed] $path" -ForegroundColor Green
}

Write-Host "Fixing date separators..." -ForegroundColor Cyan

Fix-File "components\projects\GroupedProjectCard.tsx"
Fix-File "app\[locale]\our-projects\[slug]\page.tsx"

Write-Host "Done. Dates now use '-' instead of broken dash." -ForegroundColor Green