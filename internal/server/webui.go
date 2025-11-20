package server

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"tingly-box/internal/config"
	"tingly-box/internal/memory"

	"github.com/gin-gonic/gin"
)

// WebUI represents the web interface management
type WebUI struct {
	enabled bool
	router  *gin.Engine
	config  *config.AppConfig
	logger  *memory.MemoryLogger
}

// NewWebUI creates a new web UI manager
func NewWebUI(enabled bool, appConfig *config.AppConfig, logger *memory.MemoryLogger) *WebUI {
	if !enabled {
		return &WebUI{enabled: false}
	}

	gin.SetMode(gin.ReleaseMode)
	wui := &WebUI{
		enabled: true,
		config:  appConfig,
		logger:  logger,
		router:  gin.New(),
	}

	wui.setupRoutes()
	return wui
}

// setupRoutes configures web UI routes
func (wui *WebUI) setupRoutes() {
	if !wui.enabled {
		return
	}

	// Middleware
	wui.router.Use(gin.Logger())
	wui.router.Use(gin.Recovery())

	wui.router.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization")
	})

	// Static files and templates - use absolute paths
	templatePath := getTemplatePath()
	staticPath := getStaticPath()

	// Log the paths for debugging
	log.Printf("Loading templates from: %s", templatePath)
	log.Printf("Loading static files from: %s", staticPath)

	// Load templates
	wui.router.LoadHTMLGlob(templatePath)
	log.Printf("Templates loaded successfully")
	wui.router.Static("/static", staticPath)

	// Dashboard endpoints
	wui.router.GET("/", wui.dashboard)
	wui.router.GET("/dashboard", wui.dashboard)

	// UI page routes
	ui := wui.router.Group("/ui")
	{
		ui.GET("/", wui.dashboard)
		ui.GET("/dashboard", wui.dashboard)
		ui.GET("/providers", wui.providersPage)
		ui.GET("/server", wui.serverPage)
		ui.GET("/history", wui.historyPage)
	}

	// API routes (for web UI functionality)
	wui.setupAPIRoutes()
}

// setupAPIRoutes configures API routes for web UI
func (wui *WebUI) setupAPIRoutes() {
	if !wui.enabled {
		return
	}

	api := wui.router.Group("/api")
	{
		// Providers management
		api.GET("/providers", wui.getProviders)
		api.POST("/providers", wui.addProvider)
		api.DELETE("/providers/:name", wui.deleteProvider)

		// Server management
		api.GET("/status", wui.getStatus)
		api.POST("/server/start", wui.startServer)
		api.POST("/server/stop", wui.stopServer)
		api.POST("/server/restart", wui.restartServer)

		// Token generation
		api.GET("/token", wui.generateToken)

		// History
		api.GET("/history", wui.getHistory)

		// New API endpoints for defaults and provider models
		api.GET("/defaults", wui.getDefaults)
		api.POST("/defaults", wui.setDefaults)
		api.GET("/provider-models", wui.getProviderModels)
		api.POST("/provider-models/:name", wui.fetchProviderModels)
	}
}

// GetRouter returns the gin router (nil if disabled)
func (wui *WebUI) GetRouter() *gin.Engine {
	if !wui.enabled {
		return nil
	}
	return wui.router
}

// SetupRoutesOnServer sets up WebUI routes and templates on the main server router
func (wui *WebUI) SetupRoutesOnServer(mainRouter *gin.Engine) {
	if !wui.enabled {
		return
	}

	// Load templates on the main router
	templatePath := getTemplatePath()
	staticPath := getStaticPath()

	log.Printf("Loading templates on main server from: %s", templatePath)
	log.Printf("Loading static files on main server from: %s", staticPath)

	// Load templates on main router
	mainRouter.LoadHTMLGlob(templatePath)
	log.Printf("Templates loaded successfully on main server")

	// Load static files on main router
	mainRouter.Static("/static", staticPath)

	// Add dashboard routes to main router
	mainRouter.GET("/", wui.dashboard)
	mainRouter.GET("/dashboard", wui.dashboard)

	// UI page routes on main router
	ui := mainRouter.Group("/ui")
	{
		ui.GET("/", wui.dashboard)
		ui.GET("/dashboard", wui.dashboard)
		ui.GET("/providers", wui.providersPage)
		ui.GET("/server", wui.serverPage)
		ui.GET("/history", wui.historyPage)
	}

	// Add API routes for web UI functionality on main router
	api := mainRouter.Group("/api")
	{
		// Providers management
		api.GET("/providers", wui.getProviders)
		api.POST("/providers", wui.addProvider)
		api.DELETE("/providers/:name", wui.deleteProvider)

		// Server management
		api.GET("/status", wui.getStatus)
		api.POST("/server/start", wui.startServer)
		api.POST("/server/stop", wui.stopServer)
		api.POST("/server/restart", wui.restartServer)

		// Token generation
		api.GET("/token", wui.generateToken)

		// History
		api.GET("/history", wui.getHistory)

		// Defaults and provider models
		api.GET("/defaults", wui.getDefaults)
		api.POST("/defaults", wui.setDefaults)
		api.GET("/provider-models", wui.getProviderModels)
		api.POST("/provider-models/:name", wui.fetchProviderModels)
	}
}

