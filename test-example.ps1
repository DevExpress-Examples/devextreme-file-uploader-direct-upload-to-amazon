param (
    [string]$version = "latest"
)
if (-not $env:buildVersion) {
    $global:buildVersion = "24.1.7"
} else {
    $global:buildVersion = $env:buildVersion
}
Write-Host "Build: $buildVersion"
$global:errorCode = 0

function Process-JavaScriptProjects {
    param (
        [string]$Path = ".",
        [hashtable[]]$Folders = @(
            @{ Name = "jQuery"; Packages = @("devextreme", "devextreme-dist") },
            @{ Name = "Angular"; Packages = @("devextreme", "devextreme-angular") },
            @{ Name = "Vue"; Packages = @("devextreme", "devextreme-vue") },
            @{ Name = "React"; Packages = @("devextreme", "devextreme-react") }
        )
    )
    Write-Host "Processing JavaScript Projects"

    foreach ($folder in $Folders) {
        if (-not (Test-Path $($folder.Name))) {
            Write-Host "Directory $($folder.Name) does not exist. Skipping..."
            continue
        }

        Write-Host "`nProcessing folder: $($folder.Name)"
        
        Set-Location $($folder.Name)

        Write-Host "`nUpdating packages..."
        foreach ($package in $($folder.Packages)) {
            $command = "npm install $package@$global:buildVersion --save"
            Write-Output "Running: $command"
            Invoke-Expression $command
        }

        Write-Host "Running 'npm install' in $($folder.Name)"
        $installResult = & npm install --loglevel=error -PassThru
        if ($LASTEXITCODE -ne 0) {
            Write-Error "npm install failed in $($folder.Name)"
            $global:errorCode = 1
        }

        Write-Host "Running 'npm run build' in $($folder.Name)"
        $buildResult = & npm run build
        if ($LASTEXITCODE -ne 0) {
            Write-Error "npm run build failed in $($folder.Name)"
            $global:errorCode = 1
        }

        Set-Location ..
    }
}

function Process-DotNetProjects {
    param (
        [string]$RootDirectory = "."
    )
    Write-Host "`nProcessing .NET Projects"

    $slnFiles = Get-ChildItem -Path $RootDirectory -Filter *.sln -Recurse -Depth 1

    if ($slnFiles.Count -eq 0) {
        Write-Host "No solution files (.sln) found in the specified directory at level 1."
        $global:errorCode = 1
        return
    }

    foreach ($slnFile in $slnFiles) {
        Write-Host "Found solution file: $($slnFile.FullName)"
        
        dotnet build $slnFile.FullName -c Release

        if ($LASTEXITCODE -eq 0) {
            Write-Host "Build succeeded for $($slnFile.FullName)."
        } else {
            Write-Error "Build failed for $($slnFile.FullName)."
            $global:errorCode = 1
        }
    }
} 

Write-Host "Version: $global:buildVersion"
Process-JavaScriptProjects
Process-DotNetProjects

Write-Host "Error code: $global:errorCode"

exit $global:errorCode
