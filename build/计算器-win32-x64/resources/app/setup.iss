; Inno Setup 安装脚本
; 计算器安装程序

[Setup]
AppName=计算器
AppVersion=1.0
DefaultDirName={pf}\计算器
DefaultGroupName=计算器
OutputBaseFilename=计算器安装程序
SetupIconFile=public\计算器.ico
Compression=lzma2
SolidCompression=yes

[Files]
Source: "dist\*"; DestDir: "{app}"; Flags: recursesubdirs ignoreversion
Source: "electron\*.exe"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\计算器"; Filename: "{app}\electron.exe"
Name: "{commondesktop}\计算器"; Filename: "{app}\electron.exe"

[Run]
Filename: "{app}\electron.exe"; Description: "启动计算器"; Flags: nowait postinstall
