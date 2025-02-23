# epoll

`epoll` 是 Linux 内核提供的一种高效的 I/O 事件通知机制。它在处理大量文件描述符时性能优越，适用于高并发网络服务器等场景。

## epoll 函数

### epoll_create

```c
int epoll_create(int size);
```

- **参数**
    - `size`：指定 epoll 实例的大小。这个参数在 Linux 2.6.8 之后的内核版本中被忽略，但仍然需要大于 0。
- **返回值**
    - 成功时返回一个 epoll 文件描述符，失败时返回 -1 并设置 `errno`。

### epoll_ctl

```c
int epoll_ctl(int epfd, int op, int fd, struct epoll_event *event);
```

- **参数**
    - `epfd`：由 `epoll_create` 返回的 epoll 文件描述符。
    - `op`：指定操作类型，可以是以下值之一：
        - `EPOLL_CTL_ADD`：注册新的 fd 到 epfd。
        - `EPOLL_CTL_MOD`：修改已经注册的 fd 的监听事件。
        - `EPOLL_CTL_DEL`：从 epfd 注销 fd。
    - `fd`：需要操作的目标文件描述符。
    - `event`：指向 `epoll_event` 结构体的指针，用于描述 fd 的事件和相关数据。

### epoll_wait

```c
int epoll_wait(int epfd, struct epoll_event *events, int maxevents, int timeout);
```

- **参数**
    - `epfd`：由 `epoll_create` 返回的 epoll 文件描述符。
    - `events`：指向 `epoll_event` 结构体数组的指针，用于存储发生的事件。
    - `maxevents`：`events` 数组的大小，即一次最多处理的事件数。
    - `timeout`：等待事件发生的超时时间（毫秒）。-1 表示无限等待，0 表示立即返回。

- **返回值**
    - 成功时返回发生的事件数，失败时返回 -1 并设置 `errno`。

## epoll_event 结构体

```c
struct epoll_event {
        uint32_t events;    /* Epoll events */
        epoll_data_t data;  /* User data variable */
};
```

- **成员**
    - `events`：事件类型，可以是以下值的组合：
        - `EPOLLIN`：表示对应的文件描述符可以读。
        - `EPOLLOUT`：表示对应的文件描述符可以写。
        - `EPOLLET`：设置边缘触发模式。
        - `EPOLLERR`：表示对应的文件描述符发生错误。
        - `EPOLLHUP`：表示对应的文件描述符被挂断。
    - `data`：用户数据，可以是文件描述符或指针。

## 示例代码

```c
#include <sys/epoll.h>
#include <unistd.h>
#include <stdio.h>

int main() {
        int epfd = epoll_create(1);
        if (epfd == -1) {
                perror("epoll_create");
                return 1;
        }

        struct epoll_event event;
        event.events = EPOLLIN;
        event.data.fd = STDIN_FILENO;

        if (epoll_ctl(epfd, EPOLL_CTL_ADD, STDIN_FILENO, &event) == -1) {
                perror("epoll_ctl");
                close(epfd);
                return 1;
        }

        struct epoll_event events[10];
        int nfds = epoll_wait(epfd, events, 10, -1);
        if (nfds == -1) {
                perror("epoll_wait");
                close(epfd);
                return 1;
        }

        for (int i = 0; i < nfds; ++i) {
                if (events[i].data.fd == STDIN_FILENO) {
                        printf("stdin is readable\n");
                }
        }

        close(epfd);
        return 0;
}
```

以上代码展示了如何使用 `epoll` 监听标准输入的可读事件。