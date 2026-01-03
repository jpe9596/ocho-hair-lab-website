#!/bin/bash

# Ocho Hair Lab - Local Build + SCP Deployment Script
# This script builds the frontend locally and deploys it to your EC2 instance

# ============================================================
# CONFIGURATION - Update these values for your setup
# ============================================================
SERVER_IP="${SERVER_IP:-YOUR_SERVER_IP}"
SSH_KEY="${SSH_KEY:-your-key.pem}"
SSH_USER="${SSH_USER:-ubuntu}"
REMOTE_USER="${REMOTE_USER:-ocho}"
REMOTE_PATH="/home/${REMOTE_USER}/ocho-hair-lab-website"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================
# Functions
# ============================================================

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

check_config() {
    if [ "$SERVER_IP" == "YOUR_SERVER_IP" ]; then
        print_error "Please configure SERVER_IP in the script or set as environment variable"
        echo "Example: export SERVER_IP=54.123.45.67"
        exit 1
    fi

    if [ "$SSH_KEY" == "your-key.pem" ]; then
        print_error "Please configure SSH_KEY in the script or set as environment variable"
        echo "Example: export SSH_KEY=~/.ssh/my-ec2-key.pem"
        exit 1
    fi

    if [ ! -f "$SSH_KEY" ]; then
        print_error "SSH key file not found: $SSH_KEY"
        exit 1
    fi

    # Check SSH key permissions
    local perms=$(stat -c %a "$SSH_KEY" 2>/dev/null || stat -f %A "$SSH_KEY" 2>/dev/null)
    if [ "$perms" != "400" ] && [ "$perms" != "600" ]; then
        print_warning "SSH key permissions should be 400 or 600"
        print_info "Running: chmod 400 $SSH_KEY"
        chmod 400 "$SSH_KEY"
    fi
}

test_connection() {
    print_info "Testing SSH connection to $SERVER_IP..."
    if ssh -i "$SSH_KEY" -o ConnectTimeout=10 -o BatchMode=yes "$SSH_USER@$SERVER_IP" "echo 'Connection successful'" > /dev/null 2>&1; then
        print_success "SSH connection successful"
        return 0
    else
        print_error "Cannot connect to $SERVER_IP via SSH"
        print_info "Please verify:"
        print_info "  1. Server IP address is correct"
        print_info "  2. SSH key is correct and has proper permissions"
        print_info "  3. Security group allows SSH from your IP"
        print_info "  4. Server is running"
        exit 1
    fi
}

build_frontend() {
    print_header "Building Frontend"
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Are you in the project root directory?"
        exit 1
    fi

    print_info "Running: npm run build"
    npm run build

    if [ $? -ne 0 ]; then
        print_error "Build failed!"
        exit 1
    fi

    if [ ! -d "dist" ]; then
        print_error "dist/ directory not found after build"
        exit 1
    fi

    print_success "Build completed successfully"
    du -sh dist
}

