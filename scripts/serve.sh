#!/bin/bash
# ===================================================
# FactBench VerdIQ - Local Development Server
# ===================================================
# Starts a local HTTP server for testing
# ===================================================

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Load port from .env if available
if [ -f .env ]; then
    export $(cat .env | grep LOCAL_PORT | xargs)
fi

PORT=${LOCAL_PORT:-8000}

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  FactBench VerdIQ - Local Development Server${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}🌐 Starting local server...${NC}"
echo ""
echo -e "${YELLOW}📍 URL:${NC} http://localhost:${PORT}"
echo -e "${YELLOW}📁 Directory:${NC} $(pwd)"
echo ""
echo -e "${GREEN}✅ Server is running!${NC}"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo "  • Open browser: http://localhost:${PORT}"
echo "  • Test pages: http://localhost:${PORT}/best-pool-cleaners/"
echo "  • Stop server: Press Ctrl+C"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Start Python HTTP server
python3 -m http.server ${PORT}
