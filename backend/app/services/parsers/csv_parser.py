"""
CSV Parser - Extract data from CSV files
"""

import pandas as pd


def extract_text_from_csv(file_path: str) -> str:
    """
    Extract data from a CSV file and convert to text
    
    Args:
        file_path: Absolute path to the CSV file
        
    Returns:
        Extracted data as formatted text
        
    Raises:
        Exception: If CSV reading fails
    """
    try:
        # Read CSV file
        df = pd.read_csv(file_path)
        
        if df.empty:
            raise Exception("CSV file is empty")
        
        # Convert dataframe to formatted string
        text = df.to_string(index=False)
        
        # Add metadata
        full_text = f"CSV File Data ({len(df)} rows, {len(df.columns)} columns)\n\n{text}"
        
        return full_text
        
    except Exception as e:
        raise Exception(f"Failed to extract data from CSV: {str(e)}")
