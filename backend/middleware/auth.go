package middleware

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization format"})
			return
		}
		tokenString := parts[1]

		jwtSecret := []byte(os.Getenv("JWT_SECRET"))
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return jwtSecret, nil
		})

		if err != nil || !token.Valid {
			fmt.Println("Auth Error: Token invalid:", err)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			return
		}

		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			fmt.Printf("🔍 DEBUG: Full Claims: %+v\n", claims)

			if userID, ok := claims["user_id"].(string); ok {
				c.Set("user_id", userID)
			}

			if role, ok := claims["role"].(string); ok {
				c.Set("role", role)
			} else {
				fmt.Println("Warning: Role claim missing or not string")
			}
			if district, ok := claims["district"].(string); ok {
				fmt.Printf(" DEBUG: Setting District Context: %s\n", district)
				c.Set("district", district)
			} else {
				fmt.Printf(" CRITICAL: District claim issue. Raw value: %v, Type: %T\n", claims["district"], claims["district"])
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token missing district claim"})
				return
			}			
			if facID, ok := claims["fac_id"].(string); ok {
				c.Set("facility_id", facID)
			}

		} else {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			return
		}

		c.Next()
	}
}