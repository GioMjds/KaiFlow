from huggingface_hub import HfApi, InferenceClient
import os

api = HfApi()

# Check authentication
try:
    user = api.whoami(token=os.getenv("HF_TOKEN"))
    print(f"Authenticated as: {user['name']}")
except Exception as e:
    print(f"Authentication failed: {e}. Proceeding without verification.")

# Initialize InferenceClient for OpenAI GPT-OSS-20B with Groq provider
MODEL_ID = "openai/gpt-oss-20b"
client = InferenceClient(model=MODEL_ID, token=os.getenv("HF_TOKEN"), provider="groq")

def generate_review(code: str, prompt: str = None) -> str:
    """
    Generate a code review using the DeepSeek model.
    """
    if prompt is None:
        prompt = f"Review the following code for best practices, bugs, and improvements:\n\n{code}\n\nProvide a detailed review:"
    
    try:
        response = client.text_generation(prompt, max_new_tokens=500)
        return response
    except Exception as e:
        return f"Error generating review: {str(e)}"