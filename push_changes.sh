#!/bin/bash

# Check if a commit message was provided
if [ -z "$1" ]; then
  echo "Error: Please provide a commit message."
  echo "Usage: ./push_changes.sh \"Your commit message\""
  exit 1
fi

COMMIT_MESSAGE="$1"

echo "==============================================="
echo "  🚀  Pushing changes to GitHub..."
echo "==============================================="

# Add all changes
echo "➕  Adding changes..."
git add .

# Commit changes
echo "Pm  Committing with message: '$COMMIT_MESSAGE'..."
git commit -m "$COMMIT_MESSAGE"

# Push to the current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "⬆️  Pushing to branch: $CURRENT_BRANCH..."
git push origin "$CURRENT_BRANCH"

if [ $? -eq 0 ]; then
  echo "==============================================="
  echo "  ✅  Success! Changes pushed to GitHub."
  echo "==============================================="
else
  echo "==============================================="
  echo "  ❌  Error: Failed to push changes."
  echo "      Please check your internet connection"
  echo "      or GitHub credentials."
  echo "==============================================="
  exit 1
fi
