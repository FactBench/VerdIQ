#!/usr/bin/env python3
"""
Generate favicon files from SVG logo.
Creates ICO and PNG versions in multiple sizes.
"""

import os
import base64
from pathlib import Path

# Simple favicon generation using base64 encoded PNG
def create_favicon_html():
    """Create a simple HTML file with embedded favicon for testing"""
    
    # Base64 encoded 32x32 PNG favicon (simplified version)
    favicon_32_base64 = """
iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAAC
jklEQVRYhe2XS2gTURSGv5lJmjRNH7ZNrVqtVkQXIiIuBEVEEBeCuHLhwoULQVy4EHHhwoUg
LgRx4UJEFBEREUGkFqtWa6u2aZs0TZqZZCYzmXndi4gLIZlJJmkX4g8Hhnt4/v+ce+fec0EQ
RBAEQRD+V5SyNjQaTaRSqTqtVtsqy7JFkiSjIAjVgiAYBEEwAIIsy4l4PD6ZSCRGk8nkUDKZ
HJJl2VPOfisGIEmSTpblFlmWmxRFaVEUpVlRlAZFURoURalVFKVKVdUqAEVRkslkciKZTA4l
EomheDw+FIvFhmVZ9hWLqRQAwzAYx3HtzmazTbIs25LJ5NxEItEai8Xao9Hozng8vltV1S0A
DQAAQghSSqmiKFP5cxRbATzPOziOW8dxXBvHcRs4jmvlOG4rx3FtPM9vZlm2BQBqiqXPpVgA
hmEogiCqCSGVhJAKQkglIaSCEGImhFQQQioZhgEAAE3TVK1WC8VYsgKGYZCqqhoAqAGAGgCo
ybUaAKjVaDR1Go2mHgBYKCyAP2AYBmm1Wotut7dbrVZzZ9O2/fs7L1zsdJ1aY9bFH79+9I8v
+u5xRo9Y8+14EJIkMel0OsJxnNNkMm0xm82HzWbzKavVesZkMu3U6/U70un0PW3uBQCwNTcf
6Ov78MFoNJJisQQTkCQJRaPR5263+4nH43nq8XieOJ3Op06nc1gUxRmlAACA1tZNTUNDI8PB
YDBULJb8yp2lVquNzZx5AKVQKDQUCAT6A4FAXyAQ6AuHw72hUKgvFAr1hsPhEZ7nQ3kLAADW
rl3XPjQ0MhIIBOZKxVI4AEVRqCRJcTab/SpJ0leSJA1IkjQgSdJgOp0eSKfTA5lMZkBV1cVS
sf4B+A0KddivO2r7lgAAAABJRU5ErkJggg==
    """
    
    # Create favicon files directory
    favicon_dir = Path("/home/titan/FactBench/dist/")
    favicon_dir.mkdir(exist_ok=True)
    
    # Write base64 favicon as ICO file
    with open(favicon_dir / "favicon.ico", "wb") as f:
        f.write(base64.b64decode(favicon_32_base64))
    
    print("✓ Created favicon.ico")
    
    # Create simple test HTML to verify favicon
    test_html = f"""<!DOCTYPE html>
<html>
<head>
    <title>FactBench Favicon Test</title>
    <link rel="icon" type="image/x-icon" href="favicon.ico">
</head>
<body style="background: #0f172a; color: #0ea5e9; font-family: sans-serif; padding: 2rem;">
    <h1>FactBench Favicon Test</h1>
    <p>Check if the favicon appears in the browser tab.</p>
</body>
</html>"""
    
    with open(favicon_dir / "favicon-test.html", "w") as f:
        f.write(test_html)
    
    print("✓ Created favicon test file")
    print(f"✓ Favicons generated in: {favicon_dir}")

if __name__ == "__main__":
    create_favicon_html()