transfer_files() {
    print_header "Transferring Files to EC2"
    
    print_info "Creating temporary directory on server..."
    ssh -i "$SSH_KEY" "$SSH_USER@$SERVER_IP" "mkdir -p ~/temp-dist-$(date +%s)" > /dev/null 2>&1
    
    local temp_dir=$(ssh -i "$SSH_KEY" "$SSH_USER@$SERVER_IP" "ls -td ~/temp-dist-* | head -1")
    
    print_info "Transferring dist/ to $SERVER_IP:$temp_dir"
    scp -i "$SSH_KEY" -r dist/* "$SSH_USER@$SERVER_IP":"$temp_dir/"

    if [ $? -ne 0 ]; then
        print_error "File transfer failed!"
        exit 1
    fi

    print_success "Files transferred successfully"
    echo "$temp_dir"
}

deploy_files() {
    local temp_dir=$1
    print_header "Deploying Files on Server"
    
    print_info "Backing up current dist/ directory..."
    ssh -i "$SSH_KEY" "$SSH_USER@$SERVER_IP" << EOF
        # Create backup directory if it doesn't exist
        sudo mkdir -p ${REMOTE_PATH}/dist-backups
        
        # Backup current dist with timestamp
        if [ -d "${REMOTE_PATH}/dist" ] && [ "\$(ls -A ${REMOTE_PATH}/dist)" ]; then
            sudo tar -czf ${REMOTE_PATH}/dist-backups/dist-backup-\$(date +%Y%m%d-%H%M%S).tar.gz -C ${REMOTE_PATH} dist
            echo "✓ Backup created"
        fi
        
        # Remove old dist files
        sudo rm -rf ${REMOTE_PATH}/dist/*
        
        # Move new files
        sudo mv $temp_dir/* ${REMOTE_PATH}/dist/
        
        # Set proper ownership
        sudo chown -R ${REMOTE_USER}:${REMOTE_USER} ${REMOTE_PATH}/dist
        
        # Cleanup temp directory
        rm -rf $temp_dir
        
        # Verify files
        ls -lh ${REMOTE_PATH}/dist/ | head -10
EOF

    if [ $? -ne 0 ]; then
        print_error "Deployment failed!"
        print_warning "You may need to restore from backup"
        exit 1
    fi

    print_success "Files deployed successfully"
}

restart_services() {
    print_header "Restarting Services"
    
    print_info "Restarting nginx..."
    ssh -i "$SSH_KEY" "$SSH_USER@$SERVER_IP" "sudo systemctl restart nginx"
    
    if [ $? -ne 0 ]; then
        print_warning "nginx restart failed"
    else
        print_success "nginx restarted"
    fi
    
    # Optional: restart backend if needed
    # print_info "Restarting backend..."
    # ssh -i "$SSH_KEY" "$SSH_USER@$SERVER_IP" "sudo systemctl restart ocho-backend"
}

verify_deployment() {
    print_header "Verifying Deployment"
    
    print_info "Checking nginx status..."
    local nginx_status=$(ssh -i "$SSH_KEY" "$SSH_USER@$SERVER_IP" "sudo systemctl is-active nginx")
    
    if [ "$nginx_status" == "active" ]; then
        print_success "nginx is running"
    else
        print_error "nginx is not running"
    fi
    
    print_info "Checking backend status..."
    local backend_status=$(ssh -i "$SSH_KEY" "$SSH_USER@$SERVER_IP" "sudo systemctl is-active ocho-backend")
    
    if [ "$backend_status" == "active" ]; then
        print_success "Backend is running"
    else
        print_warning "Backend is not running"
    fi
}

print_summary() {
    print_header "Deployment Complete"
    print_success "Frontend deployed successfully!"
    echo ""
    print_info "Your website should now be accessible at:"
    echo -e "   ${GREEN}http://$SERVER_IP${NC}"
    echo ""
    print_info "Next steps:"
    echo "   1. Open the website in your browser"
    echo "   2. Verify all functionality works correctly"
    echo "   3. Check browser console for any errors"
    echo ""
    print_info "Useful commands:"
    echo "   View nginx logs:  ssh -i $SSH_KEY $SSH_USER@$SERVER_IP 'sudo tail -f /var/log/nginx/error.log'"
    echo "   View backend logs: ssh -i $SSH_KEY $SSH_USER@$SERVER_IP 'sudo journalctl -u ocho-backend -f'"
    echo "   Restore backup:    ssh -i $SSH_KEY $SSH_USER@$SERVER_IP 'sudo tar -xzf ${REMOTE_PATH}/dist-backups/dist-backup-*.tar.gz -C ${REMOTE_PATH}'"
}

# ============================================================
# Main Script
# ============================================================

main() {
    clear
    print_header "Ocho Hair Lab - Deployment Script"
    echo ""
    
    # Check configuration
    check_config
    
    # Test connection
    test_connection
    
    # Build
    build_frontend
    
    # Transfer
    temp_dir=$(transfer_files)
    
    # Deploy
    deploy_files "$temp_dir"
    
    # Restart services
    restart_services
    
    # Verify
    verify_deployment
    
    # Print summary
    echo ""
    print_summary
}

# ============================================================
# Script Options
# ============================================================

show_help() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -h, --help          Show this help message"
    echo "  -i, --ip IP         Set server IP address"
    echo "  -k, --key PATH      Set SSH key path"
    echo "  -u, --user USER     Set SSH user (default: ubuntu)"
    echo ""
    echo "Environment Variables:"
    echo "  SERVER_IP           EC2 instance IP address"
    echo "  SSH_KEY             Path to SSH private key"
    echo "  SSH_USER            SSH user (default: ubuntu)"
    echo ""
    echo "Examples:"
    echo "  $0 --ip 54.123.45.67 --key ~/.ssh/my-key.pem"
    echo "  export SERVER_IP=54.123.45.67 && export SSH_KEY=~/.ssh/my-key.pem && $0"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -i|--ip)
            SERVER_IP="$2"
            shift 2
            ;;
        -k|--key)
            SSH_KEY="$2"
            shift 2
            ;;
        -u|--user)
            SSH_USER="$2"
            shift 2
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Run main script
main
