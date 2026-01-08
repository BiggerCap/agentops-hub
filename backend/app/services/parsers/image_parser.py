"""
Image Parser - Extract text from images using OCR
"""

import pytesseract
from PIL import Image


def extract_text_from_image(file_path: str) -> str:
    """
    Extract text from an image file using Tesseract OCR
    
    Args:
        file_path: Absolute path to the image file
        
    Returns:
        Extracted text as a string
        
    Raises:
        Exception: If OCR fails
    """
    try:
        # Open image
        image = Image.open(file_path)
        
        # Perform OCR
        text = pytesseract.image_to_string(image)
        
        if not text.strip():
            raise Exception("No text could be extracted from image (image may not contain text)")
        
        return text.strip()
        
    except pytesseract.TesseractNotFoundError:
        raise Exception(
            "Tesseract OCR is not installed. "
            "Please install Tesseract: https://github.com/tesseract-ocr/tesseract"
        )
    except Exception as e:
        raise Exception(f"Failed to extract text from image: {str(e)}")
