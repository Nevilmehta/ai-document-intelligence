from app.utils.pdf_parser import extract_text_from_pdf
from app.utils.text_cleaner import clean_extracted_text

def extract_and_clean_text_from_pdf(file_path: str):
    extracted_text = extract_text_from_pdf(file_path)
    cleaned_text = clean_extracted_text(extracted_text)
    return extracted_text, cleaned_text