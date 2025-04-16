import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Tab,
  Tabs,
  TextField,
  Typography,
  Alert,
  Snackbar,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Select,
  ListItemSecondaryAction
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SaveIcon from '@mui/icons-material/Save';
import KeyIcon from '@mui/icons-material/Key';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSnackbar } from 'notistack';
import { apiKeyService, userService, characterService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import PageTransition from '../components/common/PageTransition';
import LoadingScreen from '../components/common/LoadingScreen';

const SettingsPage = () => {
  const { user, updateUser, logout } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [apiKeys, setApiKeys] = useState([]);
  const [newApiKey, setNewApiKey] = useState('');
  const [newProvider, setNewProvider] = useState('openai'); // Par défaut
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [apiKeyToDelete, setApiKeyToDelete] = useState(null);
  const [apiKeyAnchorEl, setApiKeyAnchorEl] = useState(null);
  const [usageStats, setUsageStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loadingUsage, setLoadingUsage] = useState(true);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [loadingVerification, setLoadingVerification] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Nouveaux états pour la suppression de compte
  const [deleteAccountConfirmOpen, setDeleteAccountConfirmOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Charger les données initiales
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setLoadingUsage(true);
      try {
        const keys = await apiKeyService.getKeys();
        setApiKeys(keys || []);

        const stats = await characterService.getUsageStats();
        setUsageStats(stats);
        
        const trans = await characterService.getTransactions();
        setTransactions(trans);

      } catch (error) {
        console.error("Erreur chargement données Settings:", error);
        enqueueSnackbar("Erreur lors du chargement des données.", { variant: 'error' });
      } finally {
        setLoading(false);
        setLoadingUsage(false);
      }
    };
    fetchData();
  }, [enqueueSnackbar]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleUpdateProfile = async () => {
    try {
      await updateUser({ name });
      enqueueSnackbar('Profil mis à jour avec succès', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Erreur lors de la mise à jour du profil', { variant: 'error' });
    }
  };

  const handleAddApiKey = async () => {
    if (!newApiKey || !newProvider) {
      enqueueSnackbar('Veuillez saisir une clé API et choisir un fournisseur', { variant: 'warning' });
      return;
    }
    try {
      await apiKeyService.addKey(newProvider, newApiKey);
      setNewApiKey('');
      // Recharger les clés
      const keys = await apiKeyService.getKeys();
      setApiKeys(keys || []);
      enqueueSnackbar(`Clé API pour ${newProvider} ajoutée/mise à jour`, { variant: 'success' });
    } catch (error) {
      enqueueSnackbar("Erreur lors de l'ajout de la clé API", { variant: 'error' });
    }
  };

  const handleOpenApiKeyMenu = (event, key) => {
    setApiKeyAnchorEl(event.currentTarget);
    setApiKeyToDelete(key);
  };

  const handleCloseApiKeyMenu = () => {
    setApiKeyAnchorEl(null);
    setApiKeyToDelete(null);
  };

  const openDeleteConfirm = () => {
    setDeleteConfirmOpen(true);
    handleCloseApiKeyMenu();
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setApiKeyToDelete(null);
  };

  const handleDeleteApiKey = async () => {
    if (!apiKeyToDelete) return;
    try {
      await apiKeyService.deleteKey(apiKeyToDelete.provider);
      // Recharger les clés
      const keys = await apiKeyService.getKeys();
      setApiKeys(keys || []);
      enqueueSnackbar(`Clé API pour ${apiKeyToDelete.provider} supprimée`, { variant: 'success' });
    } catch (error) {
      enqueueSnackbar("Erreur lors de la suppression de la clé API", { variant: 'error' });
    } finally {
      closeDeleteConfirm();
    }
  };

  const handleVerifyKey = async () => {
    if (!newApiKey || !newProvider) {
      enqueueSnackbar('Veuillez saisir une clé API et choisir un fournisseur', { variant: 'warning' });
      return;
    }
    setLoadingVerification(true);
    try {
      const result = await apiKeyService.verifyKey(newProvider, newApiKey);
      setVerificationResult(result);
      if (result.valid) {
        await apiKeyService.addKey(newProvider, newApiKey);
        setNewApiKey('');
        // Recharger les clés
        const keys = await apiKeyService.getKeys();
        setApiKeys(keys || []);
        enqueueSnackbar(`Clé API pour ${newProvider} ajoutée/mise à jour`, { variant: 'success' });
      }
    } catch (error) {
      enqueueSnackbar("Erreur lors de la vérification de la clé API", { variant: 'error' });
    } finally {
      setLoadingVerification(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Veuillez remplir tous les champs');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return;
    }
    setChangingPassword(true);
    try {
      await userService.changePassword(currentPassword, newPassword);
      enqueueSnackbar('Mot de passe changé avec succès', { variant: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
    } catch (error) {
      enqueueSnackbar('Erreur lors de la modification du mot de passe', { variant: 'error' });
    } finally {
      setChangingPassword(false);
    }
  };

  // Nouvelle fonction pour gérer la suppression de compte
  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      // Appeler le service (qui appellera DELETE /api/users/me)
      await userService.deleteAccount(); 
      enqueueSnackbar("Compte supprimé avec succès. Vous allez être déconnecté.", { variant: 'success' });
      // Utiliser le logout du contexte pour nettoyer et rediriger
      logout(); 
    } catch (error) {
      console.error("Erreur lors de la suppression du compte:", error);
      enqueueSnackbar(error.message || "Erreur lors de la suppression du compte", { variant: 'error' });
      setDeletingAccount(false); // Réactiver le bouton si erreur
      setDeleteAccountConfirmOpen(false); // Fermer le dialogue d'erreur
    }
    // Pas de setDeletingAccount(false) ici car on est déconnecté si succès
  };

  // Formatage des dates
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  if (loading) {
    return <LoadingScreen />; 
  }

  return (
    <PageTransition>
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Paramètres
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="settings tabs">
            <Tab label="Profil" icon={<AccountCircleIcon />} iconPosition="start" id="tab-0" />
            <Tab label="Clés API" icon={<KeyIcon />} iconPosition="start" id="tab-1" />
            <Tab label="Utilisation & Facturation" icon={<NotificationsIcon />} iconPosition="start" id="tab-2" />
            <Tab label="Sécurité" icon={<SecurityIcon />} iconPosition="start" id="tab-3" />
        </Tabs>
      </Box>

        {/* Onglet Profil */}
        <Box role="tabpanel" hidden={tabValue !== 0}>
      {tabValue === 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Informations du profil</Typography>
              <TextField
                label="Nom"
                value={name}
                onChange={handleNameChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Email"
                value={email}
                fullWidth
                margin="normal"
                disabled // Email non modifiable pour l'instant
              />
                      <Button
                        variant="contained"
                onClick={handleUpdateProfile} 
                sx={{ mt: 2 }}
                disabled={name === user?.name}
              >
                Enregistrer les modifications
                      </Button>
            </Paper>
                      )}
                    </Box>

        {/* Onglet Clés API */}
        <Box role="tabpanel" hidden={tabValue !== 1}>
          {tabValue === 1 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Gestion des Clés API</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Ajoutez les clés API des fournisseurs IA que vous souhaitez utiliser pour le fine-tuning.
                    </Typography>
                    
              <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'flex-start' }}>
                 <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel id="provider-select-label">Fournisseur</InputLabel>
                    <Select
                        labelId="provider-select-label"
                        value={newProvider}
                        label="Fournisseur"
                        onChange={(e) => setNewProvider(e.target.value)}
                        size="small"
                    >
                        <MenuItem value="openai">OpenAI</MenuItem>
                        <MenuItem value="anthropic" disabled>Anthropic (Bientôt)</MenuItem>
                        {/* <MenuItem value="mistral">Mistral</MenuItem> */}
                    </Select>
                 </FormControl>
                <TextField
                  label="Nouvelle Clé API"
                  value={newApiKey}
                  onChange={(e) => setNewApiKey(e.target.value)}
                  type="password"
                  size="small"
                  sx={{ flexGrow: 1 }}
                  placeholder={newProvider === 'openai' ? 'sk-...' : ''}
                />
                      <Button
                  variant="outlined" 
                  onClick={handleVerifyKey} 
                  disabled={!newApiKey || loadingVerification}
                  sx={{ ml: 1 }}
                >
                   {loadingVerification ? <CircularProgress size={20}/> : 'Vérifier'}
                      </Button>
                        <Button
                  variant="contained" 
                  onClick={handleAddApiKey}
                  disabled={!newApiKey}
                  sx={{ ml: 1 }}
                >
                  Ajouter / Mettre à jour
                        </Button>
                    </Box>
              
              {/* Affichage du résultat de la vérification */}
              {verificationResult && (
                 <Alert 
                    severity={verificationResult.valid ? 'success' : 'error'} 
                    sx={{ mb: 2 }}
                    onClose={() => setVerificationResult(null)} // Permet de fermer l'alerte
                 >
                     {verificationResult.message}
                     {verificationResult.valid && verificationResult.credits !== undefined && ` (Crédits disponibles: ${verificationResult.credits ?? 'N/A'})`}
                 </Alert>
              )}

              <Typography variant="subtitle1" gutterBottom>Clés enregistrées</Typography>
              {apiKeys.length === 0 ? (
                <Typography>Aucune clé API enregistrée.</Typography>
              ) : (
                <List dense>
                  {apiKeys.map((key) => (
                    <ListItem key={key.provider} divider>
                      <ListItemIcon sx={{ minWidth: 36 }}><KeyIcon /></ListItemIcon>
                      <ListItemText 
                        primary={key.provider.toUpperCase()} 
                        secondary={`Clé: ****${key.key.slice(-4)} - Ajoutée le: ${formatDate(key.created_at)}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" onClick={(e) => handleOpenApiKeyMenu(e, key)} title="Supprimer">
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          )}
        </Box>

        {/* Onglet Utilisation & Facturation - Simplifié */}
        <Box role="tabpanel" hidden={tabValue !== 2}>
          {tabValue === 2 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Utilisation des Caractères</Typography>
              {loadingUsage ? (
                <CircularProgress />
              ) : usageStats ? (
                <Box sx={{ mb: 3 }}>
                    <Typography>Crédits gratuits restants: <strong>{usageStats.free_characters_remaining?.toLocaleString() || '0'}</strong></Typography>
                    <Typography>Total utilisé: <strong>{usageStats.total_characters_used?.toLocaleString() || '0'}</strong></Typography>
                    <Typography>Total acheté: <strong>{usageStats.total_characters_purchased?.toLocaleString() || '0'}</strong></Typography>
                </Box>
              ) : (
                 <Typography>Impossible de charger les statistiques d'utilisation.</Typography>
              )}

              <Typography variant="h6" gutterBottom sx={{ mt: 3}}>Historique des Transactions</Typography>
               {loadingUsage ? (
                 <CircularProgress />
               ) : transactions.length === 0 ? (
                 <Typography>Aucune transaction.</Typography>
               ) : (
                 <List dense>
                   {transactions.map(tx => (
                     <ListItem key={tx.id} divider>
                       <ListItemText
                         primary={tx.description}
                         secondary={
                           `Date: ${formatDate(tx.created_at)} | Montant: ${tx.amount > 0 ? '+' : ''}${tx.amount.toLocaleString()} caractères ${tx.total_price ? `(${tx.total_price.toFixed(2)}$)` : ''}`
                         }
                       />
                     </ListItem>
                   ))}
                 </List>
               )}
            </Paper>
          )}
        </Box>

        {/* Onglet Sécurité (Nouveau) */}
        <Box role="tabpanel" hidden={tabValue !== 3}>
          {tabValue === 3 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Sécurité du Compte</Typography>
              {/* Section Changement de Mot de Passe */}
              <Box sx={{ mt: 3 }}>
                 <Typography variant="subtitle1" gutterBottom>Changer le mot de passe</Typography>
                 <TextField
                   label="Mot de passe actuel"
                   type="password"
                   fullWidth
                   margin="normal"
                   value={currentPassword}
                   onChange={(e) => setCurrentPassword(e.target.value)}
                   error={!!passwordError}
                 />
                 <TextField
                   label="Nouveau mot de passe"
                   type="password"
                   fullWidth
                   margin="normal"
                   value={newPassword}
                   onChange={(e) => setNewPassword(e.target.value)}
                   error={!!passwordError}
                 />
                 <TextField
                   label="Confirmer le nouveau mot de passe"
                   type="password"
                   fullWidth
                   margin="normal"
                   value={confirmPassword}
                   onChange={(e) => setConfirmPassword(e.target.value)}
                   error={!!passwordError}
                   helperText={passwordError}
                 />
                      <Button
                        variant="contained"
                   onClick={handleChangePassword}
                   sx={{ mt: 2 }}
                   disabled={!currentPassword || !newPassword || !confirmPassword || changingPassword}
                 >
                   {changingPassword ? <CircularProgress size={24} /> : 'Changer le mot de passe'}
                      </Button>
              </Box>
               {/* Section Email (Lecture seule pour l'instant) */}
              {/* <Box sx={{ mt: 4 }}>
                 <Typography variant="subtitle1" gutterBottom>Adresse Email</Typography>
                 <TextField
                   label="Email"
                   value={email}
                   fullWidth
                   margin="normal"
                   disabled
                   helperText="Pour changer votre email, veuillez contacter le support."
                 />
              </Box> */}
              
              {/* Section Suppression de Compte */}
              <Box sx={{ mt: 5, borderTop: '1px solid', borderColor: 'divider', pt: 3 }}>
                <Typography variant="subtitle1" color="error" gutterBottom>
                  Zone Dangereuse
                </Typography>
                        <Button
                  variant="contained" 
                          color="error"
                  onClick={() => setDeleteAccountConfirmOpen(true)}
                  disabled={deletingAccount}
                        >
                   {deletingAccount ? <CircularProgress size={24} color="inherit" /> : 'Supprimer mon compte'}
                        </Button>
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                  Attention : Cette action est irréversible et supprimera définitivement votre compte et toutes les données associées (projets, contenus, datasets, fine-tunings).
                </Typography>
                    </Box>
            </Paper>
          )}
        </Box>

        {/* Menu pour supprimer clé API */}
        <Menu
          anchorEl={apiKeyAnchorEl}
          open={Boolean(apiKeyAnchorEl)}
          onClose={handleCloseApiKeyMenu}
        >
          <MenuItem onClick={openDeleteConfirm} sx={{ color: 'error.main' }}>
            Supprimer la clé pour {apiKeyToDelete?.provider}
          </MenuItem>
        </Menu>

         {/* Dialogue de confirmation de suppression */}
        <Dialog open={deleteConfirmOpen} onClose={closeDeleteConfirm}>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Êtes-vous sûr de vouloir supprimer la clé API pour {apiKeyToDelete?.provider} ? 
                    Vous ne pourrez plus lancer de fine-tuning avec ce fournisseur tant qu'une nouvelle clé ne sera pas ajoutée.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={closeDeleteConfirm}>Annuler</Button>
                <Button onClick={handleDeleteApiKey} color="error">Supprimer</Button>
            </DialogActions>
        </Dialog>

         {/* Dialogue de confirmation de suppression de compte */}
        <Dialog open={deleteAccountConfirmOpen} onClose={() => setDeleteAccountConfirmOpen(false)}>
            <DialogTitle sx={{ bgcolor: 'error.main', color: 'error.contrastText' }}>
                Suppression Définitive du Compte
            </DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ mt: 2 }}>
                    <strong>Attention !</strong> Cette action est irréversible.
                    La suppression de votre compte entraînera la perte définitive de :
                    <ul>
                        <li>Vos informations de profil</li>
                        <li>Tous vos projets</li>
                        <li>Tous vos contenus (fichiers, vidéos, sites web)</li>
                        <li>Tous vos datasets générés</li>
                        <li>Tous vos modèles fine-tunés</li>
                        <li>Vos clés API enregistrées</li>
                        <li>Votre historique de transactions</li>
                    </ul>
                    Êtes-vous absolument sûr de vouloir continuer ?
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={() => setDeleteAccountConfirmOpen(false)} disabled={deletingAccount}>Annuler</Button>
                <Button 
                    onClick={handleDeleteAccount} 
                    color="error" 
                    variant="contained"
                    disabled={deletingAccount}
                    startIcon={deletingAccount ? <CircularProgress size={18} color="inherit" /> : null}
                >
                    {deletingAccount ? 'Suppression...' : 'Confirmer la Suppression'}
                </Button>
            </DialogActions>
        </Dialog>

    </Container>
    </PageTransition>
  );
};

export default SettingsPage; 