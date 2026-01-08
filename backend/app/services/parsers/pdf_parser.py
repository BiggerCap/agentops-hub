"""
PDF Parser - Extract text from PDF files
"""

from PyPDF2 import PdfReader
from typing import Optional


def extract_text_from_pdf(file_path: str) -> str:
    """
    Extract text content from a PDF file
    
    Args:
        file_path: Absolute path to the PDF file
        
    Returns:
        Extracted text as a string
        
    Raises:
        Exception: If PDF reading fails
    """
    try:
        reader = PdfReader(file_path)
        text_parts = []
        
        for page_num, page in enumerate(reader.pages, 1):
            try:
                text = page.extract_text()
                if text.strip():
                    text_parts.append(f"--- Page {page_num} ---\n{text}")
            except Exception as e:
                text_parts.append(f"--- Page {page_num} (extraction failed: {e}) ---\n")
        
        full_text = "\n\n".join(text_parts)
        
        if not full_text.strip():
            raise Exception("No text could be extracted from PDF")
        
        return full_text
        
    except Exception as e:
        raise Exception(f"Failed to extract text from PDF: {str(e)}")
