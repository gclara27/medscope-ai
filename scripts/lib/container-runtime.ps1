# Shared helpers for Docker and Podman dev workflows (Windows).
# Dot-source from scripts: . (Join-Path $PSScriptRoot "lib\container-runtime.ps1")

$script:ContainerRuntime = $null

function Add-ContainerBinToPath {
    param([string]$ExecutablePath)

    $binDir = Split-Path $ExecutablePath -Parent
    if (-not $binDir) {
        return
    }

    $pathParts = $env:PATH -split ';' | Where-Object { $_ -and $_.Trim() -ne '' }
    if ($pathParts -notcontains $binDir) {
        $env:PATH = "$binDir;" + ($pathParts -join ';')
    }
}

function Find-PodmanExecutable {
    $cmd = Get-Command podman -ErrorAction SilentlyContinue
    if ($cmd) {
        return $cmd.Source
    }

    $candidates = @(
        (Join-Path $env:LOCALAPPDATA "Programs\Podman\podman.exe")
        (Join-Path $env:ProgramFiles "RedHat\Podman\podman.exe")
        (Join-Path ${env:ProgramFiles(x86)} "RedHat\Podman\podman.exe")
    )

    foreach ($candidate in $candidates) {
        if ($candidate -and (Test-Path $candidate)) {
            return $candidate
        }
    }

    return $null
}

function Find-DockerExecutable {
    $cmd = Get-Command docker -ErrorAction SilentlyContinue
    if ($cmd) {
        return $cmd.Source
    }

    $candidates = @(
        (Join-Path $env:ProgramFiles "Docker\Docker\resources\bin\docker.exe")
    )

    foreach ($candidate in $candidates) {
        if ($candidate -and (Test-Path $candidate)) {
            return $candidate
        }
    }

    return $null
}

function Get-ContainerExecutable {
    param([string]$Runtime)

    $exe = if ($Runtime -eq "podman") {
        Find-PodmanExecutable
    } else {
        Find-DockerExecutable
    }

    if ($exe) {
        Add-ContainerBinToPath -ExecutablePath $exe
    }

    return $exe
}

function Resolve-ContainerRuntime {
    param(
        [ValidateSet("docker", "podman")]
        [string]$Runtime = "docker"
    )

    $runtime = $Runtime.ToLowerInvariant()
    $exe = Get-ContainerExecutable -Runtime $runtime

    if (-not $exe) {
        if ($runtime -eq "podman") {
            throw @"
Podman not found. Install Podman Desktop, then restart PowerShell.

Typical install path:
  $env:LOCALAPPDATA\Programs\Podman\podman.exe

Or use Docker instead: .\scripts\setup-dev.ps1 -Runtime docker
"@
        }

        throw @"
Docker not found. Install Docker Desktop, then restart PowerShell.

Or use Podman instead: .\scripts\setup-dev.ps1 -Runtime podman
"@
    }

    $script:ContainerRuntime = $runtime
    return $runtime
}

function Get-PodmanComposeExecutable {
    param([string]$Root)

    $cmd = Get-Command podman-compose -ErrorAction SilentlyContinue
    if ($cmd) {
        return $cmd.Source
    }

    if ($Root) {
        $venvCompose = Join-Path $Root ".venv\Scripts\podman-compose.exe"
        if (Test-Path $venvCompose) {
            return $venvCompose
        }
    }

    return $null
}

function Test-PodmanComposeCommand {
    param([string]$Root = $null)

    return [bool](Get-PodmanComposeExecutable -Root $Root)
}

function Assert-PodmanComposeAvailable {
    param([string]$Root = $null)

    if (Test-PodmanComposeCommand -Root $Root) {
        return
    }

    throw @"
podman-compose is required for Podman workflows on Windows.

Install it once:
  pip install podman-compose

Or run setup with Podman:
  .\scripts\setup-dev.ps1 -Runtime podman

Then verify:
  podman-compose version
"@
}

function Get-ContainerRuntimeLabel {
    param([string]$Runtime)

    switch ($Runtime) {
        "podman" { return "Podman" }
        default { return "Docker" }
    }
}

function Get-ContainerEngineStartHelp {
    param([string]$Runtime)

    switch ($Runtime) {
        "podman" {
            return @"
Podman is not running.

1. Start Podman machine: podman machine start
2. Wait until: podman info
3. Run this script again

Podman compose requires podman-compose:
  pip install podman-compose
"@
        }
        default {
            return @"
Docker Desktop is not running.

1. Open Docker Desktop
2. Wait until the engine is ready
3. Run this script again
"@
        }
    }
}

