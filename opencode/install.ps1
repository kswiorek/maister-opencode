<# Maister for OpenCode - Windows installer.
Copies opencode/skills, agents, commands, plugins into the global OpenCode
config and enables experimental.todo (Maister phase tracking).
Idempotent: re-running after 'git pull' just overwrites the maister entries.
#>
$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
if ($env:XDG_CONFIG_HOME) { $dest = Join-Path $env:XDG_CONFIG_HOME 'opencode' } else { $dest = Join-Path $HOME '.config\opencode' }

foreach ($d in @('skills', 'agents', 'commands', 'plugins')) {
  $from = Join-Path $here $d
  if (Test-Path $from) {
    $to = Join-Path $dest $d
    New-Item -ItemType Directory -Force $to | Out-Null
    Copy-Item -Recurse -Force (Join-Path $from '*') $to
  }
}

$cfg = Join-Path $dest 'opencode.jsonc'
if (-not (Test-Path $cfg)) {
  $fresh = @'
{
  "$schema": "https://opencode.ai/config.json",
  "experimental": {
    "todo": true
  }
}
'@
  Set-Content $cfg $fresh -Encoding UTF8
  Write-Host ('Created ' + $cfg)
} else {
  $text = Get-Content $cfg -Raw
  if ($text -match '"todo"\s*:\s*true') {
    Write-Host 'experimental.todo already enabled.'
  } elseif ($text -match '"experimental"') {
    Copy-Item $cfg ($cfg + '.bak') -Force
    Write-Host 'opencode.jsonc already has an experimental block - add "todo": true manually.'
    Write-Host ('Backup at ' + $cfg + '.bak')
  } else {
    Copy-Item $cfg ($cfg + '.bak') -Force
    $snippet = ",`n  `"experimental`": {`n    `"todo`": true`n  }`n}"
    $text = $text -replace '\}\s*$', $snippet
    Set-Content $cfg $text -Encoding UTF8 -NoNewline
    Write-Host 'Enabled experimental.todo.'
    Write-Host ('Backup at ' + $cfg + '.bak')
  }
}

Write-Host ('Installed Maister for OpenCode to ' + $dest)
Write-Host 'In OpenCode, run /reload, then /maister/init in your project.'
