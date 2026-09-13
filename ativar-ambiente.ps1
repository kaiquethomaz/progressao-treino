# Ativa o ambiente de desenvolvimento portatil (Node + Git no D:)
# Uso: abra o PowerShell nesta pasta e rode:  . .\ativar-ambiente.ps1
# (o ponto antes do caminho eh importante!)

$env:Path = "D:\dev-tools\node;D:\dev-tools\git\cmd;D:\dev-tools\npm-global;" + $env:Path
$env:NPM_CONFIG_CACHE = "D:\dev-tools\npm-cache"

Write-Host ""
Write-Host "Ambiente ativado (tudo rodando do D:, sem tocar no SSD)" -ForegroundColor Green
Write-Host ("  node  " + (node -v)) -ForegroundColor Cyan
Write-Host ("  npm   " + (npm -v)) -ForegroundColor Cyan
Write-Host ("  git   " + (git --version)) -ForegroundColor Cyan
Write-Host ""
