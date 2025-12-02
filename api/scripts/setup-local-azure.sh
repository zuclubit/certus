#!/bin/bash
# =============================================================================
# Certus API - Local Development Setup for Azure Resources
# =============================================================================
# This script validates and configures local development environment
# for secure connection to Azure resources using Azure CLI authentication
#
# Prerequisites:
#   - Azure CLI installed (az)
#   - .NET 8 SDK installed
#   - Access to Azure subscription with Certus resources
#
# Usage:
#   chmod +x scripts/setup-local-azure.sh
#   ./scripts/setup-local-azure.sh
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration (update these for your environment)
RESOURCE_GROUP="${CERTUS_RESOURCE_GROUP:-rg-certus-dev}"
POSTGRES_SERVER="${CERTUS_POSTGRES_SERVER:-certus-dev}"
STORAGE_ACCOUNT="${CERTUS_STORAGE_ACCOUNT:-stcertusdev}"
KEY_VAULT="${CERTUS_KEY_VAULT:-kv-certus-dev}"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       Certus API - Azure Local Development Setup              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# -----------------------------------------------------------------------------
# Step 1: Check Azure CLI Installation
# -----------------------------------------------------------------------------
echo -e "${YELLOW}[1/7]${NC} Checking Azure CLI installation..."

if ! command -v az &> /dev/null; then
    echo -e "${RED}✗ Azure CLI is not installed${NC}"
    echo "  Install from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

AZ_VERSION=$(az version --query '"azure-cli"' -o tsv 2>/dev/null)
echo -e "${GREEN}✓ Azure CLI installed: v${AZ_VERSION}${NC}"

# -----------------------------------------------------------------------------
# Step 2: Verify Azure CLI Login
# -----------------------------------------------------------------------------
echo -e "${YELLOW}[2/7]${NC} Verifying Azure CLI authentication..."

if ! az account show &> /dev/null; then
    echo -e "${RED}✗ Not logged in to Azure CLI${NC}"
    echo "  Run: az login"
    exit 1
fi

ACCOUNT_NAME=$(az account show --query 'user.name' -o tsv)
SUBSCRIPTION=$(az account show --query 'name' -o tsv)
SUBSCRIPTION_ID=$(az account show --query 'id' -o tsv)

echo -e "${GREEN}✓ Logged in as: ${ACCOUNT_NAME}${NC}"
echo -e "  Subscription: ${SUBSCRIPTION}"
echo -e "  Subscription ID: ${SUBSCRIPTION_ID}"

# -----------------------------------------------------------------------------
# Step 3: Verify Resource Group Access
# -----------------------------------------------------------------------------
echo -e "${YELLOW}[3/7]${NC} Checking resource group access: ${RESOURCE_GROUP}..."

if ! az group show --name "$RESOURCE_GROUP" &> /dev/null; then
    echo -e "${RED}✗ Cannot access resource group: ${RESOURCE_GROUP}${NC}"
    echo "  Verify the resource group exists and you have access"
    exit 1
fi

LOCATION=$(az group show --name "$RESOURCE_GROUP" --query 'location' -o tsv)
echo -e "${GREEN}✓ Resource group accessible: ${RESOURCE_GROUP} (${LOCATION})${NC}"

# -----------------------------------------------------------------------------
# Step 4: Test PostgreSQL Connection
# -----------------------------------------------------------------------------
echo -e "${YELLOW}[4/7]${NC} Testing PostgreSQL Flexible Server access..."

POSTGRES_FQDN="${POSTGRES_SERVER}.postgres.database.azure.com"

if az postgres flexible-server show --resource-group "$RESOURCE_GROUP" --name "$POSTGRES_SERVER" &> /dev/null; then
    POSTGRES_STATUS=$(az postgres flexible-server show \
        --resource-group "$RESOURCE_GROUP" \
        --name "$POSTGRES_SERVER" \
        --query 'state' -o tsv)

    if [ "$POSTGRES_STATUS" == "Ready" ]; then
        echo -e "${GREEN}✓ PostgreSQL server is ready: ${POSTGRES_FQDN}${NC}"

        # Check if AAD authentication is enabled
        AAD_ENABLED=$(az postgres flexible-server show \
            --resource-group "$RESOURCE_GROUP" \
            --name "$POSTGRES_SERVER" \
            --query 'authConfig.activeDirectoryAuth' -o tsv 2>/dev/null || echo "Unknown")

        echo -e "  AAD Authentication: ${AAD_ENABLED}"
    else
        echo -e "${YELLOW}⚠ PostgreSQL server status: ${POSTGRES_STATUS}${NC}"
    fi
else
    echo -e "${YELLOW}⚠ PostgreSQL server not found or not accessible${NC}"
    echo "  Server: ${POSTGRES_SERVER}"
fi

