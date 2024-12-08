from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from duckduckgo_search import DDGS

app = FastAPI()

# Create a request model for incoming prompts
class RequestModel(BaseModel):
    prompt: str

@app.post("/chat")
async def chat(request: RequestModel):
    prompt = request.prompt
    try:
        results = DDGS().chat(prompt, model='llama-3.1-70b')
        return {"message": results}
    except Exception as e:
        print(f"Error processing request: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")