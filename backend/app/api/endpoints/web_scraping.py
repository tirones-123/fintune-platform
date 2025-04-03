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
    
    # Ajouter des en-têtes pour simuler un navigateur
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "DNT": "1",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Cache-Control": "max-age=0"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        
        # Gestion de l'erreur 403 (Forbidden)
        if response.status_code == 403:
            raise HTTPException(status_code=403, detail="Accès refusé par le site web. Ce site semble bloquer les robots de scraping.")
            
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"Erreur lors de la récupération de la page: code {response.status_code}")
    except requests.RequestException as e:
        raise HTTPException(status_code=400, detail=f"Erreur lors de l'accès à l'URL: {str(e)}")
    
    content = response.text
    soup = BeautifulSoup(content, "html.parser")
    
    # Extraction améliorée pour éviter les erreurs
    try:
        # Extraire le titre (si présent)
        title = soup.title.get_text(strip=True) if soup.title else ""
        
        # Extraire les paragraphes non vides
        paragraphs = [p.get_text(strip=True) for p in soup.find_all("p") if p.get_text(strip=True)]
        
        # Si aucun paragraphe n'a été trouvé, essayer d'extraire du texte d'autres balises courantes
        if not paragraphs:
            paragraphs = [div.get_text(strip=True) for div in soup.find_all(["div", "article", "section"]) 
                         if div.get_text(strip=True) and len(div.get_text(strip=True)) > 100]
        
        # Si toujours rien, prendre le texte visible
        if not paragraphs:
            paragraphs = [soup.get_text(strip=True)]
        
        return {"title": title, "paragraphs": paragraphs}
    except Exception as e:
        # En cas d'erreur d'analyse, renvoyer une erreur avec le détail
        raise HTTPException(status_code=422, detail=f"Erreur lors de l'analyse de la page: {str(e)}") 