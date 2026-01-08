"""
Excel Parser - Extract data from Excel files
"""

import pandas as pd


def extract_text_from_excel(file_path: str) -> str:
    """
    Extract data from an Excel file and convert to text
    
    Args:
        file_path: Absolute path to the Excel file
        
    Returns:
        Extracted data as formatted text
        
    Raises:
        Exception: If Excel reading fails
    """
    try:
        # Read all sheets
        excel_file = pd.ExcelFile(file_path)
        text_parts = []
        
        for sheet_name in excel_file.sheet_names:
            df = pd.read_excel(file_path, sheet_name=sheet_name)
            
            # Skip empty sheets
            if df.empty:
                continue
            
            # Convert dataframe to formatted string
            sheet_text = f"=== Sheet: {sheet_name} ===\n\n"
            sheet_text += df.to_string(index=False)
            text_parts.append(sheet_text)
        
        full_text = "\n\n".join(text_parts)
        
        if not full_text.strip():
            raise Exception("No data could be extracted from Excel file")
        
        return full_text
        
    except Exception as e:
        raise Exception(f"Failed to extract data from Excel: {str(e)}")
