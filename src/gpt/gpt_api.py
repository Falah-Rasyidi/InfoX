from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from duckduckgo_search import DDGS
from newspaper import Article
from datetime import datetime

import requests

app = FastAPI()

# Create a request model for incoming prompts
class RequestModel(BaseModel):
    prompt: str

def transform_date(date_str: str):
    """
    Transforms a date string into the format: '08 December, 2024'
    Accepts formats: '2024-12-08 22:47:16' or '2024-12-08T09:33:00Z'
    """
    try:
        # Normalize input: remove 'T' and 'Z' if present
        normalized_date = date_str.replace("T", " ").replace("Z", "")
        
        # Parse the date string into a datetime object
        date_obj = datetime.strptime(normalized_date, "%Y-%m-%d %H:%M:%S")
        
        # Format the date into the desired format
        formatted_date = date_obj.strftime("%d %B, %Y")
        
        return formatted_date
    except ValueError as e:
        return f"Invalid date format: {e}"

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
    prompt = request.prompt
    articles: list = []

    # Fetch articles from The Guardian
    endpoint = f"https://content.guardianapis.com/search?q={prompt}&api-key=f76306d2-0a71-41c7-9271-1d2a405b8b61"
    response = requests.get(endpoint)
        
    if response.status_code == 200:
        data = response.json()

        # Only retrieve the first three articles
        for i in range(0, 3):
            article = { 'url': "", 'title': "", 'pubdate': "", 'text': "" }

            # Download and parse article
            article_parsed = Article(data['response']['results'][i]['webUrl'], language="en")
            try:
                article_parsed.download()
                article_parsed.parse()

                # Store article information in a dictionary
                article.update({
                    'url': data['response']['results'][i]['webUrl'],
                    'title': article_parsed.title,
                    'pubdate': transform_date(data['response']['results'][i]['webPublicationDate']),
                    'text': article_parsed.text.replace('\n', '')
                })

                # Push to articles list
                articles.append(article)
            except:
                print("An error occurred while fetching an article from The Guardian")
                pass
    
    # Fetch articles from News API
    endpoint = f"https://newsapi.org/v2/everything?q={prompt}&from=2024-11-09&sortBy=publishedAt&apiKey=e6782b4eb6ed4ec6a943526bcc54b8e6"
    response = requests.get(endpoint)

    if response.status_code == 200:
        data = response.json()

        for i in range(0, 3):
            article = { 'url': "", 'title': "", 'pubdate': "", 'text': "" }

            article_parsed = Article(data['articles'][i]['url'], language="en")
            try:
                article_parsed.download()
                article_parsed.parse()

                article.update({
                    'url': data['articles'][i]['url'],
                    'title': article_parsed.title,
                    'pubdate': transform_date(data['articles'][i]['publishedAt']),
                    'text': article_parsed.text.replace('\n', '')
                })

                articles.append(article)
            except:
                print("An error occurred while fetching an article from News API")
                pass
    
    # Fetch articles from News Data
    endpoint = f"https://newsdata.io/api/1/latest?apikey=pub_61660406963f4c81935fba712030890a7e333&q={prompt}&country=au,us&language=en"
    response = requests.get(endpoint)

    if response.status_code == 200:
        data = response.json()

        for i in range(0, 3):
            article = { 'url': "", 'title': "", 'pubdate': "", 'text': "" }

            article_parsed = Article(data['results'][i]['link'], language="en")
            try:
                article_parsed.download()
                article_parsed.parse()

                article.update({
                    'url': data['results'][i]['link'],
                    'title': article_parsed.title,
                    'pubdate': transform_date(data['results'][i]['pubDate']),
                    'text': article_parsed.text.replace('\n', '')
                })

                articles.append(article)
            except:
                print("An error occurred while fetching an article from News Data")
                pass

    print(articles)
    return { "message": articles }

@app.post("/chat")
async def chat(request: RequestModel):
    prompt = request.prompt
    try:
        results = DDGS().chat(prompt, model='llama-3.1-70b')
        return {"message": results}
    except Exception as e:
        print(f"Error processing request: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")