// IsEnabled returns whether web UI is enabled
func (wui *WebUI) IsEnabled() bool {
	return wui.enabled
}

// Page Handlers (exported for server integration)
func (wui *WebUI) Dashboard(c *gin.Context) {
	c.HTML(http.StatusOK, "dashboard.html", gin.H{
		"title": "Tingly Box Dashboard",
	})
}

func (wui *WebUI) ProvidersPage(c *gin.Context) {
	c.HTML(http.StatusOK, "providers.html", gin.H{
		"title": "Providers - Tingly Box",
	})
}

func (wui *WebUI) ServerPage(c *gin.Context) {
	c.HTML(http.StatusOK, "server.html", gin.H{
		"title": "Server - Tingly Box",
	})
}

func (wui *WebUI) HistoryPage(c *gin.Context) {
	c.HTML(http.StatusOK, "history.html", gin.H{
		"title": "History - Tingly Box",
	})
}

// Internal page handlers (unexported for internal use)
func (wui *WebUI) dashboard(c *gin.Context) {
	wui.Dashboard(c)
}

func (wui *WebUI) providersPage(c *gin.Context) {
	wui.ProvidersPage(c)
}

func (wui *WebUI) serverPage(c *gin.Context) {
	wui.ServerPage(c)
}

func (wui *WebUI) historyPage(c *gin.Context) {
	wui.HistoryPage(c)
}

// API Handlers (exported for server integration)
func (wui *WebUI) GetProviders(c *gin.Context) {
	providers := wui.config.ListProviders()
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    providers,
	})
}

func (wui *WebUI) GetStatus(c *gin.Context) {
	providers := wui.config.ListProviders()
	enabledCount := 0
	for _, p := range providers {
		if p.Enabled {
			enabledCount++
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"server_running":    true,
			"port":              wui.config.GetServerPort(),
			"providers_total":   len(providers),
			"providers_enabled": enabledCount,
			"request_count":     0,
		},
	})
}

func (wui *WebUI) GetHistory(c *gin.Context) {
	if wui.logger != nil {
		history := wui.logger.GetHistory(50)
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data":    history,
		})
	} else {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data":    []interface{}{},
		})
	}
}

func (wui *WebUI) GetDefaults(c *gin.Context) {
	globalConfig := wui.config.GetGlobalConfig()
	if globalConfig != nil {
		defaultProvider, defaultModel := globalConfig.GetDefaultProvider(), globalConfig.GetDefaultModel()
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data": gin.H{
				"default_provider":   defaultProvider,
				"default_model":      defaultModel,
				"default_model_name": globalConfig.DefaultModelName,
			},
		})
	} else {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data": gin.H{
				"default_provider":   "",
				"default_model":      "",
				"default_model_name": "tingly",
			},
		})
	}
}

// Placeholder implementations for complex handlers
func (wui *WebUI) AddProvider(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{
		"success": false,
		"error":   "Not implemented",
	})
}

func (wui *WebUI) DeleteProvider(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{
		"success": false,
		"error":   "Not implemented",
	})
}

func (wui *WebUI) StartServer(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{
		"success": false,
		"error":   "Not implemented",
	})
}

func (wui *WebUI) StopServer(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{
		"success": false,
		"error":   "Not implemented",
	})
}

func (wui *WebUI) RestartServer(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{
		"success": false,
		"error":   "Not implemented",
	})
}

func (wui *WebUI) GenerateToken(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{
		"success": false,
		"error":   "Not implemented",
	})
}

// getProviderModels returns provider models information
func (ws *WebUI) getProviderModels(c *gin.Context) {
	providerModelManager := ws.config.GetProviderModelManager()
	if providerModelManager == nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Provider model manager not available",
		})
		return
	}

	providers := providerModelManager.GetAllProviders()
	providerModels := make(map[string]interface{})

	for _, providerName := range providers {
		models := providerModelManager.GetModels(providerName)
		apiBase, lastUpdated, _ := providerModelManager.GetProviderInfo(providerName)

		providerModels[providerName] = map[string]interface{}{
			"models":       models,
			"api_base":     apiBase,
			"last_updated": lastUpdated,
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    providerModels,
	})
}

