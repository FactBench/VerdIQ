#!/usr/bin/env python3
"""
Table Extractor Agent for FactBench
Extracts all table data including comparison tables, specifications, and feature matrices
"""

import asyncio
import json
import csv
from pathlib import Path
from typing import Dict, List, Any, Optional
import pandas as pd

from playwright.async_api import async_playwright
from base_agent import BaseAgent


class TableExtractorAgent(BaseAgent):
    """Agent responsible for extracting all table data"""
    
    def __init__(self):
        super().__init__("TableExtractorAgent")
        self.tables_dir = self.workspace_dir / "tables"
        self.tables_dir.mkdir(exist_ok=True)
        self.tables_data = {
            "extraction_date": self.timestamp,
            "tables": [],
            "comparison_table": None,
            "specifications_tables": [],
            "feature_matrix": None
        }
    
    async def extract_with_playwright(self, source_url: str) -> Dict[str, Any]:
        """Extract tables using Playwright"""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            
            try:
                # Navigate to page
                self.logger.info(f"Navigating to {source_url}")
                await page.goto(source_url, wait_until="networkidle")
                await page.wait_for_timeout(3000)
                
                # Expand any collapsed content
                await self.expand_content(page)
                
                # Extract all tables
                all_tables = await self.extract_all_tables(page)
                
                # Process and categorize tables
                for table_data in all_tables:
                    self.process_table(table_data)
                
                # Extract comparison data from non-table elements
                comparison_data = await self.extract_comparison_cards(page)
                if comparison_data:
                    self.process_comparison_data(comparison_data)
                
                return self.tables_data
                
            finally:
                await browser.close()
    
    async def expand_content(self, page):
        """Expand any collapsed content that might contain tables"""
        self.logger.info("Expanding collapsed content")
        
        # Click on expand buttons
        expand_selectors = [
            '[class*="expand"]',
            '[class*="show-more"]',
            '[class*="view-all"]',
            'button:has-text("More")',
            'button:has-text("Show")',
            '[aria-expanded="false"]'
        ]
        
        for selector in expand_selectors:
            try:
                elements = await page.query_selector_all(selector)
                for element in elements:
                    await element.click()
                    await page.wait_for_timeout(500)
            except:
                pass
    
    async def extract_all_tables(self, page) -> List[Dict]:
        """Extract all tables from the page"""
        self.logger.info("Extracting all tables")
        
        tables_data = await page.evaluate("""
            () => {
                const tables = [];
                
                // Find all table elements
                document.querySelectorAll('table').forEach((table, index) => {
                    const tableData = {
                        index: index,
                        id: table.id || `table-${index}`,
                        className: table.className,
                        caption: table.querySelector('caption')?.textContent?.trim() || '',
                        headers: [],
                        rows: [],
                        metadata: {}
                    };
                    
                    // Check for table title/heading
                    const prevElement = table.previousElementSibling;
                    if (prevElement && prevElement.matches('h1, h2, h3, h4, h5, h6')) {
                        tableData.title = prevElement.textContent.trim();
                    }
                    
                    // Extract headers
                    const headerRows = table.querySelectorAll('thead tr, tr:first-child');
                    headerRows.forEach(row => {
                        const headers = [];
                        row.querySelectorAll('th, td').forEach(cell => {
                            headers.push({
                                text: cell.textContent.trim(),
                                colspan: cell.colSpan || 1,
                                rowspan: cell.rowSpan || 1
                            });
                        });
                        if (headers.length > 0) {
                            tableData.headers.push(headers);
                        }
                    });
                    
                    // Extract data rows
                    const dataRows = table.querySelectorAll('tbody tr, tr');
                    dataRows.forEach((row, rowIndex) => {
                        // Skip if this is a header row
                        if (row.querySelector('th') && rowIndex === 0) return;
                        
                        const rowData = [];
                        row.querySelectorAll('td, th').forEach(cell => {
                            const cellData = {
                                text: cell.textContent.trim(),
                                html: cell.innerHTML,
                                colspan: cell.colSpan || 1,
                                rowspan: cell.rowSpan || 1
                            };
                            
                            // Check for special content
                            if (cell.querySelector('img')) {
                                cellData.hasImage = true;
                                cellData.imageUrl = cell.querySelector('img').src;
                            }
                            
                            if (cell.querySelector('.badge, .award')) {
                                cellData.hasBadge = true;
                                cellData.badge = cell.querySelector('.badge, .award').textContent.trim();
                            }
                            
                            if (cell.querySelector('.rating, .stars')) {
                                cellData.hasRating = true;
                                cellData.rating = cell.querySelector('.rating, .stars').textContent.trim();
                            }
                            
                            rowData.push(cellData);
                        });
                        
                        if (rowData.length > 0) {
                            tableData.rows.push(rowData);
                        }
                    });
                    
                    // Determine table type
                    tableData.metadata.isComparison = table.classList.contains('comparison') || 
                                                     tableData.title?.toLowerCase().includes('comparison');
                    tableData.metadata.isSpecification = table.classList.contains('spec') || 
                                                        tableData.title?.toLowerCase().includes('specification');
                    tableData.metadata.columnCount = tableData.headers[0]?.length || 0;
                    tableData.metadata.rowCount = tableData.rows.length;
                    
                    tables.push(tableData);
                });
                
                // Also look for div-based tables
                const divTables = document.querySelectorAll('.table:not(table), [class*="comparison-grid"], [class*="spec-table"]');
                divTables.forEach((divTable, index) => {
                    const tableData = {
                        index: tables.length + index,
                        id: divTable.id || `div-table-${index}`,
                        className: divTable.className,
                        isDivBased: true,
                        headers: [],
                        rows: [],
                        metadata: {}
                    };
                    
                    // Extract headers from div table
                    const headerRow = divTable.querySelector('.header-row, .table-header, [class*="header"]');
                    if (headerRow) {
                        const headers = [];
                        headerRow.querySelectorAll('.cell, .column, div').forEach(cell => {
                            headers.push({
                                text: cell.textContent.trim()
                            });
                        });
                        tableData.headers.push(headers);
                    }
                    
                    // Extract rows from div table
                    const rows = divTable.querySelectorAll('.row:not(.header-row), .table-row, [class*="product-row"]');
                    rows.forEach(row => {
                        const rowData = [];
                        row.querySelectorAll('.cell, .column, td, div[class*="col"]').forEach(cell => {
                            rowData.push({
                                text: cell.textContent.trim(),
                                html: cell.innerHTML
                            });
                        });
                        if (rowData.length > 0) {
                            tableData.rows.push(rowData);
                        }
                    });
                    
                    if (tableData.rows.length > 0) {
                        tables.push(tableData);
                    }
                });
                
                return tables;
            }
        """)
        
        return tables_data
    
    async def extract_comparison_cards(self, page) -> Dict:
        """Extract comparison data from card-based layouts"""
        self.logger.info("Extracting comparison cards")
        
        comparison_data = await page.evaluate("""
            () => {
                const products = [];
                
                // Find product comparison cards
                const productCards = document.querySelectorAll(
                    '.product-card, .comparison-item, [class*="product-item"], ' +
                    'article[class*="product"], div[data-product-id]'
                );
                
                productCards.forEach(card => {
                    const productData = {
                        name: card.querySelector('h2, h3, .product-name')?.textContent?.trim() || '',
                        attributes: {}
                    };
                    
                    // Extract all data points
                    const dataPoints = card.querySelectorAll(
                        '.spec-item, .feature-item, [class*="specification"], ' +
                        'dl > *, .data-point, [class*="attribute"]'
                    );
                    
                    dataPoints.forEach(point => {
                        let key = '';
                        let value = '';
                        
                        // Try different patterns
                        if (point.tagName === 'DT') {
                            key = point.textContent.trim();
                            value = point.nextElementSibling?.textContent?.trim() || '';
                        } else if (point.querySelector('.label, .key, .name')) {
                            key = point.querySelector('.label, .key, .name').textContent.trim();
                            value = point.querySelector('.value, .data')?.textContent?.trim() || '';
                        } else {
                            // Try to split by colon
                            const text = point.textContent.trim();
                            const colonIndex = text.indexOf(':');
                            if (colonIndex > 0) {
                                key = text.substring(0, colonIndex).trim();
                                value = text.substring(colonIndex + 1).trim();
                            }
                        }
                        
                        if (key && value) {
                            productData.attributes[key] = value;
                        }
                    });
                    
                    // Extract specific common attributes
                    productData.rating = card.querySelector('.rating, .stars, [class*="rating"]')?.textContent?.trim();
                    productData.price = card.querySelector('.price, [class*="price"]')?.textContent?.trim();
                    productData.badge = card.querySelector('.badge, .award, [class*="badge"]')?.textContent?.trim();
                    
                    if (productData.name) {
                        products.push(productData);
                    }
                });
                
                return {
                    products: products,
                    extractedFrom: 'cards'
                };
            }
        """)
        
        return comparison_data
    
    def process_table(self, table_data: Dict):
        """Process and categorize a table"""
        self.logger.info(f"Processing table: {table_data.get('title', table_data['id'])}")
        
        # Convert to structured format
        structured_table = self.structure_table_data(table_data)
        
        # Add to tables list
        self.tables_data["tables"].append(structured_table)
        
        # Categorize table
        if table_data['metadata'].get('isComparison'):
            self.tables_data["comparison_table"] = structured_table
            self.save_comparison_table(structured_table)
        
        elif table_data['metadata'].get('isSpecification'):
            self.tables_data["specifications_tables"].append(structured_table)
            self.save_specification_table(structured_table)
        
        # Save as CSV
        self.save_table_as_csv(structured_table, table_data['id'])
        
        self.update_metrics(True)
    
    def structure_table_data(self, table_data: Dict) -> Dict:
        """Convert raw table data to structured format"""
        structured = {
            "id": table_data["id"],
            "title": table_data.get("title", ""),
            "headers": [],
            "data": [],
            "metadata": table_data["metadata"]
        }
        
        # Process headers
        if table_data["headers"]:
            # Flatten multi-row headers
            main_headers = []
            for header_row in table_data["headers"]:
                for header in header_row:
                    main_headers.append(header["text"])
            structured["headers"] = main_headers
        
        # Process data rows
        for row in table_data["rows"]:
            row_data = {}
            for idx, cell in enumerate(row):
                if idx < len(structured["headers"]):
                    header = structured["headers"][idx]
                else:
                    header = f"Column_{idx}"
                
                # Extract cell value
                value = cell["text"]
                
                # Add special attributes
                if cell.get("hasBadge"):
                    value = f"{value} (Badge: {cell['badge']})"
                if cell.get("hasRating"):
                    value = f"{value} (Rating: {cell['rating']})"
                
                row_data[header] = value
            
            structured["data"].append(row_data)
        
        return structured
    
    def process_comparison_data(self, comparison_data: Dict):
        """Process comparison data from cards into table format"""
        if not comparison_data or not comparison_data.get("products"):
            return
        
        self.logger.info("Processing comparison card data")
        
        # Get all unique attributes
        all_attributes = set()
        for product in comparison_data["products"]:
            all_attributes.update(product["attributes"].keys())
        
        # Create comparison table
        headers = ["Product Name", "Rating", "Price", "Badge"] + list(all_attributes)
        data = []
        
        for product in comparison_data["products"]:
            row = {
                "Product Name": product["name"],
                "Rating": product.get("rating", ""),
                "Price": product.get("price", ""),
                "Badge": product.get("badge", "")
            }
            
            # Add attributes
            for attr in all_attributes:
                row[attr] = product["attributes"].get(attr, "")
            
            data.append(row)
        
        # Create structured table
        comparison_table = {
            "id": "comparison-from-cards",
            "title": "Product Comparison",
            "headers": headers,
            "data": data,
            "metadata": {
                "source": "cards",
                "productCount": len(data)
            }
        }
        
        # Save comparison table
        if not self.tables_data["comparison_table"]:
            self.tables_data["comparison_table"] = comparison_table
        
        self.save_comparison_table(comparison_table)
    
    def save_table_as_csv(self, table: Dict, filename: str):
        """Save table data as CSV"""
        csv_path = self.tables_dir / f"{filename}.csv"
        
        if table["data"]:
            df = pd.DataFrame(table["data"])
            df.to_csv(csv_path, index=False, encoding='utf-8')
            self.logger.info(f"Saved table to {csv_path}")
    
    def save_comparison_table(self, table: Dict):
        """Save comparison table in multiple formats"""
        # Save as JSON
        self.save_json(table, "main_comparison_table.json", "tables")
        
        # Save as CSV
        self.save_table_as_csv(table, "main_comparison_table")
        
        # Create simplified product comparison
        simplified = {
            "products": []
        }
        
        for row in table["data"]:
            product = {
                "name": row.get("Product Name", ""),
                "rating": row.get("Rating", ""),
                "price": row.get("Price", ""),
                "badge": row.get("Badge", ""),
                "key_features": {}
            }
            
            # Add other attributes
            for key, value in row.items():
                if key not in ["Product Name", "Rating", "Price", "Badge"] and value:
                    product["key_features"][key] = value
            
            simplified["products"].append(product)
        
        self.save_json(simplified, "simplified_comparison.json", "tables")
    
    def save_specification_table(self, table: Dict):
        """Save specification table"""
        spec_id = table["id"].replace("table-", "spec-")
        self.save_json(table, f"{spec_id}.json", "tables")
        self.save_table_as_csv(table, spec_id)
    
    def extract(self, source_url: str) -> Dict[str, Any]:
        """Main extraction method"""
        # Run async extraction
        loop = asyncio.get_event_loop()
        results = loop.run_until_complete(self.extract_with_playwright(source_url))
        
        # Save complete tables data
        self.save_json(self.tables_data, "all_tables_data.json", "tables")
        
        # Create consolidated specifications
        self.create_consolidated_specs()
        
        return results
    
    def create_consolidated_specs(self):
        """Create a consolidated view of all specifications"""
        consolidated = {}
        
        # From comparison table
        if self.tables_data["comparison_table"]:
            for row in self.tables_data["comparison_table"]["data"]:
                product_name = row.get("Product Name", "Unknown")
                consolidated[product_name] = row
        
        # From specification tables
        for spec_table in self.tables_data["specifications_tables"]:
            for row in spec_table["data"]:
                # Try to match product name
                for key, value in row.items():
                    if "product" in key.lower() or "model" in key.lower():
                        product_name = value
                        if product_name not in consolidated:
                            consolidated[product_name] = {}
                        consolidated[product_name].update(row)
                        break
        
        self.save_json(consolidated, "consolidated_specifications.json", "tables")
    
    def validate_results(self) -> Dict[str, Any]:
        """Validate extracted table data"""
        validation = {
            "total_tables": len(self.tables_data["tables"]),
            "has_comparison_table": self.tables_data["comparison_table"] is not None,
            "specification_tables_count": len(self.tables_data["specifications_tables"]),
            "products_in_comparison": 0,
            "missing_data": [],
            "validation_passed": True
        }
        
        # Validate comparison table
        if self.tables_data["comparison_table"]:
            comparison = self.tables_data["comparison_table"]
            validation["products_in_comparison"] = len(comparison["data"])
            
            # Check for empty cells
            for row in comparison["data"]:
                product_name = row.get("Product Name", "Unknown")
                empty_fields = [key for key, value in row.items() if not value]
                if empty_fields:
                    validation["missing_data"].append({
                        "product": product_name,
                        "empty_fields": empty_fields
                    })
            
            # Check if we have enough products
            if validation["products_in_comparison"] < 5:
                validation["validation_passed"] = False
                validation["warning"] = "Less than 5 products in comparison table"
        else:
            validation["validation_passed"] = False
            validation["error"] = "No comparison table found"
        
        # Log validation results
        self.logger.info(f"Table Validation Results:")
        self.logger.info(f"  - Total tables found: {validation['total_tables']}")
        self.logger.info(f"  - Has comparison table: {validation['has_comparison_table']}")
        self.logger.info(f"  - Products in comparison: {validation['products_in_comparison']}")
        self.logger.info(f"  - Tables with missing data: {len(validation['missing_data'])}")
        
        # Save validation report
        self.save_json(validation, f"table_validation_{self.timestamp}.json", "validation")
        
        return validation


if __name__ == "__main__":
    # Test the agent
    agent = TableExtractorAgent()
    
    # Replace with actual source URL
    source_url = "https://zoopy.com/best-robotic-pool-cleaners"
    
    results = agent.run(source_url)
    print(json.dumps(results, indent=2))