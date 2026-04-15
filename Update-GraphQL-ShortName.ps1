param()

$ErrorActionPreference = "Stop"

function Write-Section($title) {
  Write-Host ""
  Write-Host ("=" * 72) -ForegroundColor DarkGray
  Write-Host $title -ForegroundColor Cyan
  Write-Host ("=" * 72) -ForegroundColor DarkGray
}

function Find-File($root) {
  $paths = @(
    "lib\projects\loader.ts",
    "lib\projects\fetch.ts",
    "lib\projects\api.ts"
  )

  foreach ($p in $paths) {
    $full = Join-Path $root $p
    if (Test-Path $full) { return $full }
  }

  throw "Could not find GraphQL loader file"
}

function Replace-Content($file) {
  $content = Get-Content $file -Raw

  # safer replace only inside programme block
  $content = $content -replace 'programme\s*\{[^}]*short_name[^}]*\}', 'programme { id short_name_display }'

  Set-Content -Path $file -Value $content -Encoding UTF8
  Write-Host "[patched] $file" -ForegroundColor Green
}

Write-Section "Resolving project root"
$root = (Get-Location).Path
Write-Host $root -ForegroundColor Green

Write-Section "Locating GraphQL query file"
$file = Find-File $root
Write-Host $file -ForegroundColor Yellow

Write-Section "Applying query change"
Replace-Content $file

Write-Section "Done"
Write-Host "Query now uses short_name_display (GV / GTa / GTe)" -ForegroundColor Green
Write-Host ""
Write-Host "Run:"
Write-Host "  npm run build"
