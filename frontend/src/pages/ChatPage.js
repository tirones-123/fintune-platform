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
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSnackbar } from 'notistack';
import { fineTuningService } from '../services/apiService';

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
  const { enqueueSnackbar } = useSnackbar();

  // Fonction pour récupérer les données du fine-tuning
  const fetchFineTuningData = async () => {
    setLoading(true);
    try {
      // Récupérer le fine-tuning depuis l'API
      const fineTuningData = await fineTuningService.getById(fineTuningId);
      setFineTuning(fineTuningData);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching fine-tuning data:', err);
      setError('Impossible de récupérer les données du modèle. Veuillez réessayer.');
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

  // Fonction pour envoyer un message
  const handleSendMessage = async (event) => {
    event.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setInput('');
    
    // Ajouter le message de l'utilisateur à la conversation
    const newUserMessage = {
      role: 'user', 
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    
    // Indiquer que le modèle est en train de répondre
    setResponding(true);
    
    try {
      // Tester le modèle via l'API
      const response = await fineTuningService.testModel(fineTuningId, userMessage);
      
      // Ajouter la réponse du modèle à la conversation
      const assistantMessage = {
        role: 'assistant', 
        content: response.response,
        timestamp: new Date().toISOString()
      };
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
      
    } catch (err) {
      console.error('Error getting model response:', err);
      enqueueSnackbar('Erreur lors de la récupération de la réponse du modèle', { variant: 'error' });
      // Optionnel: Ajouter un message d'erreur à la conversation
      const errorMessage = {
        role: 'assistant',
        content: `Désolé, une erreur s'est produite: ${err.message}`,
        timestamp: new Date().toISOString()
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
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
                  alignItems: 'flex-end',
                  gap: 1,
                  mb: 2,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: message.role === 'user' ? 'primary.main' : 'secondary.main',
                    width: 32,
                    height: 32,
                    mb: 1,
                  }}
                >
                  {message.role === 'user' ? <PersonIcon fontSize="small"/> : <SmartToyIcon fontSize="small"/>}
                </Avatar>
                <Box sx={{ maxWidth: '75%' }}> 
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: message.role === 'user' 
                        ? '16px 16px 4px 16px' 
                        : '16px 16px 16px 4px',
                      bgcolor: message.role === 'user' ? 'primary.main' : 'grey.100',
                      color: message.role === 'user' ? 'primary.contrastText' : 'text.primary',
                    }}
                  >
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {message.content}
                    </Typography>
                  </Box>
                  {message.timestamp && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block',
                        textAlign: message.role === 'user' ? 'right' : 'left',
                        mt: 0.5,
                        px: 0.5,
                        color: 'text.secondary',
                      }}
                    >
                      {formatTime(message.timestamp)}
                    </Typography>
                  )}
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
                    borderRadius: '20px',
                    bgcolor: 'background.paper',
                  }
                }}
              />
              <Button 
                variant="contained"
                type="submit"
                disabled={!input.trim() || loading || responding}
                sx={{
                  borderRadius: '50%',
                  minWidth: '56px',
                  width: '56px',
                  height: '56px',
                  p: 0,
                  boxShadow: 3,
                  '&.Mui-disabled': {
                    bgcolor: 'action.disabledBackground',
                    boxShadow: 'none',
                  }
                }}
              >
                {responding ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
              </Button>
            </Box>
          </form>
        </Box>
      </Paper>
    </Container>
  );
};

export default ChatPage; 