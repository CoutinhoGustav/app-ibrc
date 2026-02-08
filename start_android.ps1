$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:PATH = "$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator;$env:PATH"
Write-Host "ANDROID_HOME set to: $env:ANDROID_HOME"
& "$env:ANDROID_HOME\emulator\emulator.exe" -avd Pixel_2_API_36 -netdelay none -netspeed full
