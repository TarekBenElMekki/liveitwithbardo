param()

$ErrorActionPreference = "Stop"

function Write-Section($title) {
  Write-Host ""
  Write-Host ("=" * 78) -ForegroundColor DarkGray
  Write-Host $title -ForegroundColor Cyan
  Write-Host ("=" * 78) -ForegroundColor DarkGray
}

function Ensure-Directory($path) {
  if (-not (Test-Path -LiteralPath $path)) {
    New-Item -ItemType Directory -Path $path -Force | Out-Null
  }
}

function Write-Utf8NoBom($path, $content) {
  $dir = Split-Path -Parent $path
  if ($dir) { Ensure-Directory $dir }
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
  Write-Host "[written] $path" -ForegroundColor Green
}

Write-Section "Resolving project root"
$projectRoot = (Get-Location).Path
Write-Host "[root] $projectRoot" -ForegroundColor Green

$dataProjectsPath = Join-Path $projectRoot 'data\projects.ts'

Write-Section "Rewriting data/projects.ts as type-only API-compatible file"
$dataProjectsContent = @'
export type SDG =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
  | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17;

export type ProjectCategory = "volunteer" | "talent" | "teaching";

export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  alt: string;
  sdgs: SDG[];
  startDate: string;
  endDate: string;
  city: string;
  category: ProjectCategory;
  isOpen: boolean;
}

/**
 * Static project seed data intentionally disabled.
 * Public project pages should rely on GIS / API-loaded data only.
 */
export const projects: Project[] = [];
'@

Write-Utf8NoBom $dataProjectsPath $dataProjectsContent

Write-Section "Done"
Write-Host "Static project data removed. The app now keeps only project types here and relies on API-loaded projects." -ForegroundColor Green
Write-Host ""
Write-Host "Run next:" -ForegroundColor Cyan
Write-Host "  npm run build" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White