function Test-ContainerEngineRunning {
    param([string]$Runtime)

    $exe = Get-ContainerExecutable -Runtime $Runtime
    if (-not $exe) {
        return $false
    }

    $prev = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    & $exe info 2>$null | Out-Null
    $ok = $LASTEXITCODE -eq 0
    $ErrorActionPreference = $prev
    return $ok
}

function Get-ComposeFilePath {
    param([string]$Root)

    $composeFile = Join-Path $Root "docker-compose.yml"
    if (-not (Test-Path $composeFile)) {
        throw "docker-compose.yml not found in $Root"
    }
    return $composeFile
}

function Get-MedScopeContainerName {
    param([string]$Service)

    return "medscope-$Service"
}

function Test-PodmanContainerRunning {
    param(
        [string]$PodmanExe,
        [string]$ContainerName
    )

    $id = & $PodmanExe ps --filter "name=^${ContainerName}$" --filter "status=running" -q 2>$null
    return [bool]$id
}

function Test-PodmanContainerHealthy {
    param(
        [string]$PodmanExe,
        [string]$ContainerName
    )

    if (-not (Test-PodmanContainerRunning -PodmanExe $PodmanExe -ContainerName $ContainerName)) {
        return $false
    }

    $health = & $PodmanExe inspect $ContainerName --format "{{.State.Health.Status}}" 2>$null
    if ($health -eq "healthy") {
        return $true
    }

    if (-not $health -or $health -eq "<no value>") {
        return $true
    }

    return $false
}

function Invoke-PodmanComposeUpDetached {
    param(
        [string]$Root,
        [string]$ComposeExe,
        [string]$ComposeFile,
        [string[]]$Services,
        [switch]$Build,
        [int]$TimeoutSeconds = 180
    )

    $podmanExe = Get-ContainerExecutable -Runtime "podman"
    if (-not $podmanExe) {
        throw "Podman executable not found."
    }

    $allReady = $true
    foreach ($service in $Services) {
        $containerName = Get-MedScopeContainerName -Service $service
        if (-not (Test-PodmanContainerHealthy -PodmanExe $podmanExe -ContainerName $containerName)) {
            $allReady = $false
            break
        }
    }
    if ($allReady) {
        return
    }

    $argList = @("-f", $ComposeFile, "up")
    if ($Build) {
        $argList += "--build"
    }
    $argList += "-d"
    if ($Services) {
        $argList += $Services
    }

    $stdoutFile = Join-Path $env:TEMP "medscope-podman-compose.out"
    $stderrFile = Join-Path $env:TEMP "medscope-podman-compose.err"
    if (Test-Path $stdoutFile) { Remove-Item $stdoutFile -Force -ErrorAction SilentlyContinue }
    if (Test-Path $stderrFile) { Remove-Item $stderrFile -Force -ErrorAction SilentlyContinue }

    # podman-compose on Windows may keep streaming logs even with -d; run detached and poll health.
    $proc = Start-Process `
        -FilePath $ComposeExe `
        -ArgumentList $argList `
        -WorkingDirectory $Root `
        -PassThru `
        -WindowStyle Hidden `
        -RedirectStandardOutput $stdoutFile `
        -RedirectStandardError $stderrFile

    $elapsed = 0
    $interval = 2
    while ($elapsed -lt $TimeoutSeconds) {
        $ready = $true
        foreach ($service in $Services) {
            $containerName = Get-MedScopeContainerName -Service $service
            if (-not (Test-PodmanContainerHealthy -PodmanExe $podmanExe -ContainerName $containerName)) {
                $ready = $false
                break
            }
        }

        if ($ready) {
            if (-not $proc.HasExited) {
                Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
            }
            return
        }

        if ($proc.HasExited -and $proc.ExitCode -ne 0) {
            $stderr = Get-Content $stderrFile -ErrorAction SilentlyContinue -Raw
            throw "podman-compose up failed (exit $($proc.ExitCode)): $stderr"
        }

        Start-Sleep -Seconds $interval
        $elapsed += $interval
    }

    if (-not $proc.HasExited) {
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    }

    throw "Timed out waiting for Podman services: $($Services -join ', ')"
}

function Invoke-PodmanCompose {
    param(
        [string]$Root,
        [string[]]$ComposeArgs
    )

    $composeFile = Get-ComposeFilePath -Root $Root
    $composeExe = Get-PodmanComposeExecutable -Root $Root
    if (-not $composeExe) {
        Assert-PodmanComposeAvailable -Root $Root
    }

    $podmanExe = Get-ContainerExecutable -Runtime "podman"
    if (-not $podmanExe) {
        throw "Podman executable not found."
    }

    $command = $ComposeArgs[0]

    switch ($command) {
        "up" {
            $detached = $ComposeArgs -contains "-d"
            $build = $ComposeArgs -contains "--build"
            $services = @($ComposeArgs | Where-Object { $_ -notin @("up", "-d", "--build") })
            if ($services.Count -eq 0) {
                $services = @("postgres", "backend", "frontend")
            }

            if ($detached) {
                Invoke-PodmanComposeUpDetached `
                    -Root $Root `
                    -ComposeExe $composeExe `
                    -ComposeFile $composeFile `
                    -Services $services `
                    -Build:$build
                return
            }

            & $composeExe -f $composeFile @ComposeArgs
        }
        "exec" {
            if ($ComposeArgs.Length -lt 4) {
                throw "Invalid podman exec compose args: $($ComposeArgs -join ' ')"
            }

            $index = 1
            if ($ComposeArgs[$index] -eq "-T") {
                $index++
            }

            $service = $ComposeArgs[$index]
            $containerName = Get-MedScopeContainerName -Service $service
            $execArgs = $ComposeArgs[($index + 1)..($ComposeArgs.Length - 1)]

            & $podmanExe exec $containerName @execArgs
        }
        "stop" {
            foreach ($service in ($ComposeArgs | Select-Object -Skip 1)) {
                $containerName = Get-MedScopeContainerName -Service $service
                & $podmanExe stop $containerName 2>$null | Out-Null
            }
        }
        "down" {
            foreach ($containerName in @("medscope-frontend", "medscope-backend", "medscope-postgres")) {
                & $podmanExe rm -f $containerName 2>$null | Out-Null
            }
        }
        "ps" {
            & $podmanExe ps -a --filter "name=medscope-"
        }
        default {
            & $composeExe -f $composeFile @ComposeArgs
        }
    }
}

