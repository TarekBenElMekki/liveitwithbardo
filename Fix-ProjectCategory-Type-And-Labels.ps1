$ErrorActionPreference = "Stop"

function Write-Section($title) {
  Write-Host ""
  Write-Host ("=" * 78) -ForegroundColor DarkGray
  Write-Host $title -ForegroundColor Cyan
  Write-Host ("=" * 78) -ForegroundColor DarkGray
}

function Ensure-File($path) {
  if (-not (Test-Path -LiteralPath $path)) {
    throw "Missing file: $path"
  }
}

function Write-Utf8NoBom($path, $content) {
  $dir = Split-Path -Parent $path
  if ($dir -and -not (Test-Path -LiteralPath $dir)) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
  }
  [System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))
  Write-Host "[written] $path" -ForegroundColor Green
}

Write-Section "Resolving project root"
$root = (Get-Location).Path
Write-Host "[root] $root" -ForegroundColor Green

$dataProjects = Join-Path $root 'data\projects.ts'
$msgEn = Join-Path $root 'messages\en.json'
$msgFr = Join-Path $root 'messages\fr.json'
$msgAr = Join-Path $root 'messages\ar.json'

Ensure-File $dataProjects
Ensure-File $msgEn

Write-Section "Updating shared ProjectCategory type"
$dataProjectsContent = Get-Content -LiteralPath $dataProjects -Raw
$dataProjectsContent = $dataProjectsContent.Replace(
  'export type ProjectCategory = "volunteer" | "internship" | "cultural";',
  'export type ProjectCategory = "volunteer" | "talent" | "teaching";'
)
Write-Utf8NoBom $dataProjects $dataProjectsContent

Write-Section "Updating English project labels"
$en = Get-Content -LiteralPath $msgEn -Raw
$en = $en.Replace('"metaDesc": "Browse volunteer, internship, and cultural exchange opportunities across Tunisia. Filter by SDG, city, and dates to find your match."', '"metaDesc": "Browse volunteer, talent, and teaching opportunities across Tunisia. Filter by SDG, city, and dates to find your match."')
$en = $en.Replace('"heroSubtitle": "Browse volunteer, internship, and cultural exchange opportunities across Tunisia. Filter by SDG, city, and dates to find your match."', '"heroSubtitle": "Browse volunteer, talent, and teaching opportunities across Tunisia. Filter by SDG, city, and dates to find your match."')
$en = $en.Replace('"internship": "Internship"', '"talent": "Talent"')
$en = $en.Replace('"cultural": "Cultural"', '"teaching": "Teaching"')
Write-Utf8NoBom $msgEn $en

if (Test-Path -LiteralPath $msgFr) {
  Write-Section "Updating French project labels"
  $fr = Get-Content -LiteralPath $msgFr -Raw
  $fr = $fr.Replace('"internship": "Stage"', '"talent": "Talent"')
  $fr = $fr.Replace('"cultural": "Culturel"', '"teaching": "Teaching"')
  Write-Utf8NoBom $msgFr $fr
}

if (Test-Path -LiteralPath $msgAr) {
  Write-Section "Updating Arabic project labels"
  $ar = Get-Content -LiteralPath $msgAr -Raw
  $ar = $ar.Replace('"internship": "تدريب"', '"talent": "Talent"')
  $ar = $ar.Replace('"cultural": "ثقافي"', '"teaching": "Teaching"')
  Write-Utf8NoBom $msgAr $ar
}

Write-Section "Done"
Write-Host "ProjectCategory, filters, and UI labels now align to volunteer / talent / teaching." -ForegroundColor Green
Write-Host ""
Write-Host "Run next:" -ForegroundColor Cyan
Write-Host "  npm run build" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
