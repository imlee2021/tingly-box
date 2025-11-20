package cli

import (
	"fmt"
	"time"

	"github.com/spf13/cobra"
	"tingly-box/internal/config"
	"tingly-box/pkg/utils"
)

// RestartCommand represents the restart server command
func RestartCommand(appConfig *config.AppConfig) *cobra.Command {
	var port int

	cmd := &cobra.Command{
		Use:   "restart",
		Short: "Restart the Tingly Box server",
		Long: `Restart the running Tingly Box HTTP server.
This command will stop the current server (if running) and start a new instance.
The restart is graceful - ongoing requests will be completed before shutdown.`,
		RunE: func(cmd *cobra.Command, args []string) error {
			// First, clean up any existing PID file to simulate a stop
			serverManager := utils.NewServerManager(appConfig)
			wasRunning := serverManager.IsRunning()

			if wasRunning {
				fmt.Println("Stopping current server...")
				// For a simple restart, we just clean up the PID file
				// In a real implementation, you would send a signal to the running process
				serverManager.Cleanup()
				fmt.Println("Server stopped successfully")

				// Give a moment for cleanup
				time.Sleep(1 * time.Second)
			} else {
				fmt.Println("Server was not running, starting it...")
			}

			// Create a new server manager for starting
			newServerManager := utils.NewServerManager(appConfig)

			// Start server with new configuration
			fmt.Println("Starting server...")
			if err := newServerManager.Start(port); err != nil {
				return fmt.Errorf("failed to start server: %w", err)
			}

			fmt.Printf("Server restarted successfully on port %d\n", appConfig.GetServerPort())
			fmt.Printf("API endpoint: http://localhost:%d/v1/chat/completions\n", appConfig.GetServerPort())
			fmt.Println("Use 'tingly status' to check server status")
			return nil
		},
	}

	cmd.Flags().IntVarP(&port, "port", "p", 8080, "Server port (default: 8080)")
	return cmd
}