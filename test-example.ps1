$global:inputVersion = $env:branchName
$global:errorCode = 0

$global:allVersions = @(
    "14.1", "14.2",
    "15.1", "15.2",
    "16.1", "16.2",
    "17.1", "17.2",
    "18.1", "18.2",
    "19.1", "19.2",
    "20.1", "20.2",
    "21.1", "21.2",
    "22.1", "22.2",
    "23.1", "23.2",
    "24.1", "24.2",
    "25.1", "25.2" 
)

function Process-JavaScriptProjects {
    param (
        [string]$buildVersion
    )
    Write-Output "`n--== Processing JavaScript Projects ==--"

    [hashtable[]]$folders = @(
        @{ Name = "Angular"; Packages = @("devextreme-angular", "devextreme") },
        @{ Name = "React"; Packages = @("devextreme-react", "devextreme") },
        @{ Name = "Vue"; Packages = @("devextreme-vue", "devextreme") }
    )

    $jQueryEntry = @{
        Name = "jQuery";
        Packages = if ([double]$buildVersion -ge 23.1) { # `devextreme-dist` appeared in 23.1
            @("devextreme-dist", "devextreme")
        } else {
            @("devextreme")
        }
    }

    $folders = @($jQueryEntry) + $folders

    foreach ($folder in $folders) {
        if (-not (Test-Path $($folder.Name))) {
            Write-Output "`nDirectory $($folder.Name) does not exist. Skipping..."
            continue
        }

        Write-Output "`n<-- Processing folder: $($folder.Name) -->"
        
        Set-Location $($folder.Name)

		$packages = $folder.Packages | ForEach-Object { "$_@$buildVersion" }

		$packageList = $packages -join " "

        Write-Output "`nInstalling DevExtreme packages"
        npm install $packageList --save --save-exact --no-fund
        if (-not $?) {
            Write-Error "`nERROR: Failed to install DevExtreme packages: $($folder.Name)"
            $global:LASTEXITCODE = 1
            $global:errorCode = 1
        }

        Write-Output "`nInstalling the rest of the packages $($folder.Name)"
        npm install --save --save-exact --no-fund --loglevel=error
        if (-not $?) {
            Write-Error "`nERROR: Failed to install packages: $($folder.Name)"
            $global:LASTEXITCODE = 1
            $global:errorCode = 1
        }

        Write-Output "`nBuilding the project with 'npm run build' $($folder.Name)"
        npm run build
        if (-not $?) {
            Write-Error "`nERROR: Failed to build the project: $($folder.Name)"
            $global:LASTEXITCODE = 1
            $global:errorCode = 1
        }

        Set-Location ..
    }
}

function Process-DotNetProjects {
    param (
        [string]$RootDirectory = "."
    )
    Write-Output "`nProcessing .NET projects"

    $slnFiles = Get-ChildItem -Path $RootDirectory -Filter *.sln -Recurse -Depth 1

    if ($slnFiles.Count -eq 0) {
        Write-Output "`nNo solution files (.sln) found in the specified directory at level 1."        
        return
    }

    foreach ($slnFile in $slnFiles) {
        Write-Output "`nFound solution file: $($slnFile.FullName)"
        
        dotnet build $slnFile.FullName -c Release

        if ($?) {
            Write-Output "`nBuild succeeded for $($slnFile.FullName)."
        } else {
            Write-Error "`nBuild failed for $($slnFile.FullName)."
            $global:LASTEXITCODE = 1
            $global:errorCode = 1
        }
    }
} 

function Set-BuildVersion {
    $BUILD_VERSIONS_LIST = "BUILD_VERSIONS_LIST"

    $inputMajorMinor = $global:inputVersion -replace "\.\d+\+$", ""

    $filteredList = $global:allVersions | Where-Object {
        ($_ -replace "\." -as [double]) -ge ($inputMajorMinor -replace "\." -as [double])
    }

    $currentValue = [Environment]::GetEnvironmentVariable($BUILD_VERSIONS_LIST, [EnvironmentVariableTarget]::Machine)

    $currentList = if ($currentValue) {
        $currentValue -split ";"
    } else {
        $filteredList
    }

    if ($currentList.Count -gt 1) {
        $inputMajorMinor = $currentList[0]
        $updatedList = $currentList[1..($currentList.Count - 1)]
    } else {
        Write-Output "`nThe list in the environment variable has only one item."
        $inputMajorMinor = $currentList
        $updatedList = ""
    }

    $global:buildVersion = $inputMajorMinor
    Write-Output "Input version: '$inputMajorMinor'"

    $newValue = $updatedList -join ";"

    [Environment]::SetEnvironmentVariable($BUILD_VERSIONS_LIST, $newValue, [EnvironmentVariableTarget]::Machine)

    Write-Output "`nEnvironment variable '$BUILD_VERSIONS_LIST' has been updated."
    Write-Output "New List: $updatedList"
}

function Set-TestingFailed {
    $TempDirectory = Join-Path -Path (Get-Location) -ChildPath "TEMP"
    if (-not (Test-Path -Path $TempDirectory)) {
        Write-Output "`nCreating a temp directory at $TempDirectory"
        New-Item -ItemType Directory -Path $TempDirectory | Out-Null
    }

    $ReadmeFile = Join-Path -Path $TempDirectory -ChildPath "README.md"

    $Content = "Example testing failed: (Example testing failed)[https://example-testing-failed.com/]"
    Write-Output "`nWriting a file with invalid link to a temp directory at $TempDirectory"
    Set-Content -Path $ReadmeFile -Value $Content
}

Write-Output "`nBranch Name: $env:branchName"

Set-BuildVersion
if (-not $global:buildVersion) {
    Write-Output "`nThe buildVersion is null or an empty string."
    Set-TestingFailed
    [System.Environment]::Exit($global:errorCode)
}
Process-JavaScriptProjects -buildVersion $global:buildVersion
Process-DotNetProjects

Write-Output "`nFinished testing. Error code: $global:errorCode"

if ($global:errorCode -ne 0) {
    Set-TestingFailed
}

[System.Environment]::Exit($global:errorCode)
