import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  Container,
  Divider,
  IconButton,
  Link,
  Paper,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Avatar,
} from '@mui/material';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import { fineTuningService } from '../services/localStorageService';

const ChatPage = () => {
  const { fineTuningId } = useParams();
  const navigate = useNavigate();
  const [fineTuning, setFineTuning] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Fonction pour récupérer les données du fine-tuning
  const fetchFineTuningData = async () => {
    setLoading(true);
    try {
      console.log('Chargement des données du fine-tuning depuis localStorage:', fineTuningId);
      
      // Simuler un délai pour montrer le chargement
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Récupérer le fine-tuning
      const fineTuning = fineTuningService.getById(fineTuningId);
      if (!fineTuning) {
        setError('Fine-tuning non trouvé');
        setLoading(false);
        return;
      }
      setFineTuning(fineTuning);

      // Message de bienvenue
      setMessages([
        {
          role: 'assistant',
          content: 'Bonjour ! Je suis votre assistant personnalisé basé sur le modèle ' + fineTuning.name + '. Comment puis-je vous aider aujourd\'hui ?',
          timestamp: new Date().toISOString(),
        },
      ]);

      setError(null);
    } catch (err) {
      console.error('Error fetching fine-tuning data:', err);
      setError('Impossible de récupérer les données du fine-tuning. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFineTuningData();
  }, [fineTuningId]);

  // Faire défiler vers le bas lorsque de nouveaux messages sont ajoutés
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Simuler l'envoi d'un message au modèle
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setResponding(true);
    
    try {
      // Simuler un délai pour la réponse
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1500));
      
      // Réponses prédéfinies pour la démo
      let assistantResponse;
      const userMessageLower = userMessage.content.toLowerCase();
      
      if (userMessageLower.includes('prix') || userMessageLower.includes('tarif') || userMessageLower.includes('coût')) {
        assistantResponse = 'Nos tarifs sont très compétitifs. Pour un accès standard, comptez 29€/mois. Pour un accès premium avec toutes les fonctionnalités, c\'est 99€/mois. Nous proposons également des offres sur mesure pour les grandes entreprises. Souhaitez-vous que je vous donne plus de détails sur l\'une de ces offres ?';
      } else if (userMessageLower.includes('fonctionnalité') || userMessageLower.includes('feature') || userMessageLower.includes('option')) {
        assistantResponse = 'Notre plateforme FinTune offre de nombreuses fonctionnalités : création de datasets personnalisés, fine-tuning de modèles de langage, déploiement facile, analyse des performances, et intégration via API. Quelle fonctionnalité vous intéresse particulièrement ?';
      } else if (userMessageLower.includes('délai') || userMessageLower.includes('temps') || userMessageLower.includes('durée')) {
        assistantResponse = 'Le temps nécessaire pour fine-tuner un modèle dépend de la taille de votre dataset et du modèle choisi. En général, comptez entre 30 minutes et 4 heures. Une fois terminé, le déploiement est instantané. Avez-vous un projet spécifique en tête ?';
      } else if (userMessageLower.includes('contact') || userMessageLower.includes('support') || userMessageLower.includes('aide')) {
        assistantResponse = 'Notre équipe de support est disponible 24/7. Vous pouvez nous contacter par email à support@fintune.ai ou par téléphone au 01 23 45 67 89. Nous proposons également un chat en direct sur notre site web. Comment préférez-vous nous contacter ?';
      } else if (userMessageLower.includes('merci') || userMessageLower.includes('au revoir') || userMessageLower.includes('bye')) {
        assistantResponse = 'Je vous en prie ! N\'hésitez pas à revenir si vous avez d\'autres questions. Bonne journée !';
      } else {
        assistantResponse = 'Merci pour votre question. FinTune est une plateforme qui vous permet de créer facilement des assistants IA personnalisés en utilisant vos propres données. Vous pouvez importer vos contenus, créer des datasets, et fine-tuner des modèles de langage sans avoir besoin de compétences techniques avancées. Que souhaitez-vous savoir d\'autre sur notre plateforme ?';
      }
      
      const assistantMessage = {
        role: 'assistant',
        content: assistantResponse,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Error getting response:', err);
      setError('Impossible d\'obtenir une réponse. Veuillez réessayer.');
    } finally {
      setResponding(false);
    }
  };

  // Formatage de la date
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4, height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            edge="start" 
            color="inherit" 
            onClick={() => navigate(`/dashboard/fine-tuning/${fineTuningId}`)}
            sx={{ mr: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5">
            {loading ? 'Chargement...' : fineTuning?.name}
          </Typography>
        </Box>
      </Box>
      
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link component={RouterLink} to="/dashboard" color="inherit">
          Dashboard
        </Link>
        <Link component={RouterLink} to="/dashboard/fine-tuning" color="inherit">
          Fine-tuning
        </Link>
        <Link component={RouterLink} to={`/dashboard/fine-tuning/${fineTuningId}`} color="inherit">
          {loading ? 'Chargement...' : fineTuning?.name}
        </Link>
        <Typography color="text.primary">Test du modèle</Typography>
      </Breadcrumbs>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper 
        elevation={3} 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          mb: 2,
          overflow: 'hidden',
        }}
      >
        <Box 
          sx={{ 
            flexGrow: 1, 
            overflowY: 'auto', 
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : (
            messages.map((message, index) => (
              <Box 
                key={index}
                sx={{
                  display: 'flex',
                  flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-start',
                  gap: 1,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: message.role === 'user' ? 'primary.main' : 'secondary.main',
                  }}
                >
                  {message.role === 'user' ? <PersonIcon /> : <SmartToyIcon />}
                </Avatar>
                <Box
                  sx={{
                    maxWidth: '70%',
                    p: 2,
                    borderRadius: 2,
                    bgcolor: message.role === 'user' ? 'primary.light' : 'grey.100',
                    color: message.role === 'user' ? 'white' : 'text.primary',
                    position: 'relative',
                  }}
                >
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {message.content}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      position: 'absolute',
                      bottom: 4,
                      right: message.role === 'user' ? 'auto' : 8,
                      left: message.role === 'user' ? 8 : 'auto',
                      color: message.role === 'user' ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                    }}
                  >
                    {formatTime(message.timestamp)}
                  </Typography>
                </Box>
              </Box>
            ))
          )}
          {responding && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: 'secondary.main' }}>
                <SmartToyIcon />
              </Avatar>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.100' }}>
                <CircularProgress size={20} />
              </Box>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>
        
        <Divider />
        
        <Box sx={{ p: 2 }}>
          <form onSubmit={handleSendMessage}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Tapez votre message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading || responding}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 4,
                  }
                }}
              />
              <IconButton 
                color="primary" 
                type="submit" 
                disabled={!input.trim() || loading || responding}
                sx={{ 
                  bgcolor: 'primary.main', 
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  '&.Mui-disabled': {
                    bgcolor: 'action.disabledBackground',
                    color: 'action.disabled',
                  }
                }}
              >
                {responding ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
              </IconButton>
            </Box>
          </form>
        </Box>
      </Paper>
    </Container>
  );
};

export default ChatPage; 