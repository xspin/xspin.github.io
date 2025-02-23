# C语言内存问题

## 内存泄漏（Memory Leak）
问题描述：程序在动态分配内存后，没有及时释放这些内存，导致系统可用内存逐渐减少，最终可能导致系统性能下降甚至崩溃。

```c
#include <stdio.h>
#include <stdlib.h>

void memory_leak_example() {
    int *ptr = (int *)malloc(sizeof(int));
    // 未释放分配的内存
    // free(ptr); 
}

int main() {
    memory_leak_example();
    return 0;
}
```

解决办法：确保每次使用 malloc()、calloc() 或 realloc() 分配内存后，在不再使用时使用 free() 释放内存。

## 悬空指针（Dangling Pointer）
问题描述：指针指向的内存已经被释放，但指针仍然保留该内存地址，继续使用该指针会导致未定义行为。


```c
#include <stdio.h>
#include <stdlib.h>

int main() {
    int *ptr = (int *)malloc(sizeof(int));
    *ptr = 10;
    free(ptr);
    // ptr 成为悬空指针
    printf("%d\n", *ptr); 
    return 0;
}
```

解决办法：在释放内存后，将指针置为 NULL，避免再次使用该指针。例如：free(ptr); ptr = NULL;


## 野指针（Wild Pointer）
问题描述：指针未被初始化就被使用，它指向的是一个随机的内存地址，访问该指针会导致不可预测的结果。

```c
#include <stdio.h>

int main() {
    int *ptr;
    // ptr 未初始化
    *ptr = 10; 
    printf("%d\n", *ptr);
    return 0;
}
```

解决办法：在定义指针时，要么立即初始化它指向一个有效的内存地址，要么将其初始化为 NULL。


## 内存越界访问（Out-of-bounds Access）
问题描述：程序访问了超出所分配内存范围的地址，可能会破坏其他数据或导致程序崩溃。

```c
#include <stdio.h>
#include <stdlib.h>

int main() {
    int *arr = (int *)malloc(3 * sizeof(int));
    // 越界访问
    arr[3] = 10; 
    free(arr);
    return 0;
}
```

解决办法：在访问数组或动态分配的内存时，确保访问的索引在合法范围内。


## 重复释放内存（Double Free）
问题描述：对同一块内存多次调用 free() 函数，这会导致未定义行为。

```c
#include <stdio.h>
#include <stdlib.h>

int main() {
    int *ptr = (int *)malloc(sizeof(int));
    free(ptr);
    // 重复释放
    free(ptr); 
    return 0;
}
```

解决办法：确保每块内存只被释放一次，释放后将指针置为 NULL，避免重复释放。


## 内存分配失败处理不当
问题描述：使用 malloc()、calloc() 或 realloc() 分配内存时，可能会因为系统内存不足等原因导致分配失败，若程序没有正确处理这种情况，可能会引发后续错误。

```c
#include <stdio.h>
#include <stdlib.h>

int main() {
    int *ptr = (int *)malloc(1000000000 * sizeof(int));
    // 未检查分配是否成功
    *ptr = 10; 
    free(ptr);
    return 0;
}
```

解决办法：在分配内存后，检查返回值是否为 NULL，若为 NULL 则进行相应的错误处理。


## realloc() 使用不当
问题描述：在使用 realloc() 重新分配内存时，如果传入 NULL 指针，它的行为等同于 malloc()；如果传入非 NULL 指针但新大小为 0，它的行为等同于 free()。若不了解这些规则，可能会导致内存管理混乱。

```c
#include <stdio.h>
#include <stdlib.h>

int main() {
    int *ptr = (int *)malloc(3 * sizeof(int));
    // 未正确处理 realloc() 可能的失败情况
    ptr = (int *)realloc(ptr, 0); 
    // 此时 ptr 可能为 NULL，后续使用会出错
    // *ptr = 10; 
    return 0;
}
```

解决办法：在使用 realloc() 时，先检查返回值是否为 NULL，若为 NULL 则保留原指针，避免丢失原内存地址。

