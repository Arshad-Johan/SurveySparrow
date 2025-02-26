from transformers import pipeline

# Use the Bart-Large-CNN model
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

def summarize_text(text: str, max_length=80, min_length=10) -> str:
    if not text or len(text.split()) < 10:
        return text

    result = summarizer(text, max_length=max_length, min_length=min_length, do_sample=False)
    return result[0]["summary_text"]
