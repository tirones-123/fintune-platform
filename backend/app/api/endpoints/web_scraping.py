from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
from bs4 import BeautifulSoup

router = APIRouter()

class WebScrapeRequest(BaseModel):
    url: str

@router.post("/scrape-web", tags=["helpers"])
async def scrape_web(request: WebScrapeRequest):
    url = request.url
    try:
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"Erreur lors de la récupération de la page: code {response.status_code}")
    except requests.RequestException as e:
        raise HTTPException(status_code=400, detail=f"Erreur lors de l'accès à l'URL: {str(e)}")
    
    content = response.text
    soup = BeautifulSoup(content, "html.parser")
    
    # Extraire le titre (si présent)
    title = soup.title.get_text(strip=True) if soup.title else ""
    # Extraire les paragraphes non vides
    paragraphs = [p.get_text(strip=True) for p in soup.find_all("p") if p.get_text(strip=True)]
    
    return {"title": title, "paragraphs": paragraphs} 