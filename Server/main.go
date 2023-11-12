package main

import (
	"flag"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

func main() {
	go h.run()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	addr := flag.String("addr", ":"+port, "http service address")

	http.HandleFunc("/room/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "index.html")
	})

	http.HandleFunc("/ws/", func(w http.ResponseWriter, r *http.Request) {
		_, userName, userId, roomId := Split(r.URL.Path)
		serveWs(w, r, roomId, userId, userName)
	})

	http.HandleFunc("/lobby/", func(w http.ResponseWriter, r *http.Request) {
		serveLobby(w, r)
	})

	server := &http.Server{
		Addr:              *addr,
		ReadHeaderTimeout: 3 * time.Second,
	}
	err := server.ListenAndServe()
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}

func Split(path string) (string, string, string, string) {
	splitPath := strings.Split(path, "/")
	return splitPath[1], splitPath[2], splitPath[3], splitPath[4]
}
