$ErrorActionPreference = "Stop"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Fix Programme Display And Encoding" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

$files = @(
  "app/admin/projects-data/page.tsx",
  "app/api/admin/projects-data/export/route.ts"
)

foreach ($file in $files) {
  if (Test-Path -LiteralPath $file) {
    Write-Host "[Processing] $file" -ForegroundColor Yellow

    $content = Get-Content -LiteralPath $file -Raw

    # Fix mojibake fallback text
    $content = $content.Replace("â€”", "-")
    $content = $content.Replace("—", "-")

    # Prefer short_name_display when available
    $content = $content.Replace(
      'opp.programme?.short_name ?? "-"',
      'opp.programme?.short_name_display ?? opp.programme?.short_name ?? "-"'
    )
    $content = $content.Replace(
      'opp.programme?.short_name ?? ""',
      'opp.programme?.short_name_display ?? opp.programme?.short_name ?? ""'
    )

    # Fix programmeById mapping in page / export
    $content = $content.Replace(
      'raw.map((opp) => [String(opp.id), opp.programme?.short_name ?? "—"])',
      'raw.map((opp) => [String(opp.id), opp.programme?.short_name_display ?? opp.programme?.short_name ?? "-"])'
    )
    $content = $content.Replace(
      'raw.map((opp) => [String(opp.id), opp.programme?.short_name ?? "-"])',
      'raw.map((opp) => [String(opp.id), opp.programme?.short_name_display ?? opp.programme?.short_name ?? "-"])'
    )
    $content = $content.Replace(
      'raw.map((opp) => [String(opp.id), opp.programme?.short_name ?? ""])',
      'raw.map((opp) => [String(opp.id), opp.programme?.short_name_display ?? opp.programme?.short_name ?? ""])'
    )

    # Fix transformed id lookup opp-123 -> 123
    $content = $content.Replace(
      'programmeById.get(String(p.id)) ?? "—"',
      'programmeById.get(String(p.id).replace(''opp-'', '''')) ?? "-"'
    )
    $content = $content.Replace(
      'programmeById.get(String(p.id)) ?? "-"',
      'programmeById.get(String(p.id).replace(''opp-'', '''')) ?? "-"'
    )
    $content = $content.Replace(
      'programmeById.get(String(project.id)) ?? ""',
      'programmeById.get(String(project.id).replace(''opp-'', '''')) ?? ""'
    )

    Set-Content -LiteralPath $file -Value $content -Encoding UTF8
    Write-Host "[Fixed] $file" -ForegroundColor Green
  }
  else {
    Write-Host "[Missing] $file" -ForegroundColor Red
  }
}

Write-Host ""
Write-Host "Done. Now run:" -ForegroundColor Cyan
Write-Host "npm run build" -ForegroundColor White
Write-Host "npm run dev" -ForegroundColor White
