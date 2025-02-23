# 调试信息分离

## 简介
gcc编译出的Debug版本和Release版本二进制有很大的差别，不仅是文件大小还有性能影响。
- Debug 版本：Debug 版本的程序包含大量的调试信息，这些信息会增加可执行文件的大小，并且在程序运行时可能会占用额外的内存和 CPU 资源。例如，调试信息会记录变量的名称、类型、地址等信息，方便调试器进行变量的查看和修改。
- Release 版本：Release 版本的程序通常不包含调试信息，因此可执行文件的大小相对较小，运行时也不会有调试信息带来的额外开销。

gcc编译Release版本时（不带`-g`参数），则不会带有调试信息（debug info），当使用gdb调试时可能很麻烦。如何既编译Release版本又能方便gdb调试呢，分离二进制和调试信息就能实现。

## 方法一：使用 objcopy 和 strip

C示例代码：
```c
// test.c
int global_var;
static int static_var;
static int func() {
    int local_var;
    static_var = 0;
    global_var = static_var + 3;
    local_var = global_var + static_var;
    return local_var;
}

int main() {
    return func();
}
```

分离debuginfo的命令：
```sh
# 使用-g参数编译出debug版本
gcc -g -o test test.c

# 导出debug信息
objcopy --only-keep-debug test test.debug

# 去除debug信息
strip --strip-debug --strip-unneeded test

# （可选）添加.gnu_debuglink段链接（当使用gdb时会自动加载debuginfo）
objcopy --add-gnu-debuglink=test.debug test
```


gdb示例：
```bash
$ gdb test
GNU gdb (Debian 16.2-1) 16.2
Copyright (C) 2024 Free Software Foundation, Inc.
For help, type "help".
Type "apropos word" to search for commands related to "word"...
Reading symbols from test...
(No debugging symbols found in test)
(gdb) info variables
All defined variables:
(gdb)
```

使用命令`symbol-file`加载debuginfo后：
```bash
(gdb) symbol-file /tmp/test.debug
Reading symbols from /tmp/test.debug...
(gdb) info variables
All defined variables:

File test.c:
1:	int global_var;
2:	static int static_var;

Non-debugging symbols:
0x000000000000037c  __abi_tag
0x0000000000002000  _IO_stdin_used
0x0000000000002004  __GNU_EH_FRAME_HDR
0x0000000000002100  __FRAME_END__
0x0000000000003e00  __frame_dummy_init_array_entry
0x0000000000003e08  __do_global_dtors_aux_fini_array_entry
0x0000000000003e10  _DYNAMIC
0x0000000000003fe8  _GLOBAL_OFFSET_TABLE_
0x0000000000004000  __data_start
0x0000000000004000  data_start
0x0000000000004008  __dso_handle
0x0000000000004010  __TMC_END__
0x0000000000004010  __bss_start
0x0000000000004010  _edata
0x0000000000004010  completed
0x0000000000004020  _end
(gdb)
```

## 方法二：使用 -gsplit-dwarf 选项

在编译程序时，使用 `-gsplit-dwarf` 选项，GCC 会自动将调试信息分离到一个单独的 .dwo 文件中。
```bash
gcc -g -gsplit-dwarf -o test test.c
```
然后，这样编译出来的二进制用`file`查看，是带debuginfo的。
```bash
$ file test
test: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=f1613a1a693f66509f035ad4ec9c5fc213660839, for GNU/Linux 3.2.0, with debug_info, not stripped
```

## 参考资料

- https://blog.csdn.net/qq_34176606/article/details/114554009
- https://blog.csdn.net/nirendao/article/details/104107608
- https://gcc.gnu.org/onlinedocs/gcc/Debugging-Options.html