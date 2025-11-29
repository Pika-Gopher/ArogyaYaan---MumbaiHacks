package controllers

import (
	"backend/models"
	"backend/db"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type LoginInput struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func LoginHandler(c *gin.Context) {
	var input LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	db := db.GetDB()
	var user models.User

	// 1. Find User by Email
	if err := db.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}
	// 2. Verify Password using bcrypt (passwords are stored as bcrypt hashes)
	// Make sure to add "golang.org/x/crypto/bcrypt" to your imports.
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password)); err != nil {
		// mismatch or error -> unauthorized
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// 3. Generate JWT Token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":  user.ID,
		"email":    user.Email,
		"role":     user.Role,     // 'DHO' or 'PHC_Staff'
		"district": user.District, // Critical for data filtering
		"fac_id":   user.FacilityID,
		"exp":      time.Now().Add(time.Hour * 24).Unix(),
	})

	tokenString, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// 4. Return Token & User Info (for Frontend Redirection)
	c.JSON(http.StatusOK, gin.H{
		"token":    tokenString,
		"user": gin.H{
			"id":       user.ID,
			"name":     user.Name,
			"role":     user.Role,
			"district": user.District,
		},
	})
}