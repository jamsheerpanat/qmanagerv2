#!/bin/bash

# Default commit message if none is provided as an argument
COMMIT_MSG=${1:-"Update application and fix issues"}

echo "Status before adding:"
git status -s

echo "Adding all local changes..."
git add .

echo "Committing with message: '$COMMIT_MSG'"
git commit -m "$COMMIT_MSG"

echo "Pushing to remote repository (main branch)..."
git push origin main

echo "Done! The changes have been pushed."
