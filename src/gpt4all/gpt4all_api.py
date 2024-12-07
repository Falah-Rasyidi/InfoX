from fastapi import FastAPI
from pydantic import BaseModel
from gpt4all import GPT4All

# Initialize FastAPI app
app = FastAPI()

# Load the GPT-4All model
model = GPT4All("")

# Create a request model for incoming prompts
class RequestModel(BaseModel):
    prompt: str

@app.post("/chat")
async def chat(request: RequestModel):
    prompt = request.prompt
    response = model.chat(prompt)
    return {"message": response}
