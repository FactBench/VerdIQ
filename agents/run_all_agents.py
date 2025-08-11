#!/usr/bin/env python3
"""
Main orchestrator script to run all FactBench extraction agents
Coordinates the complete extraction, validation, and deployment pipeline
"""

import sys
import asyncio
import json
from pathlib import Path
from datetime import datetime
import argparse

# Add agents directory to path
sys.path.append(str(Path(__file__).parent))

from image_extractor_agent import ImageExtractorAgent
from text_extractor_agent import TextExtractorAgent
from table_extractor_agent import TableExtractorAgent
from review_extractor_agent import ReviewExtractorAgent
from validation_agent import ValidationAgent
from deployment_agent import DeploymentAgent


class AgentOrchestrator:
    """Orchestrates the execution of all agents"""
    
    def __init__(self, source_url: str, skip_deployment: bool = False):
        self.source_url = source_url
        self.skip_deployment = skip_deployment
        self.results = {
            "orchestration_date": datetime.now().isoformat(),
            "source_url": source_url,
            "agents": {},
            "overall_status": "RUNNING"
        }
        self.workspace_dir = Path("extraction-workspace")
    
    async def run_extraction_agents(self):
        """Run all extraction agents in parallel for efficiency"""
        print("\n" + "="*60)
        print("🚀 Starting FactBench Multi-Agent Extraction")
        print("="*60 + "\n")
        
        # Create agent instances
        agents = {
            "images": ImageExtractorAgent(),
            "text": TextExtractorAgent(),
            "tables": TableExtractorAgent(),
            "reviews": ReviewExtractorAgent()
        }
        
        # Run agents in parallel
        tasks = []
        for name, agent in agents.items():
            print(f"▶️  Starting {name} extraction...")
            task = asyncio.create_task(self.run_agent_async(name, agent))
            tasks.append(task)
        
        # Wait for all to complete
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results
        for i, (name, agent) in enumerate(agents.items()):
            if isinstance(results[i], Exception):
                print(f"❌ {name} extraction failed: {results[i]}")
                self.results["agents"][name] = {
                    "status": "FAILED",
                    "error": str(results[i])
                }
            else:
                self.results["agents"][name] = results[i]
                status_icon = "✅" if results[i].get("success") else "❌"
                print(f"{status_icon} {name} extraction completed")
    
    async def run_agent_async(self, name: str, agent):
        """Run a single agent asynchronously"""
        return agent.run(self.source_url)
    
    def run_validation(self):
        """Run validation agent"""
        print("\n▶️  Starting validation...")
        
        try:
            agent = ValidationAgent()
            result = agent.run("validation")  # Source URL not used
            
            self.results["agents"]["validation"] = result
            
            status = result.get("overall_status", "FAIL")
            score = result.get("data_quality_score", 0)
            
            print(f"\n📊 Validation Results:")
            print(f"   Status: {status}")
            print(f"   Quality Score: {score}/100")
            
            if status == "FAIL":
                print("\n⚠️  Critical issues found:")
                for item in result.get("missing_items", {}).get("critical", [])[:5]:
                    print(f"   - {item.get('issue', 'Unknown issue')}")
            
            return status != "FAIL"
            
        except Exception as e:
            print(f"❌ Validation failed: {e}")
            self.results["agents"]["validation"] = {
                "status": "FAILED",
                "error": str(e)
            }
            return False
    
    def run_deployment(self):
        """Run deployment agent"""
        if self.skip_deployment:
            print("\n⏭️  Skipping deployment (--skip-deployment flag set)")
            return
        
        print("\n▶️  Starting deployment...")
        
        try:
            agent = DeploymentAgent()
            result = agent.run("deploy")  # Source URL not used
            
            self.results["agents"]["deployment"] = result
            
            status = result.get("deployment_status", "FAILED")
            
            if status == "SUCCESS":
                print("\n✅ Deployment successful!")
                print(f"🌐 Site will be live at: {result.get('deployed_url')}")
                print("⏱️  Allow ~5 minutes for changes to appear")
            else:
                print("\n❌ Deployment failed!")
                for error in result.get("errors", []):
                    print(f"   - {error}")
                    
        except Exception as e:
            print(f"❌ Deployment failed: {e}")
            self.results["agents"]["deployment"] = {
                "status": "FAILED",
                "error": str(e)
            }
    
    def save_orchestration_report(self):
        """Save complete orchestration report"""
        # Determine overall status
        failed_agents = [
            name for name, result in self.results["agents"].items()
            if not result.get("success", False) and result.get("status") != "SUCCESS"
        ]
        
        if failed_agents:
            self.results["overall_status"] = "FAILED"
            self.results["failed_agents"] = failed_agents
        else:
            self.results["overall_status"] = "SUCCESS"
        
        # Save report
        report_path = self.workspace_dir / "orchestration_report.json"
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, indent=2)
        
        print(f"\n📄 Orchestration report saved to: {report_path}")
    
    def print_summary(self):
        """Print execution summary"""
        print("\n" + "="*60)
        print("📊 EXECUTION SUMMARY")
        print("="*60)
        
        for agent_name, result in self.results["agents"].items():
            if isinstance(result, dict):
                if result.get("success") or result.get("status") == "SUCCESS":
                    status = "✅ SUCCESS"
                elif result.get("overall_status") == "PASS":
                    status = "✅ PASS"
                elif result.get("overall_status") == "PARTIAL":
                    status = "⚠️  PARTIAL"
                else:
                    status = "❌ FAILED"
                
                print(f"{agent_name.upper():15} {status}")
                
                # Print key metrics
                if agent_name == "images" and result.get("results"):
                    total_images = result["results"].get("total_images", 0)
                    print(f"{'':15} └─ Total images: {total_images}")
                
                elif agent_name == "text" and result.get("results"):
                    total_products = len(result["results"].get("products", {}))
                    print(f"{'':15} └─ Products extracted: {total_products}")
                
                elif agent_name == "tables" and result.get("results"):
                    total_tables = len(result["results"].get("tables", []))
                    print(f"{'':15} └─ Tables found: {total_tables}")
                
                elif agent_name == "reviews" and result.get("results"):
                    total_reviews = result["results"].get("total_reviews", 0)
                    print(f"{'':15} └─ Reviews extracted: {total_reviews}")
                
                elif agent_name == "validation":
                    score = result.get("data_quality_score", 0)
                    print(f"{'':15} └─ Quality score: {score}/100")
        
        print("="*60)
        print(f"Overall Status: {self.results['overall_status']}")
        print("="*60 + "\n")
    
    async def run(self):
        """Run the complete orchestration pipeline"""
        try:
            # Phase 1: Extraction
            await self.run_extraction_agents()
            
            # Phase 2: Validation
            print("\n" + "-"*40)
            print("📋 Phase 2: Validation")
            print("-"*40)
            
            validation_passed = self.run_validation()
            
            # Phase 3: Deployment (if validation passed)
            if validation_passed and not self.skip_deployment:
                print("\n" + "-"*40)
                print("🚀 Phase 3: Deployment")
                print("-"*40)
                
                self.run_deployment()
            elif not validation_passed:
                print("\n⚠️  Skipping deployment due to validation failures")
            
            # Save report and print summary
            self.save_orchestration_report()
            self.print_summary()
            
        except Exception as e:
            print(f"\n❌ Fatal error in orchestration: {e}")
            self.results["overall_status"] = "FAILED"
            self.results["fatal_error"] = str(e)
            self.save_orchestration_report()


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description="Run FactBench multi-agent extraction and deployment pipeline"
    )
    parser.add_argument(
        "url",
        help="Source URL to extract data from (e.g., https://zoopy.com/best-robotic-pool-cleaners)"
    )
    parser.add_argument(
        "--skip-deployment",
        action="store_true",
        help="Skip deployment phase (only extract and validate)"
    )
    
    args = parser.parse_args()
    
    # Create orchestrator and run
    orchestrator = AgentOrchestrator(
        source_url=args.url,
        skip_deployment=args.skip_deployment
    )
    
    # Run async orchestration
    asyncio.run(orchestrator.run())


if __name__ == "__main__":
    # Default URL for testing
    if len(sys.argv) == 1:
        print("Usage: python run_all_agents.py <source_url> [--skip-deployment]")
        print("\nExample:")
        print("  python run_all_agents.py https://zoopy.com/best-robotic-pool-cleaners")
        print("\nUsing default URL for testing...")
        sys.argv.append("https://zoopy.com/best-robotic-pool-cleaners")
    
    main()