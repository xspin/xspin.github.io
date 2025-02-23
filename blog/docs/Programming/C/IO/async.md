# 异步IO库

## 简介
用于处理异步 I/O 和事件循环的高性能开源库有libevent、libev 和 libuv等，它们在不同的应用场景中都有广泛的应用。

> Libev的诞生，是为了修复Libevent设计上的一些错误决策。Nodejs刚出来的时候，底层并不是使用libuv，而是libev，但libev不支持Windows IOCP。于是Nodejs的作者 joyent大神提供了libuv来作为抽象封装层，在Unix系统上，通过封装libev，libeio 来调用Linux的epoll 和类UNIX上的 kqueue，在Windows 平台上的IOCP进行封装，自此之后Nodejs具备了跨平台能力，由Libuv作为中间层本身提供的跨平台的抽象，来根据系统决定使用libev、libeio、IOCP，后来在node-v0.9.0版本中，libuv移除了libev的内容。

## libevent

https://github.com/libevent/libevent

### 特点
- 跨平台支持：libevent 支持多种操作系统，包括 Linux、Windows、macOS 等，具有良好的可移植性。
- 丰富的事件类型：支持多种事件类型，如文件描述符事件（可读、可写等）、定时器事件、信号事件等。
- 简单易用：提供了相对简单的 API，易于上手，适合初学者使用。
- 广泛应用：在很多开源项目中被广泛使用，具有较高的稳定性和可靠性。

### 应用场景
- 网络编程：常用于开发高性能的网络服务器和客户端，如 HTTP 服务器、TCP 代理等。
- 事件驱动程序：适合开发需要处理大量异步事件的程序，如实时监控系统、消息队列等。


### 使用示例

```c
#include <event2/event.h>
#include <stdio.h>

// 定时器回调函数
void timer_callback(evutil_socket_t fd, short event, void *arg) {
    printf("Timer fired!\n");
}

int main() {
    // 创建事件库实例
    struct event_base *base = event_base_new();
    if (!base) {
        fprintf(stderr, "Could not initialize libevent!\n");
        return 1;
    }

    // 创建定时器事件
    // EV_PERSIST则循环执行
    struct event *timer_event = event_new(base, -1, EV_TIMEOUT, timer_callback, NULL);
    struct timeval tv;
    evutil_timerclear(&tv);
    tv.tv_sec = 1; // 定时器间隔为 1 秒
    event_add(timer_event, &tv);

    // 进入事件循环
    event_base_dispatch(base);

    // 释放资源
    event_free(timer_event);
    event_base_free(base);
    return 0;
}
```

## libev

https://github.com/enki/libev

### 特点
- 高性能：libev 采用了高效的事件循环机制，性能表现优秀，在处理大量并发连接时具有优势。
- 简洁的 API：API 设计简洁，减少了不必要的复杂性，便于开发者使用。
- 轻量级：库的体积较小，对系统资源的占用较少。

### 应用场景
- 高性能网络应用：适用于对性能要求极高的网络服务器和客户端开发，如高性能的游戏服务器、分布式系统等。
- 嵌入式系统：由于其轻量级的特点，适合在资源有限的嵌入式系统中使用。

### 使用示例
```c
#include <ev.h>
#include <stdio.h>

static int cnt = 0;
// 定时器回调函数
void timer_callback(struct ev_loop *loop, struct ev_timer *w, int revents) {
    printf("Timer fired!\n");
    if (++cnt > 3) {
        printf("Loop stopped!\n");
        ev_break(loop, EVBREAK_ALL); // 停止事件循环
    }
}

int main() {
    // 创建事件循环实例
    struct ev_loop *loop = EV_DEFAULT;

    // 创建定时器监视器
    struct ev_timer timer_watcher;
    ev_timer_init(&timer_watcher, timer_callback, 1.0, 1.0); // 初始延迟 1 秒，间隔 1 秒
    ev_timer_start(loop, &timer_watcher);

    // 进入事件循环
    ev_run(loop, 0);

    return 0;
}
```

## libuv

https://github.com/libuv/libuv

### 特点
- 跨平台和跨语言支持：libuv 不仅支持多种操作系统，还被 Node.js 等多种编程语言所采用，具有良好的跨语言特性。
- 丰富的功能：除了基本的事件循环和异步 I/O 功能外，还提供了文件系统操作、线程池、进程管理等丰富的功能。
- 异步 I/O 模型：采用异步 I/O 模型，能够高效地处理大量并发请求。

### 应用场景
- Node.js 开发：是 Node.js 的底层核心库，广泛应用于 Node.js 服务器端开发。
- 跨平台应用开发：适合开发需要跨平台运行的高性能应用程序，如桌面应用、移动应用的后端服务等。

### 使用示例

```c
#include <uv.h>
#include <stdio.h>

// 定时器回调函数
void timer_callback(uv_timer_t *handle) {
    printf("Timer fired!\n");
}


// 停止定时器回调函数
void stop_loop_callback(uv_timer_t *handle) {
    printf("Stopping loop!\n");
    uv_stop(handle->loop);
}

int main() {
    // 创建事件循环实例
    uv_loop_t *loop = uv_default_loop();

    // 创建定时器句柄
    uv_timer_t timer;
    uv_timer_init(loop, &timer);
    // 设置定时器回调函数和延迟时间
    uv_timer_start(&timer, timer_callback, 1000, 1000); // 初始延迟 1000 毫秒，间隔 1000 毫秒

    // 创建停止定时器句柄
    uv_timer_t stop_timer;
    uv_timer_init(loop, &stop_timer);
    uv_timer_start(&stop_timer, stop_loop_callback, 5000, 0); // 5 秒后停止事件循环

    // 进入事件循环
    uv_run(loop, UV_RUN_DEFAULT);
    return 0;
}
```

## 参考资料

- https://blog.csdn.net/txh1873749380/article/details/134571392
- https://zhuanlan.zhihu.com/p/611847234