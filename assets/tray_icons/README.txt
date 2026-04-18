git-tomato Tray Icons v3
========================

ELECTRON USAGE
--------------
// macOS
const icon = nativeImage.createFromPath('macos/tray_22Template.png')
// Windows  
const icon = nativeImage.createFromPath('windows/tray.ico')
const tray = new Tray(icon)

macOS *Template.png files auto-invert for dark/light menu bar.
For Retina displays, use tray_44Template.png (= 22pt @2x).

ICNS (native macOS app bundle)
-------------------------------
Feed icon_16x16.png … icon_1024x1024.png into iconutil:
  iconutil -c icns <iconset_folder>