# -----------------------------------------------------------------------------
# Step 5: Test Storage Account Access
# -----------------------------------------------------------------------------
echo -e "${YELLOW}[5/7]${NC} Testing Storage Account access..."

if az storage account show --resource-group "$RESOURCE_GROUP" --name "$STORAGE_ACCOUNT" &> /dev/null; then
    STORAGE_KIND=$(az storage account show \
        --resource-group "$RESOURCE_GROUP" \
        --name "$STORAGE_ACCOUNT" \
        --query 'kind' -o tsv)

    echo -e "${GREEN}✓ Storage account accessible: ${STORAGE_ACCOUNT} (${STORAGE_KIND})${NC}"

    # Test blob service access
    echo "  Testing blob service access..."
    if az storage container list --account-name "$STORAGE_ACCOUNT" --auth-mode login &> /dev/null; then
        CONTAINERS=$(az storage container list \
            --account-name "$STORAGE_ACCOUNT" \
            --auth-mode login \
            --query '[].name' -o tsv | tr '\n' ', ' | sed 's/,$//')
        echo -e "${GREEN}  ✓ Blob access granted. Containers: ${CONTAINERS:-none}${NC}"
    else
        echo -e "${YELLOW}  ⚠ Cannot list containers - check RBAC permissions${NC}"
        echo "    Required role: Storage Blob Data Contributor"
    fi
else
    echo -e "${YELLOW}⚠ Storage account not found or not accessible${NC}"
    echo "  Account: ${STORAGE_ACCOUNT}"
fi

# -----------------------------------------------------------------------------
# Step 6: Test Key Vault Access
# -----------------------------------------------------------------------------
echo -e "${YELLOW}[6/7]${NC} Testing Key Vault access..."

if az keyvault show --resource-group "$RESOURCE_GROUP" --name "$KEY_VAULT" &> /dev/null; then
    echo -e "${GREEN}✓ Key Vault accessible: ${KEY_VAULT}${NC}"

    # Test secret list access
    echo "  Testing secrets access..."
    if az keyvault secret list --vault-name "$KEY_VAULT" &> /dev/null; then
        SECRET_COUNT=$(az keyvault secret list --vault-name "$KEY_VAULT" --query 'length(@)' -o tsv)
        echo -e "${GREEN}  ✓ Secrets access granted. Count: ${SECRET_COUNT}${NC}"
    else
        echo -e "${YELLOW}  ⚠ Cannot list secrets - check access policies${NC}"
        echo "    Required: Get, List permissions on Secrets"
    fi
else
    echo -e "${YELLOW}⚠ Key Vault not found or not accessible${NC}"
    echo "  Vault: ${KEY_VAULT}"
fi

# -----------------------------------------------------------------------------
# Step 7: Get PostgreSQL Access Token (Test)
# -----------------------------------------------------------------------------
echo -e "${YELLOW}[7/7]${NC} Testing Azure AD token acquisition for PostgreSQL..."

POSTGRES_TOKEN=$(az account get-access-token \
    --resource-type oss-rdbms \
    --query 'accessToken' -o tsv 2>/dev/null || echo "")

if [ -n "$POSTGRES_TOKEN" ]; then
    TOKEN_LENGTH=${#POSTGRES_TOKEN}
    echo -e "${GREEN}✓ PostgreSQL access token acquired (${TOKEN_LENGTH} chars)${NC}"
else
    echo -e "${YELLOW}⚠ Could not acquire PostgreSQL token${NC}"
    echo "  This may be normal if AAD auth is not configured"
fi

# -----------------------------------------------------------------------------
# Summary and Next Steps
# -----------------------------------------------------------------------------
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                     Setup Summary                              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Environment validated successfully!${NC}"
echo ""
echo "Configuration for appsettings.Development.json:"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
cat << EOF
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=${POSTGRES_FQDN};Database=certus;Username=${ACCOUNT_NAME};SSL Mode=Require;Trust Server Certificate=true"
  },
  "Azure": {
    "KeyVault": { "VaultUri": "https://${KEY_VAULT}.vault.azure.net/" },
    "Storage": { "AccountName": "${STORAGE_ACCOUNT}", "ContainerName": "validations" }
  },
  "Database": { "UseAzureTokenAuth": true }
}
EOF
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "To run the API locally:"
echo -e "  ${BLUE}cd src/Certus.Api${NC}"
echo -e "  ${BLUE}dotnet run${NC}"
echo ""
echo "Required RBAC roles for your Azure AD user:"
echo "  • Key Vault Secrets User (on Key Vault)"
echo "  • Storage Blob Data Contributor (on Storage Account)"
echo "  • PostgreSQL Flexible Server AAD Admin (or db user with AAD auth)"
echo ""
echo -e "${GREEN}Setup complete! ✓${NC}"
