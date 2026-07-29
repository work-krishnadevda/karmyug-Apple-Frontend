Add-Type -AssemblyName System.Drawing

function New-PwaIcon {
  param([int]$Size, [string]$OutPath)

  $logoPath = Join-Path $PSScriptRoot '..\public\logo.png'
  $logo = [System.Drawing.Image]::FromFile((Resolve-Path $logoPath))
  $bmp = New-Object System.Drawing.Bitmap $Size, $Size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.Clear([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

  $pad = [math]::Floor($Size * 0.12)
  $maxW = $Size - (2 * $pad)
  $maxH = $Size - (2 * $pad)
  $scale = [math]::Min($maxW / $logo.Width, $maxH / $logo.Height)
  $w = [int]($logo.Width * $scale)
  $h = [int]($logo.Height * $scale)
  $x = [int](($Size - $w) / 2)
  $y = [int](($Size - $h) / 2)

  $g.DrawImage($logo, $x, $y, $w, $h)
  $bmp.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
  $logo.Dispose()
  Write-Output "Created $OutPath ($Size x $Size)"
}

$publicDir = Join-Path $PSScriptRoot '..\public'
New-PwaIcon -Size 192 -OutPath (Join-Path $publicDir 'icon-192.png')
New-PwaIcon -Size 512 -OutPath (Join-Path $publicDir 'icon-512.png')
