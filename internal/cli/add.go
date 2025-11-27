package cli

import (
	"bufio"
	"fmt"
	"os"
	"strings"

	"github.com/spf13/cobra"
	"tingly-box/internal/config"
)

// AddCommand represents the add provider command
func AddCommand(appConfig *config.AppConfig) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "add [name] [baseurl] [token]",
		Short: "Add a new AI provider configuration",
		Long: `Add a new AI provider with name, API base URL, and token.
You can provide the arguments as positional parameters:
  add openai https://api.openai.com/v1 your-token-here

Or run the command without arguments for interactive mode.`,
		Args: cobra.MaximumNArgs(3),
		RunE: func(cmd *cobra.Command, args []string) error {
			return runAdd(appConfig, args)
		},
	}

	return cmd
}

// runAdd handles the provider addition process with both positional arguments and interactive mode
func runAdd(appConfig *config.AppConfig, args []string) error {
	reader := bufio.NewReader(os.Stdin)

	var name, apiBase, token string

	// Extract values from positional arguments if provided
	if len(args) > 0 {
		name = args[0]
	}
	if len(args) > 1 {
		apiBase = args[1]
	}
	if len(args) > 2 {
		token = args[2]
	}

	// If we have all arguments, skip interactive prompts
	if len(args) == 3 {
		return addProviderWithConfirmation(appConfig, reader, name, apiBase, token)
	}

	// Interactive mode for missing values
	fmt.Println("Let's add a new AI provider configuration.")
	if len(args) > 0 {
		fmt.Printf("Using provided name: %s\n", name)
	}
	fmt.Println()

	// Get provider name (if not provided)
	if name == "" {
		var err error
		name, err = promptForInput(reader, "Enter provider name (e.g., openai, anthropic): ", true)
		if err != nil {
			return err
		}
	}

	// Check if provider already exists
	if existingProvider, err := appConfig.GetProvider(name); err == nil && existingProvider != nil {
		fmt.Printf("Provider '%s' already exists. Please use a different name or update the existing provider.\n", name)
		return fmt.Errorf("provider already exists")
	}

	// Get API base URL (if not provided)
	if apiBase == "" {
		var err error
		apiBase, err = promptForInput(reader, "Enter API base URL (e.g., https://api.openai.com/v1): ", true)
		if err != nil {
			return err
		}
	}

	// Get API token (if not provided)
	if token == "" {
		var err error
		token, err = promptForInput(reader, "Enter API token: ", true)
		if err != nil {
			return err
		}
	}

	return addProviderWithConfirmation(appConfig, reader, name, apiBase, token)
}

// addProviderWithConfirmation displays summary and adds the provider
func addProviderWithConfirmation(appConfig *config.AppConfig, reader *bufio.Reader, name, apiBase, token string) error {
	// Display summary and get confirmation
	fmt.Println("\n--- Configuration Summary ---")
	fmt.Printf("Provider Name: %s\n", name)
	fmt.Printf("API Base URL: %s\n", apiBase)
	fmt.Printf("Token: %s\n", maskToken(token))
	fmt.Println("---------------------------")

	confirmed, err := promptForConfirmation(reader, "Do you want to save this configuration? (Y/n): ")
	if err != nil {
		return err
	}

	if !confirmed {
		fmt.Println("Operation cancelled.")
		return nil
	}

	// Add the provider
	if err := appConfig.AddProviderByName(name, apiBase, token); err != nil {
		return fmt.Errorf("failed to add provider: %w", err)
	}

	fmt.Printf("Successfully added provider '%s'\n", name)
	return nil
}


// promptForInput prompts the user for input and returns the trimmed response
func promptForInput(reader *bufio.Reader, prompt string, required bool) (string, error) {
	for {
		fmt.Print(prompt)
		input, err := reader.ReadString('\n')
		if err != nil {
			return "", fmt.Errorf("failed to read input: %w", err)
		}

		input = strings.TrimSpace(input)

		if required && input == "" {
			fmt.Println("This field is required. Please enter a value.")
			continue
		}

		return input, nil
	}
}

// promptForConfirmation prompts the user for a yes/no confirmation
func promptForConfirmation(reader *bufio.Reader, prompt string) (bool, error) {
	fmt.Print(prompt)
	input, err := reader.ReadString('\n')
	if err != nil {
		return false, fmt.Errorf("failed to read input: %w", err)
	}

	input = strings.ToLower(strings.TrimSpace(input))
	// Default to Yes if user just presses Enter
	return input == "" || input == "y" || input == "yes", nil
}

// maskToken masks the API token for display purposes
func maskToken(token string) string {
	if len(token) <= 8 {
		return strings.Repeat("*", len(token))
	}
	return token[:4] + strings.Repeat("*", len(token)-8) + token[len(token)-4:]
}