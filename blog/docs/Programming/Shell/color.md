# echo颜色

## 简介

在Shell脚本中，可以使用ANSI转义码来设置文本颜色。

```bash
echo -e "\e[31mHello World \e[0m"
echo -e "\033[31mHello \x1B[0m World"
```

说明:
- 该命令的`-e`选项`echo`启用对转义序列的解析
- `\e[0m`序列删除所有属性（格式和颜色），在每个彩色文本的末尾都最好添加它
- `\e` 转义起始符，定义一个转义序列， 可以使用 `\033`或者`\x1B`代替
- `[` 表示开始定义颜色
- `m` 转义终止符，表示颜色定义完毕
- 再次使用 `\e[` ，表示再次开启颜色定义，0表示使用默认的颜色，m表示颜色定义结束，所以 `\e[0m` 的作用是恢复之前的配色方案

注意：
- [MACOS的脚本可能不支持`\e`，需要用`\033 \x1B` 或使用 `printf`](https://cloud.tencent.com/developer/ask/sof/38211)
- MS-DOS不支持ANSI颜色，需要装插件[ansicon](https://github.com/adoxa/ansicon/)


以下是一些常用的颜色代码：

```sh
# 颜色代码
BLACK='\033[0;30m'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[0;37m'
NC='\033[0m' # 无颜色

# 示例用法
echo -e "${RED}这是红色文本${NC}"
echo -e "${GREEN}这是绿色文本${NC}"
```

允许属性组合，属性必须用分号`;`分隔。
```bash
# 加粗加下划线
echo -e "\e[1;4mBold and Underlined\e[0m"

# 粗体+红色前景+绿色背景
echo -e "\e[1;31;42m Yes it is awful\e[0m"
```

## 颜色组合

@import 'assets/colors_and_formatting.sh'


## 参考资料
- https://zhuanlan.zhihu.com/p/181609730
- https://blog.csdn.net/Dreamhai/article/details/103432525
- https://unix.stackexchange.com/questions/730403/echo-e-e-does-not-print-an-escape-from-bash-script-on-macos