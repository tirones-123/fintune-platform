from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
from bs4 import BeautifulSoup
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

class WebScrapeRequest(BaseModel):
    url: str

@router.post("/scrape-web", tags=["helpers"])
async def scrape_web(request: WebScrapeRequest):
    url = request.url
    logger.info(f"Tentative de scraping de l'URL: {url}")
    
    if not url or not url.startswith(('http://', 'https://')):
        raise HTTPException(status_code=400, detail="URL invalide ou manquante")
    
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
        "Cache-Control": "max-age=0",
        "Referer": "https://www.google.com/"  # Ajouter un referer pour simuler une visite depuis Google
    }
    
    try:
        logger.info(f"Envoi de la requête HTTP à {url}")
        response = requests.get(url, headers=headers, timeout=15)
        
        # Gestion améliorée de l'erreur 403 (Forbidden)
        if response.status_code == 403:
            logger.warning(f"Accès refusé (403 Forbidden) pour {url}")
            # Message d'erreur détaillé avec instructions pour l'utilisateur
            detailed_error = {
                "error": "Accès refusé par le site web",
                "details": "Ce site bloque les robots de scraping ou nécessite une authentification. Certains sites populaires (comme LinkedIn, Instagram) empêchent l'extraction de leur contenu.",
                "solutions": [
                    "Essayez un autre site web qui n'a pas de restrictions anti-scraping",
                    "Utilisez un site qui fournit des API publiques pour accéder à son contenu",
                    "Essayez de copier-coller manuellement le contenu pertinent de la page",
                    "Vérifiez que l'URL est correcte et accessible depuis un navigateur normal"
                ],
                "url": url,
                "status_code": response.status_code
            }
            raise HTTPException(status_code=403, detail=detailed_error)
        
        # Gestion améliorée pour les autres erreurs HTTP
        if response.status_code != 200:
            logger.warning(f"Erreur HTTP {response.status_code} pour {url}")
            
            # Messages personnalisés selon le code d'erreur
            error_messages = {
                404: "La page demandée n'existe pas",
                500: "Erreur interne du serveur web",
                429: "Trop de requêtes envoyées au site (rate limiting)",
                401: "Authentification requise pour accéder à ce contenu"
            }
            
            error_detail = error_messages.get(response.status_code, f"Le serveur a répondu avec un code d'erreur {response.status_code}")
            
            solutions = [
                "Vérifiez que l'URL est correctement saisie",
                "Essayez à nouveau plus tard si le site est temporairement indisponible",
                "Essayez un autre site web avec un contenu similaire"
            ]
            
            # Solutions spécifiques pour certains codes d'erreur
            if response.status_code == 404:
                solutions.append("Vérifiez que la page existe toujours")
            elif response.status_code == 429:
                solutions.append("Attendez quelques minutes avant de réessayer")
            elif response.status_code in (401, 403):
                solutions.append("Choisissez un site qui ne nécessite pas d'authentification")
            
            detailed_error = {
                "error": f"Erreur lors de la récupération de la page",
                "details": error_detail,
                "solutions": solutions,
                "url": url,
                "status_code": response.status_code
            }
            raise HTTPException(status_code=response.status_code, detail=detailed_error)
            
    except requests.RequestException as e:
        error_msg = str(e)
        logger.error(f"Erreur de requête pour {url}: {error_msg}")
        
        # Détection de types d'erreurs spécifiques
        solutions = ["Vérifiez votre connexion internet", "Vérifiez que l'URL est correcte"]
        
        if "Timeout" in error_msg or "timed out" in error_msg:
            error_detail = "La requête a pris trop de temps à s'exécuter"
            solutions.append("Le site pourrait être lent ou ne pas répondre, essayez plus tard")
        elif "SSLError" in error_msg:
            error_detail = "Erreur de sécurité SSL lors de la connexion"
            solutions.append("Le site pourrait avoir des problèmes de certificat")
        elif "ConnectionError" in error_msg:
            error_detail = "Impossible de se connecter au site"
            solutions.append("Vérifiez que le site est en ligne")
        else:
            error_detail = error_msg
        
        detailed_error = {
            "error": "Erreur lors de l'accès à l'URL",
            "details": error_detail,
            "solutions": solutions,
            "url": url
        }
        raise HTTPException(status_code=400, detail=detailed_error)
    
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
            logger.info(f"Aucun paragraphe trouvé pour {url}, recherche d'autres balises")
            paragraphs = [div.get_text(strip=True) for div in soup.find_all(["div", "article", "section"]) 
                         if div.get_text(strip=True) and len(div.get_text(strip=True)) > 100]
        
        # Si toujours rien, prendre le texte visible
        if not paragraphs:
            logger.warning(f"Aucun contenu trouvé pour {url}, utilisation du texte brut")
            text_content = soup.get_text(strip=True)
            
            # Si le contenu est vide ou très court, c'est probablement un site protégé
            if not text_content or len(text_content) < 50:
                logger.warning(f"Contenu quasi-vide détecté pour {url}, possible site protégé")
                detailed_error = {
                    "error": "Impossible d'extraire du contenu",
                    "details": "Le site semble protégé contre le scraping ou utilise JavaScript pour afficher son contenu",
                    "solutions": [
                        "Essayez un autre site avec du contenu accessible",
                        "Copiez-collez manuellement le contenu pertinent"
                    ],
                    "url": url
                }
                raise HTTPException(status_code=422, detail=detailed_error)
            
            paragraphs = [text_content]
        
        logger.info(f"Scraping réussi pour {url}: {len(paragraphs)} paragraphes extraits")
        return {"title": title, "paragraphs": paragraphs}
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Erreur lors de l'analyse de {url}: {error_msg}")
        # En cas d'erreur d'analyse, renvoyer une erreur avec le détail
        detailed_error = {
            "error": "Erreur lors de l'analyse de la page",
            "details": error_msg,
            "solutions": [
                "Essayez un site avec une structure HTML plus standard",
                "Utilisez un autre site avec un contenu similaire"
            ],
            "url": url
        }
        raise HTTPException(status_code=422, detail=detailed_error) 