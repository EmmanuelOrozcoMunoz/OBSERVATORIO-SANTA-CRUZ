# Trae lo que subiÃ³ tu compaÃ±ero, junta tus cambios y los sube.
# Uso:  .\scripts\sincronizar.ps1 "quÃ© cambiaste"
param([string]$Mensaje = "ActualizaciÃ³n")
$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)
git pull --rebase --autostash origin main
git add -A
if (git status --porcelain) { git commit -m $Mensaje }
git push origin main
Write-Host "Listo: GitHub y tu carpeta quedaron iguales."