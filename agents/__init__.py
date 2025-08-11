# FactBench Multi-Agent System
"""
Multi-agent system for comprehensive data extraction, validation, and deployment
"""

from .base_agent import BaseAgent
from .image_extractor_agent import ImageExtractorAgent
from .text_extractor_agent import TextExtractorAgent
from .table_extractor_agent import TableExtractorAgent
from .review_extractor_agent import ReviewExtractorAgent
from .validation_agent import ValidationAgent
from .deployment_agent import DeploymentAgent

__all__ = [
    'BaseAgent',
    'ImageExtractorAgent',
    'TextExtractorAgent',
    'TableExtractorAgent',
    'ReviewExtractorAgent',
    'ValidationAgent',
    'DeploymentAgent'
]

__version__ = '1.0.0'