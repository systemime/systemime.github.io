---
title: opensofty | 如何在QEMU中运行Android以在Linux上玩3D Android游戏
subtitle: 文章暂存
author: systemime
date: 2020-03-16
header_img: /img/in-post/2020-10-29/header.jpg
catalog: true
tags:
  - python
---

欢迎来到我的世界.

<!-- more -->

[Android-x86](https://translate.googleusercontent.com/translate_c?depth=1&pto=aue&rurl=translate.google.kg&sl=en&sp=nmt4&tl=zh-CN&u=https://www.android-x86.org/&usg=ALkJrhgPpe2ORB5Yy97EUiTsWVVlGrDdLw)是一个免费的开源项目，旨在为 x86 系统提供 Android 映像。Android-x86 具有新功能，许多[Android 开源项目的](https://translate.googleusercontent.com/translate_c?depth=1&pto=aue&rurl=translate.google.kg&sl=en&sp=nmt4&tl=zh-CN&u=https://source.android.com/&usg=ALkJrhiVPgPgHWVOS7eoU-ieOOtp829eEA)兼容性修补程序和错误修复，是 x86 台式机目前最强大的解决方案。本文介绍了如何在 Ubuntu 上通过完整的硬件加速在[QEMU 中](https://translate.googleusercontent.com/translate_c?depth=1&pto=aue&rurl=translate.google.kg&sl=en&sp=nmt4&tl=zh-CN&u=https://www.qemu.org/&usg=ALkJrhi7_7kC-QZam5yXj6TeuDCa7fQmUw)安装 Android-x86 ，允许您玩 3D 游戏并运行主要的 Android 应用。

Qemu 是用于 Linux 的硬件虚拟化解决方案，它可以仿真安装在虚拟磁盘上的整个 OS。VirGL 是添加到最新 QEMU 版本中的 OpenGL 渲染器，它使您可以在 QEMU 虚拟机内部创建支持虚拟 3D 的图形卡。

结合使用 Android-x86，QEMU 和 VirGL 技术，我们将在虚拟机中启动并安装完整的 Android OS。

兼容性说明：本指南已经过 Ubuntu 19.04 的测试，以下说明适用于 Ubuntu 19.04 或更高版本。较早版本的 Ubuntu 中的 QEMU 缺少 VirGL 支持。您还需要在系统上具有基于内核的虚拟机（KVM）兼容的 CPU。大多数现代 CPU 都支持 KVM，但是您可以通过运行以下命令来检查其是否存在：

egrep -c '(vmx|svm)' /proc/cpuinfo

任何大于 0 的数字都表示支持 KVM。不过，您仍然需要确保在 BIOS 中启用了虚拟化。可以在[此处](https://translate.googleusercontent.com/translate_c?depth=1&pto=aue&rurl=translate.google.kg&sl=en&sp=nmt4&tl=zh-CN&u=https://help.ubuntu.com/community/KVM/Installation&usg=ALkJrhj8qCO-69K29SE2Cy9MFi01j8Ia-Q)找到更多信息。

### 先决条件

我们将从安装所需的 QEMU 软件包并将用户名添加到 KVM 组开始。运行以下命令：

sudo apt install qemu qemu-kvm  
sudo adduser \`id -un\` kvm

重新启动系统。从[此处](https://translate.googleusercontent.com/translate_c?depth=1&pto=aue&rurl=translate.google.kg&sl=en&sp=nmt4&tl=zh-CN&u=https://www.android-x86.org/&usg=ALkJrhgPpe2ORB5Yy97EUiTsWVVlGrDdLw)下载 Android-x86 ISO 映像。运行以下命令以创建虚拟硬盘：

qemu-img create -f qcow2 androidx86_hda.img 10G

您可以将 10G 替换为任何数字，它将创建一个大小为 GB 的虚拟磁盘。

### Android-x86 QEMU 安装演练

要引导到 QEMU 虚拟机内的 Android-x86 实时映像，请执行以下命令：

qemu-system-x86_64 \\  
-enable-kvm \\  
-m 2048 \\  
-smp 2 \\  
-cpu host \\  
-soundhw es1370 \\  
-device virtio-mouse-pci -device virtio-keyboard-pci \\  
-serial mon:stdio \\  
-boot menu\\=on \\  
-net nic \\  
-net user,hostfwd\\=tcp::5555-:22 \\  
-device virtio-vga,virgl\\=on \\  
-display gtk,gl\\=on \\  
-hda androidx86_hda.img \\  
-cdrom android-x86_64-8.1-r3.iso

注意 “hda” 和“ cdrom”参数。您必须确保它们与虚拟硬盘名称和下载的 Android-x86 iso 映像匹配。如果您正确遵循了此处的说明，则应该会看到一个新窗口弹出窗口：

[![](https://covid.b-cdn.net/linux2/posts/android_qemu_play_3d_games_linux/81d58e312eb363b7469b64c6c524afe3e42abcc216f1f3fe1de918474fb5e62e.png)
](https://translate.googleusercontent.com/translate_c?depth=1&pto=aue&rurl=translate.google.kg&sl=en&sp=nmt4&tl=zh-CN&u=https://linuxhint.com/wp-content/uploads/2019/11/1-32.png&usg=ALkJrhiLKuMeqH-NJ5Jlwh_Nwi4P-DlTzg)

选择 “安装” 条目，然后等待分区屏幕出现。

[![](https://covid.b-cdn.net/linux2/posts/android_qemu_play_3d_games_linux/836597107da6643e29a4dc847c1acd290fd162210a3622fbcf2ce346fdd40df8.png)
](https://translate.googleusercontent.com/translate_c?depth=1&pto=aue&rurl=translate.google.kg&sl=en&sp=nmt4&tl=zh-CN&u=https://linuxhint.com/wp-content/uploads/2019/11/2-28.png&usg=ALkJrhisxr5JvOYLCmfloLhwGyhq6UDmaQ)

选择 “创建 / 修改分区”，然后选择 GPT 为 “是”。

[![](https://covid.b-cdn.net/linux2/posts/android_qemu_play_3d_games_linux/87c078e93903c8c737ae1ceeeeb2b198191f03eb1bceaa05fb7d2f30848133ee.png)
](https://translate.googleusercontent.com/translate_c?depth=1&pto=aue&rurl=translate.google.kg&sl=en&sp=nmt4&tl=zh-CN&u=https://linuxhint.com/wp-content/uploads/2019/11/3-30.png&usg=ALkJrhj2n8zJ5B4YOtfE5HXrSStKVj7-Pg)

忽略下一个屏幕上的警告，只需按任意键即可继续。您将看到一个分区管理器。

[![](https://covid.b-cdn.net/linux2/posts/android_qemu_play_3d_games_linux/91d2b3e2bb1e7dad0fc06dd68dea86daf9f3259a7ecdbe4e2d41b9b13995d530.png)
](https://translate.googleusercontent.com/translate_c?depth=1&pto=aue&rurl=translate.google.kg&sl=en&sp=nmt4&tl=zh-CN&u=https://linuxhint.com/wp-content/uploads/2019/11/4-27.png&usg=ALkJrhgTM-eY5XEJDAbShr2lL8wKy3rxyA)

选择 “新建”，然后继续按以下四个提示的键。您无需在提示中指定任何内容。完成后，您将在分区管理器中看到新创建的文件系统，如下面的屏幕快照所示：

[![](https://covid.b-cdn.net/linux2/posts/android_qemu_play_3d_games_linux/82cd015ac89c32d77ada1445501e61416f0280df40ef85a627f47c8f55bdafc5.png)
](https://translate.googleusercontent.com/translate_c?depth=1&pto=aue&rurl=translate.google.kg&sl=en&sp=nmt4&tl=zh-CN&u=https://linuxhint.com/wp-content/uploads/2019/11/5-26.png&usg=ALkJrhgyLHqTUUKFiTrCzkChqf0VLR-2wQ)

点击 “写入” 选项，然后键入 “是” 进行确认。选择 “退出” 选项退出分区管理器。在下一个屏幕上选择 “ sda1” 分区。

[![](https://covid.b-cdn.net/linux2/posts/android_qemu_play_3d_games_linux/dbf9a9824021b78c09881a4eb44de08636d49a10afc8a1dfee002755398634d0.png)
](https://translate.googleusercontent.com/translate_c?depth=1&pto=aue&rurl=translate.google.kg&sl=en&sp=nmt4&tl=zh-CN&u=https://linuxhint.com/wp-content/uploads/2019/11/6-27.png&usg=ALkJrhhYZOtrp0b03oFFnKmP8GTLWMXBVQ)

选择 “ext4” 格式化分区，并在出现提示时选择 “是” 选项。

[![](https://covid.b-cdn.net/linux2/posts/android_qemu_play_3d_games_linux/dcad62b8231518747fa19a7acdb3bf9d4fbfcceedf402cc2a6a39719be01982d.png)
](https://translate.googleusercontent.com/translate_c?depth=1&pto=aue&rurl=translate.google.kg&sl=en&sp=nmt4&tl=zh-CN&u=https://linuxhint.com/wp-content/uploads/2019/11/7-25.png&usg=ALkJrhiWtUDPCaRcMDXjLCbA1-u8nQ8frg)

当提示有关 GRUB 引导加载程序时，选择 “是”。

[![](https://covid.b-cdn.net/linux2/posts/android_qemu_play_3d_games_linux/c817a18a77fb3b093ea03da03b750bd55132f557d08d3af900eeb0bb09308441.png)
](https://translate.googleusercontent.com/translate_c?depth=1&pto=aue&rurl=translate.google.kg&sl=en&sp=nmt4&tl=zh-CN&u=https://linuxhint.com/wp-content/uploads/2019/11/8-21.png&usg=ALkJrhjvvO-XMNfJY8fqSYICtqdYMb7YzA)

在下一个屏幕上，您可能会看到有关转换为 “MBR” 的警告。选择“是”。

[![](https://covid.b-cdn.net/linux2/posts/android_qemu_play_3d_games_linux/8510dd7d577793f8b6cde3653b4b9bb6f11d76cd385388beef70426b93739b3c.png)
](https://translate.googleusercontent.com/translate_c?depth=1&pto=aue&rurl=translate.google.kg&sl=en&sp=nmt4&tl=zh-CN&u=https://linuxhint.com/wp-content/uploads/2019/11/9-19.png&usg=ALkJrhggP58q_bNDsCke_GwuxGeEbfRKRg)

等待安装完成。

[![](https://covid.b-cdn.net/linux2/posts/android_qemu_play_3d_games_linux/5c7bdb352147fbf27ae003dd5496076fca9f4a16dfc342a0035b4cf404fea91f.png)
](https://translate.googleusercontent.com/translate_c?depth=1&pto=aue&rurl=translate.google.kg&sl=en&sp=nmt4&tl=zh-CN&u=https://linuxhint.com/wp-content/uploads/2019/11/10-19.png&usg=ALkJrhiTFs0vES96NCqRegX-5g_Wi4qpzw)

不要选择任何选项，只需在以下提示上关闭窗口即可：

[![](https://covid.b-cdn.net/linux2/posts/android_qemu_play_3d_games_linux/f86a1bd46badd8c996595337fd73a2927756be450affc46cf42d77ceaba2c631.png)
](https://translate.googleusercontent.com/translate_c?depth=1&pto=aue&rurl=translate.google.kg&sl=en&sp=nmt4&tl=zh-CN&u=https://linuxhint.com/wp-content/uploads/2019/11/11-18.png&usg=ALkJrhiKT3pX90_CKVa9FYm86VCiAj0HYA)

Android-x86 现在已完全安装在 QEMU 虚拟机中。要启动到新安装的操作系统，我们将使用上面相同的冗长命令，同时省略 “cdrom” 参数。

qemu-system-x86_64 \\  
-enable-kvm \\  
-m 2048 \\  
-smp 2 \\  
-cpu host \\  
-soundhw es1370 \\  
-device virtio-mouse-pci -device virtio-keyboard-pci \\  
-serial mon:stdio \\  
-boot menu\\=on \\  
-net nic \\  
-net user,hostfwd\\=tcp::5555-:22 \\  
-device virtio-vga,virgl\\=on \\  
-display gtk,gl\\=on \\  
-hda androidx86_hda.img

您将看到 Android 启动徽标，然后首先运行设置屏幕。

等待安装完成。

[![](https://covid.b-cdn.net/linux2/posts/android_qemu_play_3d_games_linux/674cc57c255c6059dac80ca847de7f295c69fe6195d9f1c748bb19334b3ff133.png)
](https://translate.googleusercontent.com/translate_c?depth=1&pto=aue&rurl=translate.google.kg&sl=en&sp=nmt4&tl=zh-CN&u=https://linuxhint.com/wp-content/uploads/2019/11/12-17.png&usg=ALkJrhgIMlp-JaO-cQsI_qCurIr0mH3gwg)

只需完成设置即可到达主屏幕。Android-x86 内置了完整的 Play 商店支持。请注意，正在运行的虚拟机将捕获所有击键和鼠标事件。要解除保留，您必须按组合键。

[![](https://covid.b-cdn.net/linux2/posts/android_qemu_play_3d_games_linux/5507d39e93349eb3456565df762e88df838149c67ddc8e2274aff1fb5442a7ef.png)
](https://translate.googleusercontent.com/translate_c?depth=1&pto=aue&rurl=translate.google.kg&sl=en&sp=nmt4&tl=zh-CN&u=https://linuxhint.com/wp-content/uploads/2019/11/13-17.png&usg=ALkJrhhTjBb4IXfxqtRKYdy6qbhmzsJ8Dw)

存在 3D 硬件加速支持。

[![](https://covid.b-cdn.net/linux2/posts/android_qemu_play_3d_games_linux/500482c1d732d86ae5ad2ac423bad9a45739a66faf1591d27bcc2387dfc612b5.png)
](https://translate.googleusercontent.com/translate_c?depth=1&pto=aue&rurl=translate.google.kg&sl=en&sp=nmt4&tl=zh-CN&u=https://linuxhint.com/wp-content/uploads/2019/11/14-17.png&usg=ALkJrhjvKDCfsWUuZtEIXZ6JG5jjVMZHug)

### 您应该知道的重要事项

-   您可以在某种程度上自定义我们上面使用的命令：“-m” 开关用于 RAM，“-smp” 开关用于 CPU 内核。如果您想探索所有选项，[Gentoo Wiki](https://translate.googleusercontent.com/translate_c?depth=1&pto=aue&rurl=translate.google.kg&sl=en&sp=nmt4&tl=zh-CN&u=https://wiki.gentoo.org/wiki/QEMU/Options&usg=ALkJrhiZ3BTKecYzrUb9jXlwW4Gi8bvB-Q)会有一个很好的解释。
-   将切换身临其境的全屏体验。
-   您可以通过点击 “Wi-Fi” 设置中的 “ VirtWifi” 选项来激活 Android-x86 中的互联网连接。
-   并不是所有的东西都可以在虚拟机中工作，例如蓝牙。
-   硬件加速兼容性和性能将取决于您的 PC 的图形卡，驱动程序和 CPU 能力。
-   最新版本的 Android-x86 带有自由格式的 Windows 支持。您可以最小化，最大化，还原窗口并将其捕捉到角落，就像在台式机操作系统上一样。
-   Android-x86 比当前 Android 版本落后一两个版本。但是，它不会影响您运行应用和游戏的能力。
-   QEMU 虚拟机中的 Android-x86 可能并非百分百流畅。您可以预料会发生一些随机的崩溃，然后不时地强制关闭。

### 改善 Android-x86 中的应用程序兼容性

某些 android 应用可能会拒绝使用 x86 架构。Android-x86 包含一个兼容性库，该库可以提供很大帮助，但是您仍然可能会发现某些应用程序存在问题。要启用兼容性层，请在系统设置中切换 “本地网桥”。

[![](https://covid.b-cdn.net/linux2/posts/android_qemu_play_3d_games_linux/eb15020dfaddbf17f2caf37afe0318737612222460f7248a89b0620b26289e82.png)
](https://translate.googleusercontent.com/translate_c?depth=1&pto=aue&rurl=translate.google.kg&sl=en&sp=nmt4&tl=zh-CN&u=https://linuxhint.com/wp-content/uploads/2019/11/15-16.png&usg=ALkJrhjZ4lhoPkv9PvHfeRfTIZAwERVuQg)

最后，我们还有一个小问题尚待解决。Android-x86 虚拟机的分辨率。如果您使用的是低端 PC 硬件，建议您仅在默认分辨率下以窗口模式运行 Android（在 “查看” 菜单中禁用“缩放以适合”）。如果您有足够的硬件，则可以按照以下说明提高分辨率。

### 更改 QEMU 虚拟机（VM）中 Android-x86 安装的分辨率

**警告：下面提到的所有命令均应在 Android-x86 VM 安装（来宾）中执行。不要尝试在 Ubuntu 安装（主机）中运行这些命令。** 

要永久更改 Android VM 的分辨率，我们需要在运行的 VM 实例内部启动的终端中运行一些命令。Android-x86 附带一个终端仿真器应用程序，启动它并逐个运行以下命令（在出现提示时允许 root 用户访问）：

su  
mount /dev/block/sda1 /mnt  
vi /mnt/grub/menu.lst

_看到文本文件后，_按_一下即可开始编辑模式。在第一个条目中，以 “video = widthxheight” 格式添加所需的分辨率，如以下屏幕截图所示：_

_[![](https://covid.b-cdn.net/linux2/posts/android_qemu_play_3d_games_linux/fd548db8580f80ed4c4cba24411f65af77af268c35b16931610899f397712baf.png)
](https://translate.googleusercontent.com/translate_c?depth=1&pto=aue&rurl=translate.google.kg&sl=en&sp=nmt4&tl=zh-CN&u=https://linuxhint.com/wp-content/uploads/2019/11/16-15.png&usg=ALkJrhii3opu9estQNfAnJnJvHBJxzIydQ)_

_要保存文件，请先按键，然后键入 “：wq”（不带引号），然后按键。运行以下命令以安全地卸载我们的挂载点。_

_重新启动 Android VM。现在已设置所需的分辨率。如果您的 VM 的分辨率等于显示器的分辨率，则由于窗口标题栏和边框会占用一些空间，因此您可能会在窗口模式下看到一些裁剪。要解决此问题，您必须启用 “缩放以适合”，如以下屏幕截图所示：_

_[![](https://covid.b-cdn.net/linux2/posts/android_qemu_play_3d_games_linux/57caabb98004b461e492fcdba6ec91c64ec6c4db14edc3ff20a021255993ed55.png)
](https://translate.googleusercontent.com/translate_c?depth=1&pto=aue&rurl=translate.google.kg&sl=en&sp=nmt4&tl=zh-CN&u=https://linuxhint.com/wp-content/uploads/2019/11/17-15.png&usg=ALkJrhgrIbO8QFW8-h89RHis5P6FFWfKlw)_

_如果您通过按切换全屏，则不会有任何剪辑。要确认正确的分辨率，请转到 “开发工具” 应用，然后选择 “配置” 选项。从分辨率高度中减去底部导航栏的高度，因此高度会略小。_

_[![](https://covid.b-cdn.net/linux2/posts/android_qemu_play_3d_games_linux/6c5e9e2e7498474bf8cd0717dadb13eae9fb084977239f960a3bc4db5660b052.png)
](https://translate.googleusercontent.com/translate_c?depth=1&pto=aue&rurl=translate.google.kg&sl=en&sp=nmt4&tl=zh-CN&u=https://linuxhint.com/wp-content/uploads/2019/11/18-16.png&usg=ALkJrhgJwVlobXM0gQJDs4aJTAIHOFaYfQ)_

#### _展示柜_

_本文声称在 Linux 上运行 3D Android 游戏，不包含任何素材都是犯罪。因此，这是 SuperTuxKart 在以 Ubuntu 19.04 为主机的 QEMU 虚拟机中全速运行的一些游戏画面。我正在使用键盘上的箭头键控制游戏，但是游戏本身正在 Android-x86 VM 中运行。以下 GIF 加速并在转换过程中质量下降：_

_[![](https://covid.b-cdn.net/linux2/posts/android_qemu_play_3d_games_linux/13509f9af83593fe3023ca9dd0d2186d4e8c2c11c47ae4c87711fdd6df4c0138.gif)
](https://translate.googleusercontent.com/translate_c?depth=1&pto=aue&rurl=translate.google.kg&sl=en&sp=nmt4&tl=zh-CN&u=https://linuxhint.com/wp-content/uploads/2019/11/19.gif&usg=ALkJrhgLjO1Dyhj1lAj-Ti5hj-GGi8HgtQ)_

_长篇文章到此结束。如果您想在台式 PC 上运行 Android 应用和游戏，则此方法比使用具有疯狂隐私策略的第三方模拟器要好得多，而且它不需要您干预系统分区即可进行双启动。_ 
 [https://opensofty.com/zh-cn/2020/2/1/%E5%A6%82%E4%BD%95%E5%9C%A8qemu%E4%B8%AD%E8%BF%90%E8%A1%8Candroid%E4%BB%A5%E5%9C%A8linux%E4%B8%8A%E7%8E%A93d-android%E6%B8%B8%E6%88%8F/](https://opensofty.com/zh-cn/2020/2/1/%E5%A6%82%E4%BD%95%E5%9C%A8qemu%E4%B8%AD%E8%BF%90%E8%A1%8Candroid%E4%BB%A5%E5%9C%A8linux%E4%B8%8A%E7%8E%A93d-android%E6%B8%B8%E6%88%8F/) 
 [https://opensofty.com/zh-cn/2020/2/1/%E5%A6%82%E4%BD%95%E5%9C%A8qemu%E4%B8%AD%E8%BF%90%E8%A1%8Candroid%E4%BB%A5%E5%9C%A8linux%E4%B8%8A%E7%8E%A93d-android%E6%B8%B8%E6%88%8F/](https://opensofty.com/zh-cn/2020/2/1/%E5%A6%82%E4%BD%95%E5%9C%A8qemu%E4%B8%AD%E8%BF%90%E8%A1%8Candroid%E4%BB%A5%E5%9C%A8linux%E4%B8%8A%E7%8E%A93d-android%E6%B8%B8%E6%88%8F/)
