# 内存屏障

## 简介

在现代计算机系统中，为了提高CPU的运行效率，特别是多核CPU，每个核都有独立的Cache和寄存器，计算机指令可能会被重排序运行，同时还会使用缓存来减少对主内存的访问延迟，另外编译器的优化也可能使指令重排。而这种乱序的指令执行就可能导致异常的行为。

- 多核CPU乱序执行指令的示例

```
# 2 核cpu执行下列指令的乱序执行示例

    CPU 1           CPU 2
    =============== ===============
    { A == 1; B == 2 }
    A = 3;          x = B;
    B = 4;          y = A;

# 可能的执行顺序：
    STORE A=3,      STORE B=4,      y=LOAD A->3,    x=LOAD B->4
    STORE A=3,      STORE B=4,      x=LOAD B->4,    y=LOAD A->3
    STORE A=3,      y=LOAD A->3,    STORE B=4,      x=LOAD B->4
    STORE A=3,      y=LOAD A->3,    x=LOAD B->2,    STORE B=4
    STORE A=3,      x=LOAD B->2,    STORE B=4,      y=LOAD A->3
    STORE A=3,      x=LOAD B->2,    y=LOAD A->3,    STORE B=4
    STORE B=4,      STORE A=3,      y=LOAD A->3,    x=LOAD B->4
    STORE B=4, ...

# x和y可能的值：
    x == 2, y == 1
    x == 2, y == 3
    x == 4, y == 1
    x == 4, y == 3
```

- 编译优化导致的指令乱序示例

```c
int x, y, r;
void f() {
    x = r;
    y = 1;
}
```

```assembly
// 无优化 -O0
f:
        pushq   %rbp
        movq    %rsp, %rbp
        movl    r(%rip), %eax
        movl    %eax, x(%rip)
        movl    $1, y(%rip)
        nop
        popq    %rbp
        ret
```

```assembly
// 有优化 -O2
f:
        movl    $1, y(%rip)
        movl    r(%rip), %eax
        movl    %eax, x(%rip)
        ret
```


为解决这种问题，就有了内存屏障（Memory Brrier）技术，也被称为内存栅栏，是一种用于控制和确保内存操作的顺序和可见性，在多处理器系统和并发编程中起着至关重要的作用。内存屏障可分为编译器内存屏障和CPU内存屏障。

## 编译器内存屏障

### 概述
编译器内存屏障是一种软件机制，主要用于阻止编译器对代码中的内存操作进行重排序。编译器为了优化代码执行效率，会对指令进行重新排列，但在多线程环境下，这种重排序可能会破坏程序的正确性，编译器内存屏障可以告诉编译器不要对某些内存操作进行重排序。

作用：
- 保证代码逻辑顺序：确保编译器不会对关键的内存操作进行不恰当的重排序，使得代码的执行顺序与程序员编写的逻辑顺序一致。
- 配合 CPU 内存屏障：在插入 CPU 内存屏障指令之前，需要保证编译器不会打乱相关内存操作的顺序，以确保 CPU 内存屏障能够发挥预期的作用。

### 实现方式
- 特定关键字：在一些编程语言中，使用特定的关键字来实现编译器内存屏障。例如，在 C/C++ 中，volatile 关键字可以禁止编译器对 volatile 变量的读写操作进行重排序。
- 内联汇编或特定函数：在 C/C++ 中，可以使用内联汇编或者一些库提供的特定函数来插入编译器内存屏障。例如，GCC 提供了 `__sync_synchronize()` 函数，它会插入一个编译器和 CPU 内存屏障。

```c
int x, y, r;
void f() {
    // 编译器不会对以下操作进行重排序
    x = r;
    __sync_synchronize();
    y = 1;
}
```

```asm
f:
        movl    r(%rip), %eax
        movl    %eax, x(%rip)
        mfence
        movl    $1, y(%rip)
        retq
```

