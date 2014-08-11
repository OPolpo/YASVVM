CC = g++
CFLAGS = -g -Wall -Wextra
LIBS = -lxmlrpc_server_abyss++ -lxmlrpc_server++ -lxmlrpc_server_abyss -lxmlrpc_server -lxmlrpc_abyss  -lpthread -lxmlrpc++ -lxmlrpc  -lxml2 -lxmlrpc_util -lopencv_core -lopencv_imgproc -lopencv_highgui

SRC = yasvvm.c
BIN = yasvvm

all: $(BIN)

$(BIN): $(SRC)
	$(CC) -o $@ $(CFLAGS) $^ $(LIBS)
