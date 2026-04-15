param()

$ErrorActionPreference = "Stop"

function Fix-File($path) {
    if (-not (Test-Path -LiteralPath $path)) {
        Write-Host ("[skip] " + $path) -ForegroundColor Yellow
        return
    }

    $content = Get-Content -LiteralPath $path -Raw

    $content = [regex]::Replace($content, '\s*[-]\s*', ' - ')
    $content = [regex]::Replace($content, '\{fmtDate\(project\.startDate(\s*\|\|\s*null)?\)\}\s*.\s*\{fmtDate\(project\.endDate(\s*\|\|\s*null)?\)\}', '{fmtDate(project.startDate || null)} - {fmtDate(project.endDate || null)}')
    $content = [regex]::Replace($content, '<span className="text-gray-400 mx-1">.*?</span>', '<span className="text-gray-400 mx-1">-</span>')

    [System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))

    Write-Host ("[fixed] " + $path) -ForegroundColor Green
}

Write-Host "Fixing date separators..." -ForegroundColor Cyan

Fix-File "components\projects\GroupedProjectCard.tsx"
Fix-File "app\[locale]\our-projects\[slug]\page.tsx"

Write-Host "Done." -ForegroundColor Green