$sourceDir = "c:\Users\Vishnu\OneDrive\Desktop\New folder (4)\vendorpack"
$desktopPath = "c:\Users\Vishnu\OneDrive\Desktop"
$zipFile = Join-Path $desktopPath "CustomerPack-Nobuswork.zip"

if (Test-Path $zipFile) {
    Remove-Item $zipFile -Force
}

$tempDir = Join-Path $env:TEMP ("cp_staging_" + [guid]::NewGuid().ToString().Substring(0, 8))
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

$exclude = @('node_modules', '.next', '.git')

Get-ChildItem -Path $sourceDir | Where-Object { $exclude -notcontains $_.Name } | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination $tempDir -Recurse -Force
}

Compress-Archive -Path "$tempDir\*" -DestinationPath $zipFile -CompressionLevel Optimal -Force

Remove-Item -Path $tempDir -Recurse -Force

$fileInfo = Get-Item $zipFile
$sizeKb = [math]::Round($fileInfo.Length / 1024, 2)
Write-Host "SUCCESS: Created $zipFile ($sizeKb KB)"
