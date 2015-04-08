CC = g++
CFLAGS = -g -Wall -Wextra
LIBS = -lopencv_core -lopencv_imgproc -lopencv_highgui

SRC = yasvvm.cpp
BIN = yasvvm

all: $(BIN)

$(BIN): $(SRC)
	$(CC) -o $@ $(CFLAGS) $^ $(LIBS)

install: $(BIN)
	mv $(BIN) /Applications/MAMP/htdocs/YASVVM/
