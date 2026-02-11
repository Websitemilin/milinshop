#!/bin/bash
# Generate strong random secrets for production

echo "🔐 Generating Production Secrets"
echo "=================================="
echo ""

generate_secret() {
  openssl rand -base64 32
}

echo "Add these to your .env.production file:"
echo ""
echo "# JWT Secrets (CHANGE THESE!)"
echo "JWT_ACCESS_SECRET=$(generate_secret)"
echo "JWT_REFRESH_SECRET=$(generate_secret)"
echo ""
echo "# Store these securely in your secrets manager:"
echo "# AWS Secrets Manager, HashiCorp Vault, etc."
echo ""
echo "Run this command to apply:"
echo "  aws secretsmanager create-secret --name luxe/production --secret-string file://secrets.json"
echo ""
