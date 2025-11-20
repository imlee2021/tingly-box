package config

import (
	"fmt"
	"io/ioutil"
	"os"
	"sync"

	"github.com/goccy/go-yaml"
)

// GlobalConfig represents the global configuration
type GlobalConfig struct {
	DefaultProvider  string `yaml:"default_provider"`
	DefaultModel     string `yaml:"default_model"`
	DefaultModelName string `yaml:"default_model_name"` // The "tingly" value
	mutex           sync.RWMutex
	configFile      string
}

// NewGlobalConfig creates a new global configuration manager
func NewGlobalConfig() (*GlobalConfig, error) {
	configFile := "config/global_config.yaml"

	config := &GlobalConfig{
		DefaultModelName: "tingly",
		configFile:       configFile,
	}

	// Load existing config if exists
	if err := config.load(); err != nil {
		// If file doesn't exist, create default config
		if os.IsNotExist(err) {
			if err := config.save(); err != nil {
				return nil, fmt.Errorf("failed to create default global config: %w", err)
			}
		} else {
			return nil, fmt.Errorf("failed to load global config: %w", err)
		}
	}

	return config, nil
}

// load loads the global configuration from file
func (gc *GlobalConfig) load() error {
	data, err := ioutil.ReadFile(gc.configFile)
	if err != nil {
		return err
	}

	return yaml.Unmarshal(data, gc)
}

// save saves the global configuration to file
func (gc *GlobalConfig) save() error {
	data, err := yaml.Marshal(gc)
	if err != nil {
		return err
	}

	return ioutil.WriteFile(gc.configFile, data, 0644)
}

// SetDefaultProvider sets the default provider
func (gc *GlobalConfig) SetDefaultProvider(provider string) error {
	gc.mutex.Lock()
	defer gc.mutex.Unlock()

	gc.DefaultProvider = provider
	return gc.save()
}

// SetDefaultModel sets the default model for the default provider
func (gc *GlobalConfig) SetDefaultModel(model string) error {
	gc.mutex.Lock()
	defer gc.mutex.Unlock()

	gc.DefaultModel = model
	return gc.save()
}

// SetDefaultModelName sets the default model name (the "tingly" value)
func (gc *GlobalConfig) SetDefaultModelName(modelName string) error {
	gc.mutex.Lock()
	defer gc.mutex.Unlock()

	gc.DefaultModelName = modelName
	return gc.save()
}

// GetDefaultProvider returns the default provider
func (gc *GlobalConfig) GetDefaultProvider() string {
	gc.mutex.RLock()
	defer gc.mutex.RUnlock()

	return gc.DefaultProvider
}

// GetDefaultModel returns the default model
func (gc *GlobalConfig) GetDefaultModel() string {
	gc.mutex.RLock()
	defer gc.mutex.RUnlock()

	return gc.DefaultModel
}

// GetDefaultModelName returns the default model name
func (gc *GlobalConfig) GetDefaultModelName() string {
	gc.mutex.RLock()
	defer gc.mutex.RUnlock()

	return gc.DefaultModelName
}

// GetDefaults returns all default values
func (gc *GlobalConfig) GetDefaults() (provider, model, modelName string) {
	gc.mutex.RLock()
	defer gc.mutex.RUnlock()

	return gc.DefaultProvider, gc.DefaultModel, gc.DefaultModelName
}

// HasDefaults checks if defaults are configured
func (gc *GlobalConfig) HasDefaults() bool {
	gc.mutex.RLock()
	defer gc.mutex.RUnlock()

	return gc.DefaultProvider != "" && gc.DefaultModel != ""
}

// IsDefaultModelName checks if the given model name is the default model name
func (gc *GlobalConfig) IsDefaultModelName(modelName string) bool {
	gc.mutex.RLock()
	defer gc.mutex.RUnlock()

	return modelName == gc.DefaultModelName
}