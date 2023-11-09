package main

import (
	"log"
	"net/http"
	"strings"
)

func main() {
	go h.run()

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

	log.Fatal(http.ListenAndServe(":8080", nil))

}

func Split(path string) (string, string, string, string) {
	splitPath := strings.Split(path, "/")
	return splitPath[1], splitPath[2], splitPath[3], splitPath[4]
}
