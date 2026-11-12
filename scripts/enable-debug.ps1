9..16 | ForEach-Object {
  $p = "HKCU:\Software\Adobe\CSXS.$_"
  New-Item -Path $p -Force | Out-Null
  Set-ItemProperty -Path $p -Name PlayerDebugMode -Value "1" -Type String
}
Write-Host "PlayerDebugMode ativado (CSXS 9-16)."