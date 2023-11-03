package main

import (
	"github.com/gin-gonic/gin"
)

func main() {
	go h.run()

	router := gin.New()
	router.LoadHTMLFiles("index.html")

	router.GET("/room/:userName/:roomId", func(c *gin.Context) {
		c.HTML(200, "index.html", nil)
	})

	router.GET("/ws/:roomId/:userId/:userName", func(c *gin.Context) {
		roomId := c.Param("roomId")
		userId := c.Param("userId")
		userName := c.Param("userName")
		serveWs(c.Writer, c.Request, roomId, userId, userName)
	})

	router.Run("0.0.0.0:8080")
}
