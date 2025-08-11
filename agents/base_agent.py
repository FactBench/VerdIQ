#!/usr/bin/env python3
"""
Base Agent Class for FactBench Data Extraction System
Provides common functionality for all extraction agents
"""

import json
import logging
import os
from datetime import datetime
from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional
import requests
from pathlib import Path


class BaseAgent(ABC):
    """Base class for all extraction agents"""
    
    def __init__(self, name: str, workspace_dir: str = "extraction-workspace"):
        self.name = name
        self.workspace_dir = Path(workspace_dir)
        self.log_dir = self.workspace_dir / "logs"
        self.timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Create directories
        self.workspace_dir.mkdir(exist_ok=True)
        self.log_dir.mkdir(exist_ok=True)
        
        # Setup logging
        self.setup_logging()
        
        # Track extraction metrics
        self.metrics = {
            "started_at": datetime.now().isoformat(),
            "items_processed": 0,
            "items_succeeded": 0,
            "items_failed": 0,
            "errors": []
        }
    
    def setup_logging(self):
        """Configure logging for the agent"""
        log_file = self.log_dir / f"{self.name}_{self.timestamp}.log"
        
        # Create formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        # File handler
        file_handler = logging.FileHandler(log_file)
        file_handler.setFormatter(formatter)
        
        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        
        # Setup logger
        self.logger = logging.getLogger(self.name)
        self.logger.setLevel(logging.INFO)
        self.logger.addHandler(file_handler)
        self.logger.addHandler(console_handler)
    
    def save_json(self, data: Dict, filename: str, subdir: Optional[str] = None):
        """Save data as JSON file"""
        if subdir:
            output_dir = self.workspace_dir / subdir
            output_dir.mkdir(exist_ok=True)
        else:
            output_dir = self.workspace_dir
        
        output_path = output_dir / filename
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        self.logger.info(f"Saved JSON to {output_path}")
        return output_path
    
    def load_json(self, filename: str, subdir: Optional[str] = None) -> Dict:
        """Load data from JSON file"""
        if subdir:
            input_path = self.workspace_dir / subdir / filename
        else:
            input_path = self.workspace_dir / filename
        
        if not input_path.exists():
            self.logger.warning(f"File not found: {input_path}")
            return {}
        
        with open(input_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def download_file(self, url: str, output_path: Path, max_retries: int = 3) -> bool:
        """Download file with retry logic"""
        for attempt in range(max_retries):
            try:
                self.logger.info(f"Downloading {url} (attempt {attempt + 1}/{max_retries})")
                
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
                
                response = requests.get(url, headers=headers, timeout=30, stream=True)
                response.raise_for_status()
                
                # Ensure directory exists
                output_path.parent.mkdir(parents=True, exist_ok=True)
                
                # Write file
                with open(output_path, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)
                
                self.logger.info(f"Successfully downloaded to {output_path}")
                return True
                
            except Exception as e:
                self.logger.error(f"Download failed: {str(e)}")
                if attempt == max_retries - 1:
                    self.metrics["errors"].append({
                        "url": url,
                        "error": str(e),
                        "timestamp": datetime.now().isoformat()
                    })
                    return False
        
        return False
    
    def update_metrics(self, success: bool = True):
        """Update extraction metrics"""
        self.metrics["items_processed"] += 1
        if success:
            self.metrics["items_succeeded"] += 1
        else:
            self.metrics["items_failed"] += 1
    
    def save_metrics(self):
        """Save extraction metrics"""
        self.metrics["completed_at"] = datetime.now().isoformat()
        self.metrics["duration_seconds"] = (
            datetime.now() - datetime.fromisoformat(self.metrics["started_at"])
        ).total_seconds()
        
        metrics_file = f"{self.name}_metrics_{self.timestamp}.json"
        self.save_json(self.metrics, metrics_file, "validation")
        
        # Log summary
        self.logger.info(f"\n{'='*50}")
        self.logger.info(f"Extraction Complete: {self.name}")
        self.logger.info(f"Total items: {self.metrics['items_processed']}")
        self.logger.info(f"Succeeded: {self.metrics['items_succeeded']}")
        self.logger.info(f"Failed: {self.metrics['items_failed']}")
        self.logger.info(f"Duration: {self.metrics['duration_seconds']:.2f} seconds")
        self.logger.info(f"{'='*50}\n")
    
    @abstractmethod
    def extract(self, source_url: str) -> Dict[str, Any]:
        """Main extraction method - must be implemented by subclasses"""
        pass
    
    @abstractmethod
    def validate_results(self) -> Dict[str, Any]:
        """Validate extraction results - must be implemented by subclasses"""
        pass
    
    def run(self, source_url: str):
        """Run the complete extraction process"""
        try:
            self.logger.info(f"Starting {self.name} extraction from {source_url}")
            
            # Perform extraction
            results = self.extract(source_url)
            
            # Validate results
            validation = self.validate_results()
            
            # Save metrics
            self.save_metrics()
            
            return {
                "success": True,
                "results": results,
                "validation": validation,
                "metrics": self.metrics
            }
            
        except Exception as e:
            self.logger.error(f"Fatal error in {self.name}: {str(e)}", exc_info=True)
            self.save_metrics()
            return {
                "success": False,
                "error": str(e),
                "metrics": self.metrics
            }