import os
import sys
import subprocess

def create_initial_migration():
    """
    Create the initial migration for the database.
    """
    print("Creating initial migration...")
    
    # Run alembic revision
    result = subprocess.run(
        ["alembic", "revision", "--autogenerate", "-m", "Initial migration"],
        capture_output=True,
        text=True
    )
    
    if result.returncode != 0:
        print(f"Error creating migration: {result.stderr}")
        sys.exit(1)
    
    print(result.stdout)
    print("Initial migration created successfully.")

if __name__ == "__main__":
    create_initial_migration() 