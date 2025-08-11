#!/bin/bash

echo "📋 Available FactBench Agents:"
echo "=============================="
echo ""

# List all agents in .claude/agents/
for agent in /home/titan/FactBench/.claude/agents/*.md; do
    if [ -f "$agent" ]; then
        # Extract agent name from filename
        agent_name=$(basename "$agent" .md)
        
        # Extract description from agent file
        description=$(grep -A1 "^description:" "$agent" | tail -1 | sed 's/description: //' | cut -d'.' -f1)
        
        echo "🤖 $agent_name"
        echo "   $description"
        echo ""
    fi
done

echo ""
echo "To use an agent, tell Claude:"
echo '  "Use the [agent-name] agent to [task]"'
echo ""
echo "Example:"
echo '  "Use the text-extractor agent to extract content from zoopy"'