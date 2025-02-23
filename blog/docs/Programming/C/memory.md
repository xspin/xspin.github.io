# C内存管理

## 内存分区

在C/C++中内存分为5个区，分别为**栈区、堆区、全局/静态存储区、常量存储区、代码区。**

### 栈区（Stack）
- 自动分配和释放：栈内存由操作系统自动管理。当进入一个函数时，函数内部的局部变量（包括函数参数）会被自动分配到栈上；当函数执行结束返回时，这些变量所占用的内存会被自动释放。
- 后进先出（LIFO）：栈的操作遵循后进先出的原则，就像一摞盘子，最后放上去的盘子总是最先被拿走。新的变量总是被分配在栈顶，当函数返回时，栈顶指针会向下移动，释放最近分配的变量所占用的内存。
- 空间有限：栈的空间大小是有限的，通常在编译时就已经确定。如果在函数中定义了过大的局部变量或者进行了过深的递归调用，可能会导致栈溢出错误。


```c
#include <stdio.h>

int main() {
    int a = 10;  // 变量 a 被分配在栈上
    printf("%d\n", a);
    return 0;
}
```

### 堆区（Heap）
- 手动分配和释放：堆内存需要程序员手动进行管理。使用 malloc()、calloc()、realloc() 等函数可以在堆上分配内存，使用 free() 函数释放之前分配的内存。如果忘记释放堆内存，会导致内存泄漏问题。
- 动态分配：堆内存的分配是动态的，可以根据程序的需要在运行时分配不同大小的内存块。
- 空间较大：相比于栈区，堆区的空间通常较大，但如果频繁地进行内存分配和释放操作，可能会导致内存碎片化问题，降低内存的使用效率。


```c
#include <stdio.h>
#include <stdlib.h>

int main() {
    int *ptr = (int *)malloc(sizeof(int));  // 在堆上分配一个 int 大小的内存块
    if (ptr == NULL) {
        printf("内存分配失败\n");
        return 1;
    }
    *ptr = 20;
    printf("%d\n", *ptr);
    free(ptr);  // 释放堆内存
    return 0;
}
```

### 全局区/静态区（Global/Static Area）
- `.data / .bss`
- 程序运行期间一直存在：全局区的变量在程序启动时被分配内存，直到程序结束才会被释放。
- 分为已初始化和未初始化部分：已初始化的全局变量和静态变量存放在已初始化数据段（.data），未初始化的全局变量和静态变量存放在未初始化数据段（.bss）。.bss 段中的变量会被自动初始化为 0。

```c
#include <stdio.h>

int global_var = 10;  // 已初始化的全局变量，存放在 .data 段
static int static_var;  // 未初始化的静态变量，存放在 .bss 段，自动初始化为 0

int main() {
    printf("global_var: %d\n", global_var);
    printf("static_var: %d\n", static_var);
    return 0;
}
```

### 常量区（Constant Area）
- `.rodata`
- 只读：常量区存储的是常量数据，如字符串常量、常量变量等。这些数据在程序运行期间是只读的，不能被修改。如果试图修改常量区的数据，会导致程序崩溃或产生未定义行为。
- 程序运行期间一直存在：常量区的内容在程序启动时被加载到内存中，直到程序结束才会被释放。

```c
#include <stdio.h>

int main() {
    const char *str = "Hello, World!";  // 字符串常量存放在常量区
    printf("%s\n", str);
    return 0;
}
```


### 代码区（Code Area）
- `.text`
- 只读：代码区存储的是程序的可执行代码，也就是编译后的机器指令。这些指令在程序运行期间是只读的，不能被修改，以确保程序的稳定性和安全性。
- 共享：多个进程可以共享同一份代码区，这样可以节省内存空间。


### 代码示例

@import "assets/memory.c"


运行结果

```
% ./memory 
Local variable in function: 50, Address: 0x7ff7b568537c
Global variable: 10, Address: 0x10a882028
Global uninit variable: 0, Address: 0x10a88203c
Static variable: 20, Address: 0x10a882038
Stack variable: 30, Address: 0x7ff7b5685398
Heap variable: 40, Address: 0x7ff353705ac0
Constant string: Hello, World!, Address: 0x10a87de88
```

使用 `objdump` 查看符号表

```
% objdump -t memory

memory: file format mach-o 64-bit x86-64

SYMBOL TABLE:
0000000100008020 l     O __DATA,__data __dyld_private
0000000100008038 l     O __DATA,__data _static_var
0000000100000000 g     F __TEXT,__text __mh_execute_header
0000000100008030 g     O __DATA,__data _const_str
0000000100003cf0 g     F __TEXT,__text _demonstrate_memory_areas
000000010000803c g     O __DATA,__common _global_uninit_var
0000000100008028 g     O __DATA,__data _global_var
0000000100003d20 g     F __TEXT,__text _main
0000000000000000         *UND* ___stderrp
0000000000000000         *UND* _fprintf
0000000000000000         *UND* _free
0000000000000000         *UND* _malloc
0000000000000000         *UND* _printf
0000000000000000         *UND* dyld_stub_binder
```



## 内存分配

在C中，内存分配函数有
- `malloc()` 函数用于在堆上分配指定大小的连续内存块，单位是字节。分配成功时返回指向该内存块起始地址的指针；若分配失败（例如系统内存不足），则返回 `NULL`。
- `calloc()` 函数同样用于在堆上分配内存，它与 `malloc()` 的不同之处在于，`calloc()` 会将分配的内存块初始化为 0。该函数接受两个参数，第一个参数指定要分配的元素个数，第二个参数指定每个元素的大小。
- `realloc()` 函数用于重新调整之前通过 `malloc()`、`calloc()` 或 `realloc()` 分配的内存块的大小。它可以扩大或缩小内存块的大小。若扩大内存块，原内存块中的数据会被保留；若缩小内存块，超出新大小部分的数据会被丢弃。
- `alloca()` 函数用于在栈上分配内存，与上述在堆上分配内存的函数不同。它在调用它的函数返回时，自动释放所分配的内存，无需手动调用 `free()` 函数。（注：只有部分编译器支持）

## 参考资料

- https://zhuanlan.zhihu.com/p/52125577
- https://www.runoob.com/cprogramming/c-standard-library-stdlib-h.html
- https://blog.csdn.net/Dai_renwen/article/details/145247830
- https://blog.csdn.net/AngelDg/article/details/104871782