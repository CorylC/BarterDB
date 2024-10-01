#!/bin/bash

# Define variables
DB_NAME="db.sqlite3"
SCHEMA_FILE="./sqlFolder/DatabaseSchema.sql"

# Check if the schema file exists
if [ ! -f "$SCHEMA_FILE" ]; then
  echo "Schema file $SCHEMA_FILE not found!"
  exit 1
fi

# Remove the existing database if it exists
if [ -f "$DB_NAME" ]; then
  echo "Removing existing database: $DB_NAME"
  rm "$DB_NAME"
fi

# Create the SQLite database and import the schema
echo "Creating new database: $DB_NAME"
sqlite3 "$DB_NAME" < "$SCHEMA_FILE"

# Verify the result
if [ $? -eq 0 ]; then
  echo "Database created successfully: $DB_NAME"
else
  echo "Error occurred while creating the database."
fi
