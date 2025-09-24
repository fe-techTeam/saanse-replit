#!/bin/bash

# SAANSE Platform - Setup Kubernetes Secrets Script
# This script reads from .env file and encodes secrets for Kubernetes deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to encode base64
encode_base64() {
    echo -n "$1" | base64
}

# Function to read value from .env file
read_env_value() {
    local var_name="$1"
    local env_file="${2:-.env}"
    
    if [ ! -f "$env_file" ]; then
        echo ""
        return 1
    fi
    
    # Read the value from .env file, handling various formats
    local value=$(grep "^${var_name}=" "$env_file" | head -n1 | cut -d'=' -f2- | sed 's/^["'"'"']//;s/["'"'"']$//')
    echo "$value"
}

# Function to prompt for secret value with .env fallback
prompt_secret() {
    local var_name="$1"
    local description="$2"
    local env_value=$(read_env_value "$var_name")
    
    if [ -n "$env_value" ]; then
        print_status "Found $var_name in .env file"
        echo "  Value preview: ${env_value:0:20}..."
        print_status "Use this value? (y/n) [default: y]"
        read -r use_env
        
        if [ "$use_env" != "n" ] && [ "$use_env" != "N" ]; then
            echo "$var_name: $(encode_base64 "$env_value")"
            return 0
        fi
    fi
    
    # Fallback to manual input
    local value=""
    echo
    print_status "Enter $description:"
    read -s value
    
    if [ -z "$value" ]; then
        print_warning "Empty value provided for $var_name"
        return 1
    fi
    
    echo "$var_name: $(encode_base64 "$value")"
    return 0
}

# Function to auto-generate secrets from .env
auto_generate_secrets() {
    local temp_file="$1"
    local success=true
    
    print_status "Reading secrets from .env file..."
    
    # Required secrets list (compatible with all shells)
    local secret_vars="SUPABASE_URL SUPABASE_SERVICE_ROLE_KEY VITE_SUPABASE_PUBLISHABLE_KEY DATABASE_URL"
    
    for env_key in $secret_vars; do
        local value=$(read_env_value "$env_key")
        
        if [ -n "$value" ]; then
            print_success "✅ Found $env_key"
            echo "  $env_key: $(encode_base64 "$value")" >> "$temp_file"
        else
            print_warning "❌ Missing $env_key in .env file"
            success=false
        fi
    done
    
    if [ "$success" = true ]; then
        return 0
    else
        return 1
    fi
}

# Main function
main() {
    echo "🔐 SAANSE Platform - Kubernetes Secrets Setup"
    echo "=============================================="
    echo
    
    # Check if .env file exists
    if [ ! -f ".env" ]; then
        print_error ".env file not found!"
        print_status "Please create a .env file with your Supabase credentials first."
        exit 1
    fi
    
    print_status "Found .env file. Checking for required secrets..."
    echo
    
    # Create temporary file for secrets
    TEMP_SECRETS=$(mktemp)
    echo "# Generated from .env file on $(date)" > "$TEMP_SECRETS"
    echo "data:" >> "$TEMP_SECRETS"
    
    # Check for --auto flag for non-interactive mode
    if [ "$1" = "--auto" ] || [ "$1" = "-a" ]; then
        print_status "Running in automatic mode..."
        if auto_generate_secrets "$TEMP_SECRETS"; then
            print_success "All secrets found and encoded automatically!"
        else
            print_error "Some secrets are missing from .env file. Please add them and try again."
            rm "$TEMP_SECRETS"
            exit 1
        fi
    else
        print_status "Running in interactive mode..."
        print_status "Found values will be loaded from .env, you can override them if needed."
        echo
        
        # Collect all secrets interactively
        prompt_secret "SUPABASE_URL" "Supabase URL (e.g., https://your-project.supabase.co)" >> "$TEMP_SECRETS"
        prompt_secret "SUPABASE_SERVICE_ROLE_KEY" "Supabase Service Role Key" >> "$TEMP_SECRETS"
        prompt_secret "VITE_SUPABASE_PUBLISHABLE_KEY" "Supabase Publishable Key" >> "$TEMP_SECRETS"
        prompt_secret "DATABASE_URL" "Database URL (PostgreSQL connection string)" >> "$TEMP_SECRETS"
    fi
    
    echo
    print_success "Secrets encoded successfully!"
    echo
    print_status "Generated secrets file:"
    cat "$TEMP_SECRETS"
    echo
    
    # Ask if user wants to update the secret.yaml file
    print_status "Do you want to update k8s/secret.yaml with these values? (y/n)"
    read -r update_file
    
    if [ "$update_file" = "y" ] || [ "$update_file" = "Y" ]; then
        # Backup original file
        if [ -f "k8s/secret.yaml" ]; then
            cp "k8s/secret.yaml" "k8s/secret.yaml.backup"
            print_status "Backed up original secret.yaml to secret.yaml.backup"
        fi
        
        # Update the secret.yaml file
        cat > "k8s/secret.yaml" << EOF
apiVersion: v1
kind: Secret
metadata:
  name: saanse-secrets
  namespace: saanse
  labels:
    app.kubernetes.io/name: saanse
    app.kubernetes.io/component: secrets
type: Opaque
$(cat "$TEMP_SECRETS")
EOF
        
        print_success "Updated k8s/secret.yaml with your secrets."
    else
        print_status "Please manually update k8s/secret.yaml with the values above."
    fi
    
    # Cleanup
    rm "$TEMP_SECRETS"
    
    echo
    print_warning "Security Reminder:"
    echo "- Never commit secrets to version control"
    echo "- Consider using external secret management in production"
    echo "- Rotate secrets regularly"
    echo
    print_success "Secrets setup completed!"
}

# Show usage if help requested
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "🔐 SAANSE Platform - Kubernetes Secrets Setup"
    echo "=============================================="
    echo
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "Options:"
    echo "  --auto, -a    Automatically read all secrets from .env file (non-interactive)"
    echo "  --help, -h    Show this help message"
    echo
    echo "Interactive mode (default):"
    echo "  - Reads values from .env file when available"
    echo "  - Prompts for confirmation or manual input"
    echo "  - Allows overriding .env values"
    echo
    echo "Automatic mode:"
    echo "  - Reads all secrets from .env file"
    echo "  - Fails if any required secret is missing"
    echo "  - No user interaction required"
    echo
    echo "Required secrets in .env file:"
    echo "  - SUPABASE_URL"
    echo "  - SUPABASE_SERVICE_ROLE_KEY"
    echo "  - VITE_SUPABASE_PUBLISHABLE_KEY"
    echo "  - DATABASE_URL"
    echo
    echo "Examples:"
    echo "  $0                    # Interactive mode"
    echo "  $0 --auto            # Automatic mode"
    echo "  $0 -a                # Automatic mode (short)"
    exit 0
fi

# Run main function
main "$@"
