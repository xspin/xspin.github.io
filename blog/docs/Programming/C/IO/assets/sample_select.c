#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/select.h>
#include <string.h>
#include <sys/un.h>

#define FILENAME "/tmp/test_select.txt"
#define BUFFER_SIZE 1024

void *write_thread(void *arg) {
    int fd = open(FILENAME, O_WRONLY | O_CREAT | O_TRUNC, 0644);
    if (fd < 0) {
        perror("write open");
        return NULL;
    }

    char message[BUFFER_SIZE];
    for (int i=0; i<5; i++) {
        sprintf(message, "Message %d\n", i);
        printf("Write: %s", message);
        write(fd, message, strlen(message));
        sleep(1);
    }
    sprintf(message, "STOP\n");
    printf("Write: %s", message);
    write(fd, message, strlen(message));

    close(fd);
    return NULL;
}

void *read_thread(void *arg) {
    sleep(2);
    int fd = open(FILENAME, O_RDONLY);
    if (fd < 0) {
        perror("read open");
        return NULL;
    }

    fd_set readfds;
    char buffer[BUFFER_SIZE];
    while (1) {
        FD_ZERO(&readfds);
        FD_SET(fd, &readfds);

        struct timeval timeout = {1, 0}; // 1 second timeout
        int ret = select(fd + 1, &readfds, NULL, NULL, &timeout);
        if (ret < 0) {
            perror("select");
            break;
        } else if (ret == 0) {
            printf("Timeout occurred! No data.\n");
        } else {
            if (FD_ISSET(fd, &readfds)) {
                int bytes_read = read(fd, buffer, BUFFER_SIZE - 1);
                if (bytes_read < 0) {
                    perror("read");
                    break;
                } else if (bytes_read == 0) {
                    // printf("EOF reached.\n");
                } else {
                    buffer[bytes_read] = '\0';
                    printf("Read: %s", buffer);
                    if (strcmp(buffer, "STOP\n") == 0) {
                        break;
                    }
                }
            }
        }
    }

    close(fd);
    return NULL;
}

int main() {
    pthread_t writer, reader;
    unlink(FILENAME);

    pthread_create(&writer, NULL, write_thread, NULL);
    pthread_create(&reader, NULL, read_thread, NULL);

    pthread_join(writer, NULL);
    pthread_join(reader, NULL);

    unlink(FILENAME);
    return 0;
}