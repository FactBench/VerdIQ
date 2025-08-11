#!/usr/bin/env python3
"""
Validation Agent for FactBench
Validates all extracted data and ensures completeness according to requirements
"""

import json
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime
import re

from base_agent import BaseAgent


class ValidationAgent(BaseAgent):
    """Agent responsible for validating all extracted data"""
    
    def __init__(self):
        super().__init__("ValidationAgent")
        self.validation_results = {
            "validation_date": self.timestamp,
            "overall_status": "PENDING",
            "categories": {
                "images": {},
                "text": {},
                "tables": {},
                "reviews": {}
            },
            "missing_items": {
                "critical": [],
                "important": [],
                "optional": []
            },
            "recommendations": [],
            "data_quality_score": 0
        }
    
    def extract(self, source_url: str) -> Dict[str, Any]:
        """Main validation method - source_url not used but required by base class"""
        self.logger.info("Starting comprehensive validation of extracted data")
        
        # Validate each category
        self.validate_images()
        self.validate_text_content()
        self.validate_tables()
        self.validate_reviews()
        
        # Cross-validate data consistency
        self.cross_validate_data()
        
        # Calculate overall score
        self.calculate_quality_score()
        
        # Generate recommendations
        self.generate_recommendations()
        
        # Determine overall status
        self.determine_overall_status()
        
        # Save validation report
        self.save_validation_report()
        
        return self.validation_results
    
    def validate_images(self):
        """Validate image extraction results"""
        self.logger.info("Validating images...")
        
        validation = {
            "status": "PASS",
            "total_products": 0,
            "products_with_images": 0,
            "products_without_images": [],
            "products_with_single_image": [],
            "total_images": 0,
            "missing_main_images": [],
            "issues": []
        }
        
        # Load image manifest
        manifest_path = self.workspace_dir / "images" / "image_manifest.json"
        if not manifest_path.exists():
            validation["status"] = "FAIL"
            validation["issues"].append("Image manifest not found")
            self.validation_results["categories"]["images"] = validation
            return
        
        image_manifest = self.load_json("image_manifest.json", "images")
        
        # Validate each product
        for product_id, product_data in image_manifest.get("products", {}).items():
            validation["total_products"] += 1
            
            downloaded_count = product_data.get("downloaded_count", 0)
            
            if downloaded_count == 0:
                validation["products_without_images"].append(product_id)
                validation["status"] = "FAIL"
                self.validation_results["missing_items"]["critical"].append({
                    "type": "images",
                    "product": product_id,
                    "issue": "No images found"
                })
            elif downloaded_count == 1:
                validation["products_with_single_image"].append(product_id)
                self.validation_results["missing_items"]["important"].append({
                    "type": "images",
                    "product": product_id,
                    "issue": "Only one image found"
                })
            else:
                validation["products_with_images"] += 1
            
            validation["total_images"] += downloaded_count
            
            # Check for main image
            has_main = any(img.get("filename") == "main.jpg" for img in product_data.get("images", []))
            if not has_main and downloaded_count > 0:
                validation["missing_main_images"].append(product_id)
        
        # Set validation status
        if validation["products_without_images"]:
            validation["status"] = "FAIL"
        elif validation["products_with_single_image"]:
            validation["status"] = "PARTIAL"
        
        validation["coverage_percentage"] = (
            validation["products_with_images"] / validation["total_products"] * 100
            if validation["total_products"] > 0 else 0
        )
        
        self.validation_results["categories"]["images"] = validation
        
        self.logger.info(f"Image validation: {validation['status']}")
        self.logger.info(f"  - Products with images: {validation['products_with_images']}/{validation['total_products']}")
        self.logger.info(f"  - Total images: {validation['total_images']}")
    
    def validate_text_content(self):
        """Validate text content extraction"""
        self.logger.info("Validating text content...")
        
        validation = {
            "status": "PASS",
            "total_products": 0,
            "complete_products": 0,
            "missing_descriptions": [],
            "missing_features": [],
            "missing_taglines": [],
            "content_quality": {},
            "issues": []
        }
        
        # Load text content
        content_path = self.workspace_dir / "text" / "complete_text_content.json"
        if not content_path.exists():
            validation["status"] = "FAIL"
            validation["issues"].append("Text content not found")
            self.validation_results["categories"]["text"] = validation
            return
        
        text_content = self.load_json("complete_text_content.json", "text")
        
        # Validate each product
        for product_id, product_data in text_content.get("products", {}).items():
            validation["total_products"] += 1
            
            has_complete_content = True
            
            # Check description
            description = product_data.get("description", "")
            if len(description) < 100:
                validation["missing_descriptions"].append(product_id)
                has_complete_content = False
                self.validation_results["missing_items"]["critical"].append({
                    "type": "text",
                    "product": product_id,
                    "issue": "Missing or short description"
                })
            
            # Check features
            features = product_data.get("features", {})
            if not features.get("pros") and not features.get("highlights"):
                validation["missing_features"].append(product_id)
                has_complete_content = False
                self.validation_results["missing_items"]["important"].append({
                    "type": "text",
                    "product": product_id,
                    "issue": "Missing features/pros"
                })
            
            # Check tagline
            if not product_data.get("tagline"):
                validation["missing_taglines"].append(product_id)
                self.validation_results["missing_items"]["optional"].append({
                    "type": "text",
                    "product": product_id,
                    "issue": "Missing tagline"
                })
            
            if has_complete_content:
                validation["complete_products"] += 1
        
        # Validate page sections
        sections = text_content.get("sections", {})
        validation["has_methodology"] = bool(sections.get("methodology"))
        validation["has_buying_guide"] = bool(sections.get("buyingGuide"))
        validation["has_faq"] = bool(sections.get("faq"))
        
        # Set validation status
        if validation["missing_descriptions"]:
            validation["status"] = "FAIL"
        elif validation["missing_features"]:
            validation["status"] = "PARTIAL"
        
        validation["completeness_percentage"] = (
            validation["complete_products"] / validation["total_products"] * 100
            if validation["total_products"] > 0 else 0
        )
        
        self.validation_results["categories"]["text"] = validation
        
        self.logger.info(f"Text validation: {validation['status']}")
        self.logger.info(f"  - Complete products: {validation['complete_products']}/{validation['total_products']}")
    
    def validate_tables(self):
        """Validate table extraction"""
        self.logger.info("Validating tables...")
        
        validation = {
            "status": "PASS",
            "has_comparison_table": False,
            "comparison_products": 0,
            "missing_specifications": [],
            "empty_cells": [],
            "issues": []
        }
        
        # Load tables data
        tables_path = self.workspace_dir / "tables" / "all_tables_data.json"
        if not tables_path.exists():
            validation["status"] = "FAIL"
            validation["issues"].append("Tables data not found")
            self.validation_results["categories"]["tables"] = validation
            return
        
        tables_data = self.load_json("all_tables_data.json", "tables")
        
        # Validate comparison table
        comparison_table = tables_data.get("comparison_table")
        if comparison_table:
            validation["has_comparison_table"] = True
            validation["comparison_products"] = len(comparison_table.get("data", []))
            
            # Check for empty cells
            for row in comparison_table.get("data", []):
                product_name = row.get("Product Name", "Unknown")
                empty_fields = [key for key, value in row.items() if not str(value).strip()]
                if empty_fields:
                    validation["empty_cells"].append({
                        "product": product_name,
                        "empty_fields": empty_fields
                    })
                    
            # Check all expected columns
            expected_columns = ["Product Name", "Rating", "Price", "Pool Size", "Cleaning Time"]
            headers = comparison_table.get("headers", [])
            missing_columns = [col for col in expected_columns if col not in headers]
            if missing_columns:
                validation["issues"].append(f"Missing columns in comparison table: {missing_columns}")
                validation["status"] = "PARTIAL"
        else:
            validation["status"] = "FAIL"
            validation["issues"].append("No comparison table found")
            self.validation_results["missing_items"]["critical"].append({
                "type": "tables",
                "issue": "Missing main comparison table"
            })
        
        # Check minimum products
        if validation["comparison_products"] < 8:
            validation["status"] = "PARTIAL"
            validation["issues"].append(f"Only {validation['comparison_products']} products in comparison table (expected 8+)")
        
        self.validation_results["categories"]["tables"] = validation
        
        self.logger.info(f"Table validation: {validation['status']}")
        self.logger.info(f"  - Has comparison table: {validation['has_comparison_table']}")
        self.logger.info(f"  - Products in comparison: {validation['comparison_products']}")
    
    def validate_reviews(self):
        """Validate review extraction"""
        self.logger.info("Validating reviews...")
        
        validation = {
            "status": "PASS",
            "total_products": 0,
            "products_with_reviews": 0,
            "products_without_reviews": [],
            "products_without_review_links": [],
            "total_reviews": 0,
            "total_review_links": 0,
            "issues": []
        }
        
        # Load reviews data
        reviews_path = self.workspace_dir / "reviews" / "all_reviews_data.json"
        if not reviews_path.exists():
            validation["status"] = "FAIL"
            validation["issues"].append("Reviews data not found")
            self.validation_results["categories"]["reviews"] = validation
            return
        
        reviews_data = self.load_json("all_reviews_data.json", "reviews")
        
        # Validate each product
        for product_id, product_data in reviews_data.get("products", {}).items():
            validation["total_products"] += 1
            
            # Check for reviews
            user_reviews = product_data.get("user_reviews", [])
            expert_review = product_data.get("expert_review")
            review_links = product_data.get("review_links", [])
            
            if user_reviews or expert_review:
                validation["products_with_reviews"] += 1
                validation["total_reviews"] += len(user_reviews)
            else:
                validation["products_without_reviews"].append(product_id)
                self.validation_results["missing_items"]["critical"].append({
                    "type": "reviews",
                    "product": product_id,
                    "issue": "No reviews found"
                })
            
            # Check for review links
            if review_links:
                validation["total_review_links"] += len(review_links)
            else:
                validation["products_without_review_links"].append(product_id)
                self.validation_results["missing_items"]["important"].append({
                    "type": "reviews",
                    "product": product_id,
                    "issue": "No review links found"
                })
        
        # Set validation status
        review_coverage = (
            validation["products_with_reviews"] / validation["total_products"] * 100
            if validation["total_products"] > 0 else 0
        )
        
        if review_coverage < 50:
            validation["status"] = "FAIL"
        elif review_coverage < 80:
            validation["status"] = "PARTIAL"
        
        validation["review_coverage_percentage"] = review_coverage
        
        self.validation_results["categories"]["reviews"] = validation
        
        self.logger.info(f"Review validation: {validation['status']}")
        self.logger.info(f"  - Products with reviews: {validation['products_with_reviews']}/{validation['total_products']}")
        self.logger.info(f"  - Total reviews: {validation['total_reviews']}")
        self.logger.info(f"  - Total review links: {validation['total_review_links']}")
    
    def cross_validate_data(self):
        """Cross-validate data consistency across different sources"""
        self.logger.info("Cross-validating data consistency...")
        
        issues = []
        
        # Load all data sources
        image_manifest = self.load_json("image_manifest.json", "images")
        text_content = self.load_json("complete_text_content.json", "text")
        tables_data = self.load_json("all_tables_data.json", "tables")
        reviews_data = self.load_json("all_reviews_data.json", "reviews")
        
        # Get all product IDs
        all_product_ids = set()
        all_product_ids.update(image_manifest.get("products", {}).keys())
        all_product_ids.update(text_content.get("products", {}).keys())
        all_product_ids.update(reviews_data.get("products", {}).keys())
        
        # Check consistency
        for product_id in all_product_ids:
            # Check if product exists in all sources
            in_images = product_id in image_manifest.get("products", {})
            in_text = product_id in text_content.get("products", {})
            in_reviews = product_id in reviews_data.get("products", {})
            
            if not all([in_images, in_text, in_reviews]):
                missing_in = []
                if not in_images: missing_in.append("images")
                if not in_text: missing_in.append("text")
                if not in_reviews: missing_in.append("reviews")
                
                issues.append({
                    "product_id": product_id,
                    "issue": f"Product missing in: {', '.join(missing_in)}"
                })
        
        # Check product names consistency
        for product_id in all_product_ids:
            names = []
            
            if product_id in text_content.get("products", {}):
                names.append(text_content["products"][product_id].get("name", ""))
            
            if product_id in reviews_data.get("products", {}):
                names.append(reviews_data["products"][product_id].get("product_name", ""))
            
            # Check if names are consistent
            unique_names = set(n for n in names if n)
            if len(unique_names) > 1:
                issues.append({
                    "product_id": product_id,
                    "issue": f"Inconsistent product names: {list(unique_names)}"
                })
        
        self.validation_results["cross_validation_issues"] = issues
        
        if issues:
            self.logger.warning(f"Found {len(issues)} cross-validation issues")
    
    def calculate_quality_score(self):
        """Calculate overall data quality score"""
        scores = {
            "images": 0,
            "text": 0,
            "tables": 0,
            "reviews": 0
        }
        
        # Image score
        image_validation = self.validation_results["categories"]["images"]
        if image_validation.get("status") == "PASS":
            scores["images"] = 100
        elif image_validation.get("status") == "PARTIAL":
            scores["images"] = 70
        else:
            scores["images"] = 30
        
        # Adjust for coverage
        coverage = image_validation.get("coverage_percentage", 0)
        scores["images"] = scores["images"] * (coverage / 100)
        
        # Text score
        text_validation = self.validation_results["categories"]["text"]
        if text_validation.get("status") == "PASS":
            scores["text"] = 100
        elif text_validation.get("status") == "PARTIAL":
            scores["text"] = 70
        else:
            scores["text"] = 30
        
        completeness = text_validation.get("completeness_percentage", 0)
        scores["text"] = scores["text"] * (completeness / 100)
        
        # Table score
        table_validation = self.validation_results["categories"]["tables"]
        if table_validation.get("status") == "PASS":
            scores["tables"] = 100
        elif table_validation.get("status") == "PARTIAL":
            scores["tables"] = 70
        else:
            scores["tables"] = 30
        
        # Review score
        review_validation = self.validation_results["categories"]["reviews"]
        if review_validation.get("status") == "PASS":
            scores["reviews"] = 100
        elif review_validation.get("status") == "PARTIAL":
            scores["reviews"] = 70
        else:
            scores["reviews"] = 30
        
        review_coverage = review_validation.get("review_coverage_percentage", 0)
        scores["reviews"] = scores["reviews"] * (review_coverage / 100)
        
        # Calculate weighted average
        weights = {
            "images": 0.25,
            "text": 0.30,
            "tables": 0.25,
            "reviews": 0.20
        }
        
        total_score = sum(scores[cat] * weights[cat] for cat in scores)
        
        self.validation_results["data_quality_score"] = round(total_score, 2)
        self.validation_results["category_scores"] = scores
        
        self.logger.info(f"Data quality score: {total_score:.2f}/100")
        self.logger.info(f"Category scores: {scores}")
    
    def generate_recommendations(self):
        """Generate recommendations for improving data quality"""
        recommendations = []
        
        # Image recommendations
        image_validation = self.validation_results["categories"]["images"]
        if image_validation.get("products_without_images"):
            recommendations.append({
                "priority": "HIGH",
                "category": "images",
                "action": f"Find and download images for {len(image_validation['products_without_images'])} products",
                "products": image_validation["products_without_images"][:5]  # First 5
            })
        
        if image_validation.get("products_with_single_image"):
            recommendations.append({
                "priority": "MEDIUM",
                "category": "images",
                "action": f"Find additional images for {len(image_validation['products_with_single_image'])} products with only one image",
                "products": image_validation["products_with_single_image"][:5]
            })
        
        # Text recommendations
        text_validation = self.validation_results["categories"]["text"]
        if text_validation.get("missing_descriptions"):
            recommendations.append({
                "priority": "HIGH",
                "category": "text",
                "action": f"Add descriptions for {len(text_validation['missing_descriptions'])} products",
                "products": text_validation["missing_descriptions"][:5]
            })
        
        # Table recommendations
        table_validation = self.validation_results["categories"]["tables"]
        if not table_validation.get("has_comparison_table"):
            recommendations.append({
                "priority": "CRITICAL",
                "category": "tables",
                "action": "Create main comparison table with all products"
            })
        
        # Review recommendations
        review_validation = self.validation_results["categories"]["reviews"]
        if review_validation.get("products_without_reviews"):
            recommendations.append({
                "priority": "HIGH",
                "category": "reviews",
                "action": f"Find reviews for {len(review_validation['products_without_reviews'])} products",
                "products": review_validation["products_without_reviews"][:5]
            })
        
        if review_validation.get("products_without_review_links"):
            recommendations.append({
                "priority": "MEDIUM",
                "category": "reviews",
                "action": f"Add review links for {len(review_validation['products_without_review_links'])} products",
                "products": review_validation["products_without_review_links"][:5]
            })
        
        self.validation_results["recommendations"] = recommendations
    
    def determine_overall_status(self):
        """Determine overall validation status"""
        statuses = [
            self.validation_results["categories"][cat].get("status", "FAIL")
            for cat in ["images", "text", "tables", "reviews"]
        ]
        
        if all(status == "PASS" for status in statuses):
            self.validation_results["overall_status"] = "PASS"
        elif any(status == "FAIL" for status in statuses):
            self.validation_results["overall_status"] = "FAIL"
        else:
            self.validation_results["overall_status"] = "PARTIAL"
        
        # Check quality score
        if self.validation_results["data_quality_score"] < 60:
            self.validation_results["overall_status"] = "FAIL"
        
        self.logger.info(f"Overall validation status: {self.validation_results['overall_status']}")
    
    def save_validation_report(self):
        """Save comprehensive validation report"""
        # Save main report
        self.save_json(
            self.validation_results,
            f"validation_report_{self.timestamp}.json",
            "validation"
        )
        
        # Create summary report
        summary = {
            "validation_date": self.timestamp,
            "overall_status": self.validation_results["overall_status"],
            "quality_score": self.validation_results["data_quality_score"],
            "critical_issues": len(self.validation_results["missing_items"]["critical"]),
            "important_issues": len(self.validation_results["missing_items"]["important"]),
            "recommendations_count": len(self.validation_results["recommendations"]),
            "category_statuses": {
                cat: self.validation_results["categories"][cat]["status"]
                for cat in ["images", "text", "tables", "reviews"]
            }
        }
        
        self.save_json(summary, "validation_summary.json", "validation")
        
        # Create actionable checklist
        checklist = {
            "critical_actions": [],
            "important_actions": [],
            "optional_actions": []
        }
        
        for rec in self.validation_results["recommendations"]:
            if rec["priority"] == "CRITICAL" or rec["priority"] == "HIGH":
                checklist["critical_actions"].append(rec["action"])
            elif rec["priority"] == "MEDIUM":
                checklist["important_actions"].append(rec["action"])
            else:
                checklist["optional_actions"].append(rec["action"])
        
        self.save_json(checklist, "action_checklist.json", "validation")
    
    def validate_results(self) -> Dict[str, Any]:
        """Return validation results - required by base class"""
        return self.validation_results


if __name__ == "__main__":
    # Test the validation agent
    agent = ValidationAgent()
    
    # Run validation (source_url not used but required)
    results = agent.run("validation")
    
    print(json.dumps(results, indent=2))