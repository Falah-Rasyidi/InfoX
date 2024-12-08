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

    rake = Rake()
    keywords = rake.run(text)
    print(keywords)

@app.post("/chat")
async def chat(request: RequestModel):
    prompt = request.prompt
    results = DDGS().chat(prompt, model='llama-3.1-70b')
    return {"message": results}
