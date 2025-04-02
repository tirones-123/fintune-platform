import os
import sys
import argparse

def create_migration(message):
    """
    Create an Alembic migration with the given message.
    """
    # Construct the alembic command
    alembic_cmd = f"alembic revision --autogenerate -m \"{message}\""
    
    # Print the command for visibility
    print(f"Running: {alembic_cmd}")
    
    # Execute the command
    os.system(alembic_cmd)
    
    print("Migration created successfully!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create a new database migration")
    parser.add_argument("message", help="Message for the migration")
    
    args = parser.parse_args()
    create_migration(args.message) 