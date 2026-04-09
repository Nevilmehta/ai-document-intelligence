import fitz #pymupdf

def extract_text_from_pdf(file_path: str) -> str:
    text_parts: list[str] = []

    with fitz.open(file_path) as doc:
        for page in doc:
            page_text = page.get_text("text", sort=True)
            if page_text:
                text_parts.append(page_text)

    return "\n".join(text_parts).strip()