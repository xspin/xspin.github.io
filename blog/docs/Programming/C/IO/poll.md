# poll

`poll` 函数用于监视多个文件描述符，以查看它们是否有 I/O 事件发生。它是 `select` 函数的替代品，提供了更高效的文件描述符监视机制。

## 函数原型

```c
#include <poll.h>

int poll(struct pollfd *fds, nfds_t nfds, int timeout);
```

## 参数说明

- `fds`: 一个指向 `pollfd` 结构体数组的指针，每个结构体表示一个要监视的文件描述符及其事件。
- `nfds`: `fds` 数组中的元素数量。
- `timeout`: 等待事件发生的超时时间（毫秒）。如果为负值，`poll` 将无限期地等待。

## `pollfd` 结构体

```c
struct pollfd {
    int fd;         // 文件描述符
    short events;   // 要监视的事件
    short revents;  // 实际发生的事件
};
```

## 事件类型

- `POLLIN`: 有数据可读。
- `POLLOUT`: 可以写数据。
- `POLLERR`: 发生错误。
- `POLLHUP`: 挂起事件。
- `POLLNVAL`: 文件描述符无效。

## 返回值

- 成功时返回准备好的文件描述符数量。
- 失败时返回 -1，并设置 `errno` 以指示错误。

## 示例代码

```c
#include <stdio.h>
#include <poll.h>
#include <unistd.h>

int main() {
    struct pollfd fds[1];
    fds[0].fd = 0; // 标准输入
    fds[0].events = POLLIN;

    int ret = poll(fds, 1, 5000); // 等待 5 秒

    if (ret == -1) {
        perror("poll");
        return 1;
    } else if (ret == 0) {
        printf("超时，无事件发生\n");
    } else {
        if (fds[0].revents & POLLIN) {
            printf("标准输入有数据可读\n");
        }
    }

    return 0;
}
```

@import "assets/sample_poll.c"