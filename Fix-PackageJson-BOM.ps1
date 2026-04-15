param()

$ErrorActionPreference = "Stop"

function Write-Utf8NoBom($path, $content) {
  [System.IO.File]::WriteAllText(
    (Resolve-Path $path),
    $content,
    [System.Text.UTF8Encoding]::new($false)
  )
}

$path = ".\package.json"
$content = Get-Content -LiteralPath $path -Raw
Write-Utf8NoBom $path $content

Write-Host "package.json rewritten as UTF-8 without BOM." -ForegroundColor Green