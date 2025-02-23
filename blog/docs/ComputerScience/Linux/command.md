
# Unix 命令

## nm

查看二进制文件（例如可执行文件、共享对象文件等）中的符号信息
- U: 未定义的符号
- A: 绝对符号
- T: Text段中的符号，通常是函数或可执行代码
- D: 数据段中的符号，通常是全局变量
- B: BSS段中的符号，未初始化的数据段中的符号
- C: 未初始化的公共符号，也称为 “通用符号”
- S: 其他段的符号
- I: 直接符号
- R: 只读数据段中的符号

注：如果是局部变量，则用小写字母表示。

> U (undefined), A (absolute), T (text section symbol), D (data section symbol),
> B (bss section symbol), C (common symbol), - (for debugger symbol table entries;
> see -a below), S (symbol in a section other than those above), or
> I (indirect symbol). If the symbol is local (non-external), the symbol's
> type is instead represented by the corresponding lowercase letter. 
> A lower case u in a dynamic shared library indicates a undefined reference to a private external in another module in the same library.

示例
```
% nm example.o
0000000100008008 d __dyld_private
0000000100000000 T __mh_execute_header
0000000100008010 D _global_var
0000000100003e40 T _main
0000000100008014 d _main.static_local_var
0000000100003ec0 T _my_function
                 U _printf
0000000100003ee0 t _static_function
0000000100008018 d _static_global_var
                 U dyld_stub_binder
```


## objdump

用于显示目标文件（包括可执行文件、目标代码文件、共享库等）的详细信息。
常用功能：
- `-f` 显示文件头信息
- `-h` 显示节头信息
- `-s` 显示节的内容，可以结合 `-j` 选项指定要显示的节
- `-d` 反汇编代码节
- `-S` 混合源代码和反汇编
- `-t` 显示符号表

注：在MACOS上有类似的 `otool` 命令