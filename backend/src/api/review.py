from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from ..services.huggingface import generate_review
from ..services.rag import store_code_embedding, retrieve_similar_code
import uuid
from pygments.lexers import guess_lexer

router = APIRouter()

@router.post("/review/text")
async def review_code_text(code: str = Form(...)):
    """
    Review code provided as text.
    """
    if not code.strip():
        raise HTTPException(status_code=400, detail="Code cannot be empty")
    
    # Generate unique ID
    code_id = str(uuid.uuid4())
    
    # Store in Pinecone for future retrieval
    store_code_embedding(code_id, code)
    
    # Retrieve similar code for context (optional)
    similar = retrieve_similar_code(code, top_k=3)
    context = "\n".join([match['metadata']['code'] for match in similar['matches'] if 'metadata' in match and 'code' in match['metadata']])
    
    # Generate review
    prompt = f"Review the following code. Similar code examples:\n{context}\n\nCode to review:\n{code}\n\nProvide a detailed review:"
    review = generate_review(code, prompt)
    
    return JSONResponse(content={"review": review, "code_id": code_id})

@router.post("/review/file")
async def review_code_file(file: UploadFile = File(...)):
    """
    Review code from uploaded file.
    """
    supported_extensions = [
        '.py', '.js', '.tsx', '.ts', '.tsx', '.java', '.kt', '.cpp', '.c', '.csharp',
        '.go', '.rs', '.php', '.rb', '.vue', '.swift', '.m', '.scala', '.sh', '.r'
    ]
    
    supported_languages = [
        'python', 'javascript', 'typescript', 'java', 'kotlin', 'cpp', 'c', 'csharp',
        'go', 'rust', 'php', 'ruby', 'vue', 'swift', 'objective-c', 'scala', 'shell', 'r'
    ]
    
    supported_frameworks = [
        'react', 'angular', 'vue', 'django', 'flask', 'spring', 'laravel', 'rails', 'express',
        'nextjs', 'nestjs', 'svelte', 'flutter', 'swiftui', 'kivy', 'react-native', 'ionic',
        'xamarin', 'symfony', 'cakephp', 'codeigniter', 'laravel', 'phoenix',
    ]
    
    if not any(file.filename.endswith(ext) for ext in supported_extensions):
        raise HTTPException(status_code=400, detail="Unsupported file type")
    
    # Read file content
    content = await file.read()
    code = content.decode('utf-8')
    
    # Detect language using Pygments
    try:
        lexer = guess_lexer(code)
        detected_language = lexer.name.lower()
    except:
        detected_language = None
    
    # Check if detected language is supported
    if detected_language and detected_language not in [lang.lower() for lang in supported_languages]:
        raise HTTPException(status_code=400, detail=f"Unsupported language detected: {detected_language}")
    
    # Check for supported frameworks (simple keyword match)
    detected_frameworks = [fw for fw in supported_frameworks if fw.lower() in code.lower()]
    
    # Same as text review
    code_id = str(uuid.uuid4())
    store_code_embedding(code_id, code)
    similar = retrieve_similar_code(code, top_k=3)
    context = "\n".join([match['metadata']['code'] for match in similar['matches'] if 'metadata' in match and 'code' in match['metadata']])
    prompt = f"Review the following code. Similar code examples:\n{context}\n\nCode to review:\n{code}\n\nProvide a detailed review:"
    review = generate_review(code, prompt)
    
    return JSONResponse(content={"review": review, "code_id": code_id, "filename": file.filename, "detected_language": detected_language, "detected_frameworks": detected_frameworks})
