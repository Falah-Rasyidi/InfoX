from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from duckduckgo_search import DDGS
from python.rake.rake import *
from newspaper import Article

import requests
import json

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
    articles: list = []

    # Fetch articles from The Guardian
    endpoint = "https://content.guardianapis.com/search?q=football&api-key=f76306d2-0a71-41c7-9271-1d2a405b8b61"
    response = requests.get(endpoint)

    if response.status_code == 200:
        data = response.json()

        # Only retrieve the first three articles
        for i in range(0, 3):
            article = { 'url': "", 'title': "", 'pubdate': "", 'text': "" }

            # Download and parse article
            article_parsed = Article(data['response']['results'][i]['webUrl'], language="en")
            article_parsed.download()
            article_parsed.parse()

            # Store article information in a dictionary
            article.update({
                'url': data['response']['results'][i]['webUrl'],
                'title': article_parsed.title,
                'pubdate': data['response']['results'][i]['webPublicationDate'],
                'text': article_parsed.text
            })

            # Push to articles list
            articles.append(article)
    
    # Fetch articles from News API
    endpoint = "https://newsapi.org/v2/everything?q=tesla&from=2024-11-09&sortBy=publishedAt&apiKey=e6782b4eb6ed4ec6a943526bcc54b8e6"
    response = requests.get(endpoint)

    if response.status_code == 200:
        data = response.json()

        for i in range(0, 3):
            article = { 'url': "", 'title': "", 'pubdate': "", 'text': "" }

            article_parsed = Article(data['articles'][i]['url'], language="en")
            article_parsed.download()
            article_parsed.parse()

            article.update({
                'url': data['articles'][i]['url'],
                'title': article_parsed.title,
                'pubdate': data['articles'][i]['publishedAt'],
                'text': article_parsed.text
            })

            articles.append(article)
    
    # Fetch articles from News Data
    endpoint = "https://newsdata.io/api/1/latest?apikey=pub_61660406963f4c81935fba712030890a7e333&q=football&country=au,us&language=en"
    response = requests.get(endpoint)

    if response.status_code == 200:
        data = response.json()

        for i in range(0, 3):
            article = { 'url': "", 'title': "", 'pubdate': "", 'text': "" }

            article_parsed = Article(data['results'][i]['link'], language="en")
            article_parsed.download()
            article_parsed.parse()

            article.update({
                'url': data['results'][i]['link'],
                'title': article_parsed.title,
                'pubdate': data['results'][i]['pubDate'],
                'text': article_parsed.text
            })

            articles.append(article)

    return articles

@app.post("/chat")
async def chat(request: RequestModel):
    prompt = request.prompt
    try:
        results = DDGS().chat(prompt, model='llama-3.1-70b')
        return {"message": results}
    except Exception as e:
        print(f"Error processing request: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")