## CPU 内存屏障
### 概述
CPU 内存屏障是一种硬件机制，用于控制 CPU 对内存的访问顺序，确保内存操作按照预期的顺序执行，并保证不同 CPU 核心或处理器之间对内存操作结果的可见性。由于现代 CPU 为了提高性能，会对指令进行重排序以及使用缓存，这些优化可能导致在多线程环境下出现内存操作顺序不一致和数据可见性问题，CPU 内存屏障就是为了解决这些问题而引入的。
作用：
- 保证内存操作顺序：防止 CPU 对内存读写指令进行不恰当的重排序，确保某些内存操作在其他操作之前或之后完成。例如，在一些同步操作中，需要保证写操作先完成，后续的读操作才能看到更新后的数据。
- 确保数据可见性：使一个 CPU 核心或处理器对内存的修改能够及时被其他 CPU 核心或处理器看到。通过刷新缓存等操作，将数据从缓存写回到主内存，或者从主内存读取最新的数据到缓存。

常见类型及实现：
- 写屏障（Store Barrier）：确保在写屏障之前的所有写操作都在写屏障之后的写操作之前完成，并且这些写操作的结果对其他处理器可见。在 x86 架构中，sfence 指令就是一个写屏障指令。
- 读屏障（Load Barrier）：确保在读屏障之后的所有读操作都能看到读屏障之前的所有写操作的结果。x86 架构中的 lfence 指令属于读屏障指令。
- 全屏障（Full Barrier）：结合了写屏障和读屏障的功能，确保在全屏障之前的所有内存操作（读和写）都在全屏障之后的所有内存操作之前完成，并且这些操作的结果对其他处理器可见。x86 架构中的 mfence 指令就是全屏障指令。

不同的平台和编译器有不同的方法实现屏障。在 x86 架构中，可以使用内联汇编来插入 CPU 内存屏障指令。x86 提供了三种类型的内存屏障指令：lfence（读屏障）、sfence（写屏障）和 mfence（全屏障）。


```c
#include <stdio.h>

// 读屏障
#define READ_BARRIER() __asm__ volatile("lfence" : : : "memory")
// 写屏障
#define WRITE_BARRIER() __asm__ volatile("sfence" : : : "memory")
// 全屏障
#define FULL_BARRIER() __asm__ volatile("mfence" : : : "memory")

int a = 1;
int b = 2;
int val_b, val_a;

void f() {
    // 写入 a
    a = 10;
    // 插入写屏障，确保 a 的写入操作在后续操作之前完成
    WRITE_BARRIER();
    // 写入 b
    b = 20;

    // 读取 b
    val_b = b;
    // 插入读屏障，确保读取 b 的操作能看到之前所有写操作的结果
    READ_BARRIER();
    // 读取 a
    val_a = a;

    // 全屏障
    FULL_BARRIER();
    a = 1;
}
```

汇编结果：
```asm
f:
        movl    $10, a(%rip)
        sfence
        movl    $20, b(%rip)
        movl    $20, val_b(%rip)
        lfence
        movl    a(%rip), %eax
        movl    %eax, val_a(%rip)
        mfence
        movl    $1, a(%rip)
        retq
```

- `__asm__ volatile` 是 GCC 编译器用于插入内联汇编的关键字。`__asm__` 表示这是一段汇编代码，`volatile` 告诉编译器不要对这段汇编代码进行优化。
- `lfence`、`sfence` 和 `mfence` 分别是 x86 的读屏障、写屏障和全屏障指令。
- `: : : "memory"` 告诉编译器，这段汇编代码会对内存进行读写操作，从而防止编译器对内存操作进行重排序。

为了实现跨平台的 CPU 内存屏障，可以使用一些库或者编译器提供的通用接口。例如，GCC 提供了 `__sync_synchronize()` 函数，它会插入一个全屏障。

## 参考资料
- https://www.kernel.org/doc/html/latest/core-api/wrappers/memory-barriers.html
- https://zhuanlan.zhihu.com/p/125737864
- https://www.cnblogs.com/Chary/p/18112934
- https://zhuanlan.zhihu.com/p/454564295
- https://zhuanlan.zhihu.com/p/102307258