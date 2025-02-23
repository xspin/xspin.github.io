#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <fcntl.h>
#include <poll.h>
#include <string.h>
#include <pthread.h>

#define TIMEOUT 1000 // Timeout in milliseconds
#define BUFFER_SIZE 1024
#define FILENAME "/tmp/test_poll.txt"

void *write_thread(void *arg) {
    int fd_write = open(FILENAME, O_WRONLY | O_CREAT | O_TRUNC, 0644);
    if (fd_write < 0) {
        perror("open");
        exit(EXIT_FAILURE);
    }
    struct pollfd fds;
    fds.fd = fd_write;
    fds.events = POLLOUT;

    char data[BUFFER_SIZE];
    for (int i = 0; i < 5; i++) {
        int ret = poll(&fds, 1, TIMEOUT);
        if (ret == -1) {
            perror("poll");
            close(fd_write);
            pthread_exit(NULL);
        } else if (ret == 0) {
            printf("Write timeout occurred!\n");
        } else {
            if (fds.revents & POLLOUT) {
                sprintf(data, "Message %d\n", i);
                printf("Write: %s", data);
                ssize_t bytes_written = write(fd_write, data, strlen(data));
                if (bytes_written < 0) {
                    perror("write");
                } else {
                    printf("Wrote %zd bytes to output.txt\n", bytes_written);
                }
            }
        }
        sleep(1);
    }
    sprintf(data, "STOP\n");
    printf("Write: %s\n", data);
    write(fd_write, data, strlen(data));
    close(fd_write);
    // pthread_exit(NULL);
    return NULL;
}

void *read_thread(void *arg) {
    sleep(2);
    int fd_read = open(FILENAME, O_RDONLY);
    if (fd_read < 0) {
        perror("open");
        exit(EXIT_FAILURE);
    }
    struct pollfd fds;
    fds.fd = fd_read;
    fds.events = POLLIN;
    char buffer[BUFFER_SIZE];

    while (1) {
        int ret = poll(&fds, 1, TIMEOUT);
        if (ret == -1) {
            perror("poll");
            close(fd_read);
            pthread_exit(NULL);
        } else if (ret == 0) {
            printf("Read timeout occurred!\n");
        } else {
            if (fds.revents & POLLIN) {
                ssize_t bytes_read = read(fd_read, buffer, BUFFER_SIZE);
                if (bytes_read < 0) {
                    perror("read");
                } else if (bytes_read > 0) {
                    buffer[bytes_read] = '\0';
                    printf("Read: %s\n", buffer);
                    if (strcmp(buffer, "STOP\n") == 0) {
                        break;
                    }
                }
            }
        }
    }
    close(fd_read);
    pthread_exit(NULL);
    return NULL;
}

int main() {
    pthread_t tid_read, tid_write;

    unlink(FILENAME);
    pthread_create(&tid_write, NULL, write_thread, NULL);
    pthread_create(&tid_read, NULL, read_thread, NULL);

    pthread_join(tid_read, NULL);
    pthread_join(tid_write, NULL);

    printf("Done!\n");
    unlink(FILENAME);

    return 0;
}