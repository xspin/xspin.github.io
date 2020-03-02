### [How to write to NTFS drive in MacOS Sierra, High Sierra](<https://macbold.com/write-ntfs-drive-macos-sierra3t5/>)

```bash
$ sudo "LABEL=DiskName none ntfs rw,auto,nobrowse" >> /etc/fstab
```

### iStat Menus 5.31 License Key

`9665-5955-6856-2071-0000`

### Window Management Shortcuts ([HammerSpoon](https://github.com/S1ngS1ng/HammerSpoon))

- Move window to another screen
  - `Ctrl-Alt + Left` - Set current window to the Left screen
  - `Ctrl-Alt + Right` - Set current window to the Right screen
- Set window size to full screen
  - `Ctrl-Alt-Command + M`
- Set window to center (keep window height)
  - `Ctrl-Alt-Command + C`
- Set window size to EXACTLY half of the current screen
  - `Ctrl-Alt-Command + Left` - Half the width, stick to Left
  - `Ctrl-Alt-Command + Right` - Half the width, stick to Right
  - `Ctrl-Alt-Command + Up` - Half the width, stick to Top
  - `Ctrl-Alt-Command + Down` - Half the width, stick to Bottom
- Adjust window size (anchor top, left)
  - `Ctrl-Alt-Shift + Left` - Move Right edge to the Left
  - `Ctrl-Alt-Shift + Right` - Move Right edge to the Right
  - `Ctrl-Alt-Shift + Up` - Move Bottom edge Up
  - `Ctrl-Alt-Shift + Down` - Move Bottom edge Down
- Adjust window size (anchor right, bottom)
  - `Alt-Command-Shift + Left` - Move Left edge to the Left
  - `Alt-Command-Shift + Right` - Move Left edge to the Right
  - `Alt-Command-Shift + Up` - Move Top edge Up
  - `Alt-Command-Shift + Down` - Move Top edge Down
- Windows-like window cycle (Just like winKey + left/right on Windows OS)
  - `Ctrl-Alt-Command + u` - Move window to the "relative" left and resize to half of the screen
  - `Ctrl-Alt-Command + i` - Move window to the "relative" right and resize to half of the screen

### SSH 端口转发

**转发到本地端口** `-L 本地网卡地址:本地端口:目标地址:目标端口`

Remote 能访问 Target，Local不能

```bash
$ ssh -L PORT_Local:IP_Target:PORT_Target user@IP_Remote
```

**转发到远程端口** `-R 远程网卡地址:远程端口:目标地址:目标端口`

Local 能访问 Target，Remote不能

```bash
$ ssh -R PORT_Remote:IP_Target:PORT_Target user@IP_Remote
```

**链式端口转发** `-R + -L`

将`IP_Target:PORT_Target`转发到`IP_Remote:PORT_Remote`

```bash
$ ssh -R PORT_Remote:IP_Target:PORT_Target user@IP_Remote #in Target
```

然后将`IP_Remote:PORT_Remote`转发到`IP_Local:PORT_Local`

```bash
$ ssh -L PORT_Local:IP_Target:PORT_Target user@IP_Remote #in Local
```

Target和Local能访问Remote，但Local不能访问Target

#### 例子 - samba共享文件

CR-PC ——> ithink ——> xMac

```bash
$ ssh -R 1399:localhost:1399 i@153.3.15.209 -p88 #CR-PC
```

```bash
$ smb://ithink #xMAC 如果端口开启，否则
$ ssh -L 1399:localhost:1399 i@ithink #xMac
```

####  例子 - jupyter notebook

```bash
$  ssh -R 8888:localhost:8888 i@153.3.15.209 -p88 #CR-PC
```

```bash
$ ithink:8888 #xMac pswd:password
$ ssh -L 8888:localhost:8888 i@ithink
```

