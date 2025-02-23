# select

`select` 函数用于在多路复用 I/O 操作中监视多个文件描述符，以查看是否有任何一个文件描述符准备好进行 I/O 操作。它通常用于网络编程中，以便在单个线程中处理多个套接字。

## 函数原型

```c
#include <sys/select.h>

int select(int nfds, fd_set *readfds, fd_set *writefds, fd_set *exceptfds, struct timeval *timeout);
```

## 参数说明

- `nfds`: 需要监视的文件描述符数量。它的值应为所有文件描述符中最大值加1。
- `readfds`: 指向一个 `fd_set` 结构的指针，用于监视可读的文件描述符。如果不需要监视可读性，可以传递 `NULL`。
- `writefds`: 指向一个 `fd_set` 结构的指针，用于监视可写的文件描述符。如果不需要监视可写性，可以传递 `NULL`。
- `exceptfds`: 指向一个 `fd_set` 结构的指针，用于监视异常条件的文件描述符。如果不需要监视异常条件，可以传递 `NULL`。
- `timeout`: 指向一个 `timeval` 结构的指针，用于指定等待的超时时间。如果传递 `NULL`，`select` 将无限期地阻塞，直到有文件描述符准备好。

## 返回值

- 成功时，返回准备好的文件描述符数量。
- 失败时，返回 `-1`，并设置 `errno` 以指示错误类型。

## 示例代码

在示例中，`select` 函数监视标准输入（文件描述符 0）是否有数据可读，并在 5 秒后超时。

```c
#include <stdio.h>
#include <sys/select.h>
#include <unistd.h>

int main() {
    fd_set readfds;
    struct timeval timeout;
    int ret;

    // 清空文件描述符集合
    FD_ZERO(&readfds);
    // 将标准输入（文件描述符 0）加入集合
    FD_SET(0, &readfds);

    // 设置超时时间为 5 秒
    timeout.tv_sec = 5;
    timeout.tv_usec = 0;

    // 调用 select 函数
    ret = select(1, &readfds, NULL, NULL, &timeout);

    if (ret == -1) {
        perror("select");
    } else if (ret) {
        printf("数据可读\n");
    } else {
        printf("超时\n");
    }

    return 0;
}
```


@import "assets/sample_select.c"