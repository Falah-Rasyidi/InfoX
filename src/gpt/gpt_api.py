from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from duckduckgo_search import DDGS
from python.rake.rake import *
from newspaper import Article

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



@app.post("/retrieve")
async def retrieve(request: RequestModel):
    # Fetch articles from The Guardian
    url = "https://www.thescottishsun.co.uk/sport/13976409/john-higgins-snooker-soap-dallas-specialist-subject-mastermind/"

    article = Article(url, language="en")
    article.download()
    article.parse()

    print("ARTICLE TEXT")
    print(f"==={article.text}===")

    return {"message": article.text}

@app.post("/chat")
async def chat(request: RequestModel):
    prompt = request.prompt
    try:
        results = DDGS().chat(prompt, model='llama-3.1-70b')
        return {"message": results}
    except Exception as e:
        print(f"Error processing request: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")