param([ValidateSet('install','uninstall')][string]$Mode = 'install', [string]$GameFolder)
$ErrorActionPreference = 'Stop'
try {
    if (-not $GameFolder) {
        Add-Type -AssemblyName System.Windows.Forms
        $dialog = New-Object System.Windows.Forms.FolderBrowserDialog
        $dialog.Description = 'Select the Fear & Hunger folder containing www'
        if ($dialog.ShowDialog() -ne 'OK') { exit 0 }
        $GameFolder = $dialog.SelectedPath
    }
    $root = $null
    foreach ($candidate in @($GameFolder, (Join-Path $GameFolder 'www'))) {
        if ((Test-Path -LiteralPath (Join-Path $candidate 'js/plugins.js')) -and
            (Test-Path -LiteralPath (Join-Path $candidate 'data/System.json'))) {
            $root = (Resolve-Path -LiteralPath $candidate).Path
            break
        }
    }
    if (-not $root) { throw 'Game folder not found. Select the folder containing www.' }
    $backup = Join-Path $root '.crow-mauler-backup'
    if ($Mode -eq 'install') {
        if (Test-Path -LiteralPath $backup) { throw 'A Crow Mauler backup already exists. Uninstall it first.' }
        $files = @(Get-Content -LiteralPath (Join-Path $PSScriptRoot 'payload-sha256.tsv') | ForEach-Object {
            $parts = $_ -split "`t", 2
            [PSCustomObject]@{ hash=$parts[0]; file=$parts[1]; existed=$false }
        })
        foreach ($entry in $files) {
            $source = Join-Path (Join-Path $PSScriptRoot 'www') $entry.file
            if ((Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash -ne $entry.hash) { throw "Damaged package: $($entry.file)" }
            $target = Join-Path $root $entry.file
            $entry.existed = Test-Path -LiteralPath $target
            if ($entry.existed -and ((Get-Item -LiteralPath $target).Attributes -band [IO.FileAttributes]::ReparsePoint)) {
                throw "Refusing linked file: $($entry.file)"
            }
        }
        New-Item -ItemType Directory -Path $backup | Out-Null
        foreach ($entry in $files) {
            if ($entry.existed) {
                $saved = Join-Path (Join-Path $backup 'original') $entry.file
                New-Item -ItemType Directory -Force -Path (Split-Path $saved) | Out-Null
                Copy-Item -LiteralPath (Join-Path $root $entry.file) -Destination $saved
            }
        }
        $files | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $backup 'installed.json') -Encoding UTF8
        try {
            foreach ($entry in $files) {
                $target = Join-Path $root $entry.file
                New-Item -ItemType Directory -Force -Path (Split-Path $target) | Out-Null
                Copy-Item -LiteralPath (Join-Path (Join-Path $PSScriptRoot 'www') $entry.file) -Destination $target -Force
            }
            New-Item -ItemType File -Path (Join-Path $backup 'complete') | Out-Null
        } catch {
            foreach ($entry in $files) {
                $target = Join-Path $root $entry.file
                if ($entry.existed) { Copy-Item -LiteralPath (Join-Path (Join-Path $backup 'original') $entry.file) -Destination $target -Force }
                elseif (Test-Path -LiteralPath $target) { Remove-Item -LiteralPath $target }
            }
            throw 'Install failed; originals restored. Backup retained in .crow-mauler-backup.'
        }
        Write-Host 'Installed. Launch the game and choose Crow Mauler on the title screen.'
    } else {
        if (-not (Test-Path -LiteralPath (Join-Path $backup 'complete'))) { throw 'No completed helper installation found. Use manual removal instructions.' }
        $files = @(Get-Content -LiteralPath (Join-Path $backup 'installed.json') -Raw | ConvertFrom-Json)
        foreach ($entry in $files) {
            $target = Join-Path $root $entry.file
            if (-not (Test-Path -LiteralPath $target) -or (Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash -ne $entry.hash) {
                throw "Changed or missing since install: $($entry.file). Restore the installed version or uninstall manually."
            }
            if ($entry.existed -and -not (Test-Path -LiteralPath (Join-Path (Join-Path $backup 'original') $entry.file))) { throw "Backup missing: $($entry.file)" }
        }
        foreach ($entry in $files) {
            $target = Join-Path $root $entry.file
            if ($entry.existed) { Copy-Item -LiteralPath (Join-Path (Join-Path $backup 'original') $entry.file) -Destination $target -Force }
            else { Remove-Item -LiteralPath $target }
        }
        Move-Item -LiteralPath $backup -Destination (Join-Path $root ('.crow-mauler-restored-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + $PID))
        Write-Host 'Uninstalled. Saves untouched. Do not load Mauler saves without the mod.'
    }
} catch {
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
