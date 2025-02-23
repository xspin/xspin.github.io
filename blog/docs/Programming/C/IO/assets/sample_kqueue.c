#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <fcntl.h>
#include <unistd.h>
#include <sys/event.h>
#include <sys/time.h>
#include <string.h>

#define FILENAME "/tmp/test_kqueue.txt"
#define BUFFER_SIZE 1024

void *write_thread(void *arg) {
    int fd = open(FILENAME, O_WRONLY | O_CREAT | O_TRUNC, 0644);
    if (fd == -1) {
        perror("open");
        return NULL;
    }

    char message[BUFFER_SIZE];
    for (int i = 0; i < 5; i++) {
        sprintf(message, "Message %d\n", i);
        printf("Write: %s", message);
        write(fd, message, strlen(message));
        sleep(1);
    }
    sprintf(message, "STOP\n");
    write(fd, message, strlen(message));
    close(fd);

    return NULL;
}

void *read_thread(void *arg) {
    int kq = kqueue();
    if (kq == -1) {
        perror("kqueue");
        return NULL;
    }

    sleep(2);
    int fd = open(FILENAME, O_RDONLY);
    if (fd == -1) {
        perror("open");
        return NULL;
    }

    struct kevent change;
    EV_SET(&change, fd, EVFILT_VNODE, EV_ADD | EV_ENABLE | EV_CLEAR, NOTE_WRITE, 0, NULL);

    if (kevent(kq, &change, 1, NULL, 0, NULL) == -1) {
        perror("kevent");
        close(fd);
        return NULL;
    }

    struct kevent event;
    while (1) {
        int nev = kevent(kq, NULL, 0, &event, 1, NULL);
        if (nev == -1) {
            perror("kevent");
            close(fd);
            return NULL;
        } else if (nev > 0) {
            if (event.filter == EVFILT_VNODE) {
                char buffer[BUFFER_SIZE];
                // lseek(fd, 0, SEEK_SET);
                ssize_t bytes_read = read(fd, buffer, sizeof(buffer) - 1);
                if (bytes_read > 0) {
                    buffer[bytes_read] = '\0';
                    printf("Read from file: %s", buffer);
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

    unlink(FILENAME);

    return 0;
}