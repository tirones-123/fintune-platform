import os
import sys
import subprocess

def run_tests():
    """
    Run the tests for the application.
    """
    print("Running tests...")
    
    # Run pytest
    result = subprocess.run(
        ["pytest", "-v", "tests/"],
        capture_output=True,
        text=True
    )
    
    print(result.stdout)
    
    if result.returncode != 0:
        print(f"Tests failed: {result.stderr}")
        sys.exit(1)
    
    print("All tests passed!")

if __name__ == "__main__":
    run_tests() 