// fetchProviderModels fetches models for a specific provider
func (ws *WebUI) fetchProviderModels(c *gin.Context) {
	providerName := c.Param("name")

	if providerName == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Provider name is required",
		})
		return
	}

	// Fetch and save models
	err := ws.config.FetchAndSaveProviderModels(providerName)
	if err != nil {
		if ws.logger != nil {
			ws.logger.LogAction(memory.ActionFetchModels, map[string]interface{}{
				"provider": providerName,
			}, false, err.Error())
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	// Get the updated models
	providerModelManager := ws.config.GetProviderModelManager()
	models := providerModelManager.GetModels(providerName)

	if ws.logger != nil {
		ws.logger.LogAction(memory.ActionFetchModels, map[string]interface{}{
			"provider":     providerName,
			"models_count": len(models),
		}, true, fmt.Sprintf("Successfully fetched %d models for provider %s", len(models), providerName))
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": fmt.Sprintf("Successfully fetched %d models for provider %s", len(models), providerName),
		"data":    models,
	})
}

// Internal API handlers (unexported for internal use)
func (wui *WebUI) getProviders(c *gin.Context) {
	wui.GetProviders(c)
}

func (wui *WebUI) getStatus(c *gin.Context) {
	wui.GetStatus(c)
}

func (wui *WebUI) getHistory(c *gin.Context) {
	wui.GetHistory(c)
}

func (wui *WebUI) addProvider(c *gin.Context) {
	wui.AddProvider(c)
}

func (wui *WebUI) deleteProvider(c *gin.Context) {
	wui.DeleteProvider(c)
}

func (wui *WebUI) startServer(c *gin.Context) {
	wui.StartServer(c)
}

func (wui *WebUI) stopServer(c *gin.Context) {
	wui.StopServer(c)
}

func (wui *WebUI) restartServer(c *gin.Context) {
	wui.RestartServer(c)
}

func (wui *WebUI) generateToken(c *gin.Context) {
	wui.GenerateToken(c)
}

// getDefaults returns the current global defaults
func (ws *WebUI) getDefaults(c *gin.Context) {
	globalConfig := ws.config.GetGlobalConfig()
	if globalConfig == nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Global config not available",
		})
		return
	}

	defaultProvider, defaultModel, defaultModelName := globalConfig.GetDefaults()
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"default_provider":   defaultProvider,
			"default_model":      defaultModel,
			"default_model_name": defaultModelName,
		},
	})
}

// setDefaults updates the global defaults
func (ws *WebUI) setDefaults(c *gin.Context) {
	var req struct {
		DefaultProvider  string `json:"default_provider"`
		DefaultModel     string `json:"default_model"`
		DefaultModelName string `json:"default_model_name"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	globalConfig := ws.config.GetGlobalConfig()
	if globalConfig == nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Global config not available",
		})
		return
	}

	// Update defaults
	if req.DefaultProvider != "" {
		if err := globalConfig.SetDefaultProvider(req.DefaultProvider); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"error":   err.Error(),
			})
			return
		}
	}

	if req.DefaultModel != "" {
		if err := globalConfig.SetDefaultModel(req.DefaultModel); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"error":   err.Error(),
			})
			return
		}
	}

	if req.DefaultModelName != "" {
		if err := globalConfig.SetDefaultModelName(req.DefaultModelName); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"error":   err.Error(),
			})
			return
		}
	}

	if ws.logger != nil {
		ws.logger.LogAction(memory.ActionUpdateDefaults, map[string]interface{}{
			"default_provider":   req.DefaultProvider,
			"default_model":      req.DefaultModel,
			"default_model_name": req.DefaultModelName,
		}, true, "Global defaults updated via web interface")
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Defaults updated successfully",
	})
}

// Helper functions to get template and static file paths
func getTemplatePath() string {
	if wd, err := os.Getwd(); err == nil {
		templatePath := filepath.Join(wd, "web", "templates", "*")
		if _, err := os.Stat(templatePath); err == nil {
			return templatePath
		}
	}
	// Fallback to relative path
	return "web/templates/*"
}

func getStaticPath() string {
	if wd, err := os.Getwd(); err == nil {
		staticPath := filepath.Join(wd, "web", "static")
		if _, err := os.Stat(staticPath); err == nil {
			return staticPath
		}
	}
	// Fallback to relative path
	return "./web/static"
}
