from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from duckduckgo_search import DDGS
from python.rake.rake import *

app = FastAPI()

# Create a request model for incoming prompts
class RequestModel(BaseModel):
    prompt: str

@app.post("/extract")
async def extract(request: RequestModel):
    text = request.prompt

    try:
        rake = Rake()
        keywords = rake.run(text)
        print(f"KEYWORDS ARE: {keywords}\n")
        
        return {"message": keywords[0][0]}
    except Exception as e:
        print(f"Error processing request: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")



@app.post("/chat")
async def chat(request: RequestModel):
    prompt = request.prompt
    try:
        results = DDGS().chat(prompt, model='llama-3.1-70b')
        return {"message": results}
    except Exception as e:
        print(f"Error processing request: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")