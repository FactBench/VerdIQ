#!/usr/bin/env python3
"""
Deployment Agent for FactBench
Handles final validation, building, and deployment to GitHub Pages
"""

import json
import subprocess
import shutil
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime
import os

from base_agent import BaseAgent


class DeploymentAgent(BaseAgent):
    """Agent responsible for deploying the site with validated data"""
    
    def __init__(self):
        super().__init__("DeploymentAgent")
        self.project_root = Path(__file__).parent.parent  # FactBench root
        self.deployment_status = {
            "deployment_date": self.timestamp,
            "pre_deployment_checks": {},
            "build_status": "PENDING",
            "deployment_status": "PENDING",
            "errors": [],
            "warnings": [],
            "deployed_url": "https://factbench.github.io/VerdIQ/"
        }
    
    def extract(self, source_url: str) -> Dict[str, Any]:
        """Main deployment method - source_url not used but required by base class"""
        self.logger.info("Starting deployment process")
        
        # Run pre-deployment checks
        if not self.run_pre_deployment_checks():
            self.deployment_status["deployment_status"] = "ABORTED"
            self.logger.error("Pre-deployment checks failed. Aborting deployment.")
            return self.deployment_status
        
        # Integrate extracted data
        if not self.integrate_extracted_data():
            self.deployment_status["deployment_status"] = "FAILED"
            return self.deployment_status
        
        # Build the site
        if not self.build_site():
            self.deployment_status["deployment_status"] = "FAILED"
            return self.deployment_status
        
        # Run post-build validation
        if not self.validate_build():
            self.deployment_status["deployment_status"] = "FAILED"
            return self.deployment_status
        
        # Deploy to GitHub
        if not self.deploy_to_github():
            self.deployment_status["deployment_status"] = "FAILED"
            return self.deployment_status
        
        # Final status
        self.deployment_status["deployment_status"] = "SUCCESS"
        self.save_deployment_report()
        
        return self.deployment_status
    
    def run_pre_deployment_checks(self) -> bool:
        """Run comprehensive checks before deployment"""
        self.logger.info("Running pre-deployment checks...")
        
        checks = {
            "validation_passed": False,
            "required_files_exist": False,
            "data_quality_acceptable": False,
            "dependencies_installed": False,
            "github_token_available": False
        }
        
        # Check validation results
        validation_summary_path = self.workspace_dir / "validation" / "validation_summary.json"
        if validation_summary_path.exists():
            validation_summary = self.load_json("validation_summary.json", "validation")
            
            checks["validation_passed"] = validation_summary.get("overall_status") in ["PASS", "PARTIAL"]
            checks["data_quality_acceptable"] = validation_summary.get("quality_score", 0) >= 60
            
            if validation_summary.get("critical_issues", 0) > 0:
                self.deployment_status["warnings"].append(
                    f"Found {validation_summary['critical_issues']} critical issues"
                )
        else:
            self.deployment_status["errors"].append("Validation results not found")
            return False
        
        # Check required files
        required_files = [
            self.workspace_dir / "images" / "image_manifest.json",
            self.workspace_dir / "text" / "complete_text_content.json",
            self.workspace_dir / "tables" / "all_tables_data.json",
            self.workspace_dir / "reviews" / "all_reviews_data.json"
        ]
        
        checks["required_files_exist"] = all(f.exists() for f in required_files)
        
        # Check Node.js dependencies
        package_json = self.project_root / "package.json"
        node_modules = self.project_root / "node_modules"
        checks["dependencies_installed"] = package_json.exists() and node_modules.exists()
        
        # Check GitHub token
        github_token = os.environ.get("GITHUB_TOKEN", "")
        if not github_token:
            # Try to read from deployment script
            deploy_script = self.project_root / "scripts" / "github-deploy.sh"
            if deploy_script.exists():
                with open(deploy_script, 'r') as f:
                    content = f.read()
                    if 'GITHUB_TOKEN=' in content:
                        checks["github_token_available"] = True
            else:
                self.deployment_status["warnings"].append(
                    "GitHub token not found in environment. Manual deployment may be required."
                )
        else:
            checks["github_token_available"] = True
        
        # Store check results
        self.deployment_status["pre_deployment_checks"] = checks
        
        # Determine if we can proceed
        can_proceed = (
            checks["validation_passed"] and 
            checks["required_files_exist"] and 
            checks["dependencies_installed"]
        )
        
        if not can_proceed:
            for check, passed in checks.items():
                if not passed:
                    self.deployment_status["errors"].append(f"Check failed: {check}")
        
        return can_proceed
    
    def integrate_extracted_data(self) -> bool:
        """Integrate all extracted data into the project"""
        self.logger.info("Integrating extracted data...")
        
        try:
            # 1. Update products.json with complete data
            self.update_products_json()
            
            # 2. Copy images to project
            self.copy_images_to_project()
            
            # 3. Update review data
            self.integrate_review_data()
            
            # 4. Update comparison tables
            self.update_comparison_tables()
            
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to integrate data: {str(e)}")
            self.deployment_status["errors"].append(f"Data integration failed: {str(e)}")
            return False
    
    def update_products_json(self):
        """Update the main products.json file with extracted data"""
        self.logger.info("Updating products.json...")
        
        # Load all data sources
        text_content = self.load_json("complete_text_content.json", "text")
        tables_data = self.load_json("all_tables_data.json", "tables")
        reviews_data = self.load_json("all_reviews_data.json", "reviews")
        image_manifest = self.load_json("image_manifest.json", "images")
        
        # Create updated products list
        updated_products = []
        
        # Get unique product IDs
        all_product_ids = set()
        all_product_ids.update(text_content.get("products", {}).keys())
        
        for product_id in all_product_ids:
            # Get data from different sources
            text_data = text_content.get("products", {}).get(product_id, {})
            review_data = reviews_data.get("products", {}).get(product_id, {})
            image_data = image_manifest.get("products", {}).get(product_id, {})
            
            # Build complete product object
            product = {
                "id": product_id,
                "name": text_data.get("name", ""),
                "badge": text_data.get("badge", ""),
                "rating": review_data.get("summary", {}).get("overall_rating", 0),
                "userRatings": review_data.get("summary", {}).get("total_reviews", ""),
                "tagline": text_data.get("tagline", ""),
                "description": text_data.get("description", ""),
                "features": text_data.get("features", {}),
                "specifications": text_data.get("specifications", {}),
                "affiliateLink": "#",  # Will need to be updated
                "imageUrl": self.get_product_image_url(product_id, image_data),
                "price": text_data.get("price", ""),
                "expertReview": review_data.get("expert_review", {}),
                "reviewLinks": review_data.get("review_links", [])
            }
            
            # Add from comparison table if available
            if tables_data.get("comparison_table"):
                for row in tables_data["comparison_table"].get("data", []):
                    if self.normalize_product_name(row.get("Product Name", "")) == self.normalize_product_name(product["name"]):
                        # Add specifications from table
                        for key, value in row.items():
                            if key not in ["Product Name", "Rating", "Badge"] and value:
                                product["specifications"][key] = value
                        break
            
            updated_products.append(product)
        
        # Save updated products
        products_data = {"products": updated_products}
        output_path = self.project_root / "src" / "data" / "products.json"
        
        # Backup existing file
        if output_path.exists():
            backup_path = output_path.with_suffix('.json.backup')
            shutil.copy(output_path, backup_path)
        
        # Save new data
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(products_data, f, indent=2, ensure_ascii=False)
        
        self.logger.info(f"Updated products.json with {len(updated_products)} products")
    
    def copy_images_to_project(self):
        """Copy extracted images to project directory"""
        self.logger.info("Copying images to project...")
        
        source_dir = self.workspace_dir / "images" / "products"
        target_dir = self.project_root / "src" / "assets" / "images" / "products"
        
        # Create target directory
        target_dir.mkdir(parents=True, exist_ok=True)
        
        # Copy all product images
        copied_count = 0
        for product_dir in source_dir.iterdir():
            if product_dir.is_dir():
                # Copy main image
                main_image = product_dir / "main.jpg"
                if main_image.exists():
                    target_file = target_dir / f"{product_dir.name}.jpg"
                    shutil.copy2(main_image, target_file)
                    copied_count += 1
                else:
                    # Try first image
                    images = list(product_dir.glob("*.jpg")) + list(product_dir.glob("*.png"))
                    if images:
                        target_file = target_dir / f"{product_dir.name}.jpg"
                        shutil.copy2(images[0], target_file)
                        copied_count += 1
        
        self.logger.info(f"Copied {copied_count} product images")
    
    def integrate_review_data(self):
        """Integrate review data into the project"""
        self.logger.info("Integrating review data...")
        
        # Review data is already integrated in update_products_json
        # This method can be used for additional review processing if needed
        
        # Create review summary for the page
        reviews_data = self.load_json("all_reviews_data.json", "reviews")
        review_summary = self.load_json("review_summary.json", "reviews")
        
        # Save to project data directory
        output_path = self.project_root / "src" / "data" / "review_summary.json"
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(review_summary, f, indent=2, ensure_ascii=False)
    
    def update_comparison_tables(self):
        """Update comparison table data"""
        self.logger.info("Updating comparison tables...")
        
        tables_data = self.load_json("all_tables_data.json", "tables")
        
        if tables_data.get("comparison_table"):
            # Save comparison table for use in build
            output_path = self.project_root / "src" / "data" / "comparison_table.json"
            
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(tables_data["comparison_table"], f, indent=2, ensure_ascii=False)
    
    def build_site(self) -> bool:
        """Build the site using npm"""
        self.logger.info("Building site...")
        
        try:
            # Change to project directory
            os.chdir(self.project_root)
            
            # Run build command
            result = subprocess.run(
                ["npm", "run", "build"],
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                self.logger.info("Build completed successfully")
                self.deployment_status["build_status"] = "SUCCESS"
                return True
            else:
                self.logger.error(f"Build failed: {result.stderr}")
                self.deployment_status["build_status"] = "FAILED"
                self.deployment_status["errors"].append(f"Build error: {result.stderr}")
                return False
                
        except Exception as e:
            self.logger.error(f"Build failed: {str(e)}")
            self.deployment_status["build_status"] = "FAILED"
            self.deployment_status["errors"].append(f"Build exception: {str(e)}")
            return False
    
    def validate_build(self) -> bool:
        """Validate the built site"""
        self.logger.info("Validating build...")
        
        dist_dir = self.project_root / "dist"
        
        # Check if dist directory exists
        if not dist_dir.exists():
            self.deployment_status["errors"].append("Dist directory not found after build")
            return False
        
        # Check for essential files
        essential_files = [
            "index.html",
            "best-robotic-pool-cleaners/index.html",
            "assets/css/style.css"
        ]
        
        missing_files = []
        for file_path in essential_files:
            if not (dist_dir / file_path).exists():
                missing_files.append(file_path)
        
        if missing_files:
            self.deployment_status["errors"].append(f"Missing files in build: {missing_files}")
            return False
        
        # Check content requirements
        pool_cleaners_page = dist_dir / "best-robotic-pool-cleaners" / "index.html"
        if pool_cleaners_page.exists():
            with open(pool_cleaners_page, 'r', encoding='utf-8') as f:
                content = f.read()
                
                # Check for required elements
                checks = {
                    "red_cta_buttons": "#ef4444" in content or "cta-primary" in content,
                    "check_price_text": "Check Price" in content,
                    "product_images": "src=\"assets/images/products/" in content or "src=\"/assets/images/products/" in content,
                    "badges": "badge" in content.lower(),
                    "reviews": "review" in content.lower()
                }
                
                for check, passed in checks.items():
                    if not passed:
                        self.deployment_status["warnings"].append(f"Content check failed: {check}")
        
        self.logger.info("Build validation completed")
        return True
    
    def deploy_to_github(self) -> bool:
        """Deploy to GitHub Pages"""
        self.logger.info("Deploying to GitHub...")
        
        # Check if deployment script exists
        deploy_script = self.project_root / "scripts" / "github-deploy.sh"
        
        if not deploy_script.exists():
            self.deployment_status["errors"].append("Deployment script not found")
            return False
        
        try:
            # Make script executable
            os.chmod(deploy_script, 0o755)
            
            # Run deployment script
            result = subprocess.run(
                [str(deploy_script)],
                capture_output=True,
                text=True,
                cwd=str(self.project_root)
            )
            
            if result.returncode == 0:
                self.logger.info("Deployment completed successfully")
                self.deployment_status["deployment_output"] = result.stdout
                return True
            else:
                self.logger.error(f"Deployment failed: {result.stderr}")
                self.deployment_status["errors"].append(f"Deployment error: {result.stderr}")
                
                # Check if it's a token issue
                if "authentication" in result.stderr.lower() or "token" in result.stderr.lower():
                    self.deployment_status["errors"].append(
                        "GitHub authentication failed. Please check your GitHub token."
                    )
                
                return False
                
        except Exception as e:
            self.logger.error(f"Deployment failed: {str(e)}")
            self.deployment_status["errors"].append(f"Deployment exception: {str(e)}")
            return False
    
    def get_product_image_url(self, product_id: str, image_data: Dict) -> str:
        """Get the image URL for a product"""
        if image_data and image_data.get("images"):
            # Look for main image
            for img in image_data["images"]:
                if img.get("filename") == "main.jpg":
                    return f"/assets/images/products/{product_id}.jpg"
            
            # Use first image if no main
            if image_data["images"]:
                return f"/assets/images/products/{product_id}.jpg"
        
        # Default placeholder
        return "/assets/images/products/placeholder.svg"
    
    def normalize_product_name(self, name: str) -> str:
        """Normalize product name for comparison"""
        return name.lower().strip().replace(" ", "").replace("-", "")
    
    def save_deployment_report(self):
        """Save deployment report"""
        # Save full report
        self.save_json(
            self.deployment_status,
            f"deployment_report_{self.timestamp}.json",
            "validation"
        )
        
        # Create deployment summary
        summary = {
            "deployment_date": self.timestamp,
            "status": self.deployment_status["deployment_status"],
            "build_status": self.deployment_status["build_status"],
            "errors_count": len(self.deployment_status["errors"]),
            "warnings_count": len(self.deployment_status["warnings"]),
            "url": self.deployment_status["deployed_url"]
        }
        
        if self.deployment_status["deployment_status"] == "SUCCESS":
            summary["message"] = "Deployment successful! Site will be live in ~5 minutes."
        else:
            summary["message"] = "Deployment failed. Check deployment report for details."
        
        self.save_json(summary, "deployment_summary.json", "validation")
        
        # Log final status
        self.logger.info(f"\n{'='*60}")
        self.logger.info(f"Deployment Status: {self.deployment_status['deployment_status']}")
        self.logger.info(f"Build Status: {self.deployment_status['build_status']}")
        self.logger.info(f"Errors: {len(self.deployment_status['errors'])}")
        self.logger.info(f"Warnings: {len(self.deployment_status['warnings'])}")
        
        if self.deployment_status["deployment_status"] == "SUCCESS":
            self.logger.info(f"\n✅ Site deployed successfully!")
            self.logger.info(f"🌐 URL: {self.deployment_status['deployed_url']}")
            self.logger.info(f"⏱️  Allow ~5 minutes for changes to appear")
        else:
            self.logger.error(f"\n❌ Deployment failed!")
            for error in self.deployment_status["errors"]:
                self.logger.error(f"  - {error}")
        
        self.logger.info(f"{'='*60}\n")
    
    def validate_results(self) -> Dict[str, Any]:
        """Return deployment results - required by base class"""
        return self.deployment_status


if __name__ == "__main__":
    # Test the deployment agent
    agent = DeploymentAgent()
    
    # Run deployment
    results = agent.run("deploy")
    
    print(json.dumps(results, indent=2))