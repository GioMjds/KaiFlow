import os
from openai import OpenAI

client = OpenAI(
    base_url="https://router.huggingface.co/v1",
    api_key=os.environ["HF_TOKEN"],
)

def generate_review(code: str, prompt: str = None) -> str:
    """
    Generate a code review using the DeepSeek model via OpenAI client.
    """
    if prompt is None:
        prompt = f"Review the following code for best practices, bugs, and improvements:\n\n{code}\n\nProvide a detailed review:"
    
    try:
        completion = client.chat.completions.create(
            model="deepseek-ai/DeepSeek-R1:novita",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"Error generating review: {str(e)}"