function Invoke-ContainerCompose {
    param(
        [string]$Runtime,
        [string]$Root,
        [string[]]$ComposeArgs
    )

    if (-not $ComposeArgs -or $ComposeArgs.Count -eq 0) {
        throw "ComposeArgs is required (e.g. @('up', 'postgres', '-d'))."
    }

    Push-Location $Root
    try {
        if ($Runtime -eq "podman") {
            Invoke-PodmanCompose -Root $Root -ComposeArgs $ComposeArgs
        } else {
            $composeFile = Get-ComposeFilePath -Root $Root
            $dockerExe = Get-ContainerExecutable -Runtime "docker"
            if (-not $dockerExe) {
                throw "Docker executable not found."
            }
            & $dockerExe compose -f $composeFile @ComposeArgs
        }
    } finally {
        Pop-Location
    }
}

function Get-ComposePsCommand {
    param([string]$Runtime)

    if ($Runtime -eq "podman") {
        return "podman-compose ps"
    }
    return "docker compose ps"
}

function Get-ComposeLogsHint {
    param(
        [string]$Runtime,
        [string]$Service = "postgres"
    )

    if ($Runtime -eq "podman") {
        return "podman-compose logs $Service"
    }
    return "docker compose logs $Service"
}

function Get-ComposeDownHint {
    param([string]$Runtime)

    if ($Runtime -eq "podman") {
        return "podman-compose down"
    }
    return "docker compose down"
}

function Get-DevStartScriptHint {
    param([string]$Runtime)

    if ($Runtime -eq "podman") {
        return ".\dev-podman.bat"
    }
    return ".\dev.bat"
}

function Get-DevStopScriptHint {
    param([string]$Runtime)

    if ($Runtime -eq "podman") {
        return ".\stop-podman.bat"
    }
    return ".\stop.bat"
}

function Get-StackUpScriptHint {
    param([string]$Runtime)

    if ($Runtime -eq "podman") {
        return ".\scripts\podman-up.ps1"
    }
    return ".\scripts\docker-up.ps1"
}

function Get-StackVerifyScriptHint {
    param([string]$Runtime)

    if ($Runtime -eq "podman") {
        return ".\scripts\verify-podman-stack.ps1"
    }
    return ".\scripts\verify-docker-stack.ps1"
}
