CC = g++
CFLAGS = -g -Wall -Wextra
LIBS = -lopencv_core -lopencv_imgproc -lopencv_highgui

SRC = yasvvm.c
BIN = yasvvm

all: $(BIN)

$(BIN): $(SRC)
	$(CC) -o $@ $(CFLAGS) $^ $(LIBS)
