#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/types.h>
#include <sys/event.h>
#include <sys/time.h>
#include <sys/epoll.h>
#include <string.h>

#define FILENAME "/tmp/test_epoll.txt"
#define MAX_EVENTS 10

void *write_thread(void *arg) {
    int fd = open(FILENAME, O_WRONLY | O_CREAT | O_TRUNC, 0644);
    if (fd == -1) {
        perror("open");
        return NULL;
    }

    const char *message = "Hello from the write thread!\n";
    while (1) {
        write(fd, message, strlen(message));
        sleep(1);
    }

    close(fd);
    return NULL;
}

void *read_thread(void *arg) {
    int epoll_fd = epoll_create1(0);
    if (epoll_fd == -1) {
        perror("epoll_create1");
        return NULL;
    }

    int fd = open(FILENAME, O_RDONLY);
    if (fd == -1) {
        perror("open");
        return NULL;
    }

    struct epoll_event event;
    event.events = EPOLLIN;
    event.data.fd = fd;

    if (epoll_ctl(epoll_fd, EPOLL_CTL_ADD, fd, &event) == -1) {
        perror("epoll_ctl");
        return NULL;
    }

    struct epoll_event events[MAX_EVENTS];
    char buffer[256];

    while (1) {
        int n = epoll_wait(epoll_fd, events, MAX_EVENTS, -1);
        if (n == -1) {
            perror("epoll_wait");
            return NULL;
        }

        for (int i = 0; i < n; i++) {
            if (events[i].events & EPOLLIN) {
                int bytes_read = read(events[i].data.fd, buffer, sizeof(buffer) - 1);
                if (bytes_read > 0) {
                    buffer[bytes_read] = '\0';
                    printf("Read: %s", buffer);
                }
            }
        }
    }

    close(fd);
    close(epoll_fd);
    return NULL;
}

int main() {
    pthread_t writer, reader;

    if (pthread_create(&writer, NULL, write_thread, NULL) != 0) {
        perror("pthread_create");
        return 1;
    }

    if (pthread_create(&reader, NULL, read_thread, NULL) != 0) {
        perror("pthread_create");
        return 1;
    }

    pthread_join(writer, NULL);
    pthread_join(reader, NULL);

    return 0;
}