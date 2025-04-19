import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Link,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ApiIcon from '@mui/icons-material/Api';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import YouTubeIcon from '@mui/icons-material/YouTube';
import PageTransition from '../components/common/PageTransition';

function HelpPage() {
  return (
    <PageTransition>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
          <HelpOutlineIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Centre d'Aide FinTune
        </Typography>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Comment fonctionne FinTune Platform ?
          </Typography>
          <Typography paragraph>
            FinTune vous permet de créer des assistants IA personnalisés en fine-tunant des modèles de langage sur vos propres données. Le processus général est le suivant :
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="1. Création d'un Projet :" secondary="Organisez vos travaux en projets distincts." />
            </ListItem>
            <ListItem>
              <ListItemText primary="2. Import de Contenu :" secondary="Ajoutez vos documents, pages web, ou vidéos YouTube. Nous extrayons le texte pertinent." />
            </ListItem>
            <ListItem>
              <ListItemText primary="3. Création d'un Dataset :" secondary="Nous transformons votre contenu en paires de questions/réponses optimisées pour le fine-tuning." />
            </ListItem>
            <ListItem>
              <ListItemText primary="4. Lancement du Fine-tuning :" secondary="Choisissez un modèle de base (ex: GPT-3.5) et lancez l'entraînement sur votre dataset." />
            </ListItem>
            <ListItem>
              <ListItemText primary="5. Test & Intégration :" secondary="Testez votre modèle personnalisé dans le Playground et intégrez-le à vos applications." />
            </ListItem>
            <ListItem sx={{ mt: 1 }}>
               <ListItemIcon sx={{ minWidth: 30 }}><YouTubeIcon color="error" fontSize="small" /></ListItemIcon>
               <ListItemText 
                 primary="Voir le tutoriel vidéo :" 
                 secondary={<Link href="https://www.youtube.com/watch?v=VIDEO_ID_PLACEHOLDER" target="_blank" rel="noopener noreferrer">Comment utiliser FinTune Platform (Tutoriel)</Link>}
               />
            </ListItem>
          </List>
          <Typography paragraph sx={{ mt: 2 }}>
            Le fine-tuning adapte le modèle à votre style, terminologie et base de connaissances spécifiques, le rendant beaucoup plus performant pour vos cas d'usage.
          </Typography>
        </Paper>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom>
            <IntegrationInstructionsIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Intégrer vos modèles Fine-tunés
          </Typography>
          <Typography paragraph>
            Une fois votre modèle fine-tuné (statut "completed"), vous pouvez l'utiliser dans vos propres applications ou workflows.
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              <ApiIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Via l'API FinTune (Recommandé)
            </Typography>
            <Typography paragraph>
              Nous fournirons bientôt un endpoint API dédié pour interagir facilement avec vos modèles fine-tunés hébergés sur FinTune. Cela simplifiera l'intégration et la gestion.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              *(Cette fonctionnalité est en cours de développement)*
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Via l'API du Fournisseur (OpenAI, Anthropic, etc.)
            </Typography>
            <Typography paragraph>
              Vous pouvez utiliser directement l'API du fournisseur (ex: OpenAI) en utilisant l'ID de votre modèle fine-tuné. Vous trouverez cet ID sur la page de détails de votre Fine-tuning ou dans le Playground.
            </Typography>
            <Typography paragraph>
              Exemple avec l'API OpenAI (Python) :
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'action.hover', borderRadius: 1, overflowX: 'auto' }}>
              <pre><code>
{`import openai

openai.api_key = 'VOTRE_CLE_API_OPENAI'

response = openai.Completion.create(
  model="VOTRE_ID_MODELE_FINETUNE", # Remplacez par l'ID de votre modèle
  prompt="Votre prompt ici...",
  max_tokens=150
)

print(response.choices[0].text.strip())`}
              </code></pre>
            </Paper>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Consultez la documentation de <Link href="https://platform.openai.com/docs/api-reference/completions/create" target="_blank" rel="noopener noreferrer">l'API OpenAI</Link> pour plus de détails sur les paramètres.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box>
            <Typography variant="h6" gutterBottom>
              Via Zapier / Make / Autres plateformes d'automatisation
            </Typography>
            <Typography paragraph>
              La plupart des plateformes d'automatisation (Zapier, Make, n8n, etc.) proposent des intégrations natives avec OpenAI ou permettent d'effectuer des appels API HTTP génériques.
            </Typography>
            <Typography paragraph>
              Vous pouvez utiliser l'action "OpenAI Completion" (ou équivalent) en spécifiant l'ID de votre modèle fine-tuné dans le champ "Model". Vous aurez besoin de votre clé API OpenAI.
            </Typography>
            <Typography paragraph>
              Si l'intégration directe n'est pas disponible, utilisez l'action "Webhook" ou "HTTP Request" pour appeler l'API du fournisseur comme décrit ci-dessus.
            </Typography>
            <Typography variant="body2">
              Référez-vous à la documentation de votre plateforme d'automatisation préférée pour la configuration exacte.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </PageTransition>
  );
}

export default HelpPage; 