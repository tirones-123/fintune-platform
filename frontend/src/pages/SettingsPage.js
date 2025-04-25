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
import { useTranslation } from 'react-i18next';
import { apiKeyService, userService, characterService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import PageTransition from '../components/common/PageTransition';
import LoadingScreen from '../components/common/LoadingScreen';

const SettingsPage = () => {
  const { user, updateUser, logout } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const { t, i18n } = useTranslation();
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
        enqueueSnackbar(t('settings.error.loadData'), { variant: 'error' });
      } finally {
        setLoading(false);
        setLoadingUsage(false);
      }
    };
    fetchData();
  }, [enqueueSnackbar, t]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleUpdateProfile = async () => {
    try {
      await updateUser({ name });
      enqueueSnackbar(t('settings.profile.updateSuccess'), { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(t('settings.profile.updateError'), { variant: 'error' });
    }
  };

  const handleAddApiKey = async () => {
    if (!newApiKey || !newProvider) {
      enqueueSnackbar(t('settings.apiKeys.missingKeyWarning'), { variant: 'warning' });
      return;
    }
    try {
      await apiKeyService.addKey(newProvider, newApiKey);
      setNewApiKey('');
      // Recharger les clés
      const keys = await apiKeyService.getKeys();
      setApiKeys(keys || []);
      enqueueSnackbar(t('settings.apiKeys.addSuccess', { provider: newProvider }), { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(t('settings.apiKeys.addError'), { variant: 'error' });
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
      enqueueSnackbar(t('settings.apiKeys.deleteSuccess', { provider: apiKeyToDelete.provider }), { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(t('settings.apiKeys.deleteError'), { variant: 'error' });
    } finally {
      closeDeleteConfirm();
    }
  };

  const handleVerifyKey = async () => {
    if (!newApiKey || !newProvider) {
      enqueueSnackbar(t('settings.apiKeys.missingKeyWarning'), { variant: 'warning' });
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
        enqueueSnackbar(t('settings.apiKeys.addSuccess', { provider: newProvider }), { variant: 'success' });
      } else {
        // Handle invalid key scenario (optional, depends on how much info you want to show)
      }
    } catch (error) {
      enqueueSnackbar(t('settings.apiKeys.verifyError'), { variant: 'error' });
    } finally {
      setLoadingVerification(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError(t('settings.security.passwordErrorRequired'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t('settings.security.passwordErrorMatch'));
      return;
    }
    setChangingPassword(true);
    try {
      await userService.changePassword(currentPassword, newPassword);
      enqueueSnackbar(t('settings.security.changePasswordSuccess'), { variant: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
    } catch (error) {
      enqueueSnackbar(t('settings.security.changePasswordError'), { variant: 'error' });
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
      enqueueSnackbar(t('settings.security.deleteAccountSuccess'), { variant: 'success' });
      // Utiliser le logout du contexte pour nettoyer et rediriger
      logout(); 
    } catch (error) {
      console.error("Erreur lors de la suppression du compte:", error);
      enqueueSnackbar(error.message || t('settings.security.deleteAccountError'), { variant: 'error' });
      setDeletingAccount(false); // Réactiver le bouton si erreur
      setDeleteAccountConfirmOpen(false); // Fermer le dialogue d'erreur
    }
    // Pas de setDeletingAccount(false) ici car on est déconnecté si succès
  };

  // Formatage des dates
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(i18n.language, options);
  };

  if (loading) {
    return <LoadingScreen />; 
  }

  return (
    <PageTransition>
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t('settings.title')}
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label={t('settings.tabs.ariaLabel')}>
            <Tab label={t('settings.tabs.profile')} icon={<AccountCircleIcon />} iconPosition="start" id="tab-0" />
            <Tab label={t('settings.tabs.apiKeys')} icon={<KeyIcon />} iconPosition="start" id="tab-1" />
            <Tab label={t('settings.tabs.usageBilling')} icon={<NotificationsIcon />} iconPosition="start" id="tab-2" />
            <Tab label={t('settings.tabs.security')} icon={<SecurityIcon />} iconPosition="start" id="tab-3" />
        </Tabs>
      </Box>

        {/* Onglet Profil */}
        <Box role="tabpanel" hidden={tabValue !== 0}>
      {tabValue === 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>{t('settings.profile.title')}</Typography>
              <TextField
                label={t('settings.profile.nameLabel')}
                value={name}
                onChange={handleNameChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label={t('settings.profile.emailLabel')}
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
                {t('settings.profile.saveButton')}
                      </Button>
            </Paper>
                      )}
                    </Box>

        {/* Onglet Clés API */}
        <Box role="tabpanel" hidden={tabValue !== 1}>
          {tabValue === 1 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>{t('settings.apiKeys.title')}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t('settings.apiKeys.description')}
                    </Typography>
                    
              <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'flex-start' }}>
                 <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel id="provider-select-label">{t('settings.apiKeys.providerLabel')}</InputLabel>
                    <Select
                        labelId="provider-select-label"
                        value={newProvider}
                        label={t('settings.apiKeys.providerLabel')}
                        onChange={(e) => setNewProvider(e.target.value)}
                        size="small"
                    >
                        <MenuItem value="openai">OpenAI</MenuItem>
                        <MenuItem value="anthropic" disabled>Anthropic (Bientôt)</MenuItem>
                        {/* <MenuItem value="mistral">Mistral</MenuItem> */}
                    </Select>
                 </FormControl>
                <TextField
                  label={t('settings.apiKeys.newKeyLabel')}
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
                   {loadingVerification ? <CircularProgress size={20}/> : t('settings.apiKeys.verifyButton')}
                      </Button>
                        <Button
                  variant="contained" 
                  onClick={handleAddApiKey}
                  disabled={!newApiKey}
                  sx={{ ml: 1 }}
                >
                  {t('settings.apiKeys.addButton')}
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
                     {verificationResult.valid && verificationResult.credits !== undefined && t('settings.apiKeys.verificationResult.credits', { credits: verificationResult.credits ?? 'N/A' })}
                 </Alert>
              )}

              <Typography variant="subtitle1" gutterBottom>{t('settings.apiKeys.registeredKeysTitle')}</Typography>
              {apiKeys.length === 0 ? (
                <Typography>{t('settings.apiKeys.noKeys')}</Typography>
              ) : (
                <List dense>
                  {apiKeys.map((key) => (
                    <ListItem key={key.provider} divider>
                      <ListItemIcon sx={{ minWidth: 36 }}><KeyIcon /></ListItemIcon>
                      <ListItemText 
                        primary={key.provider.toUpperCase()} 
                        secondary={t('settings.apiKeys.keySecondaryText', { lastKeyPart: key.key.slice(-4), date: formatDate(key.created_at) })}
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" onClick={(e) => handleOpenApiKeyMenu(e, key)} title={t('settings.apiKeys.deleteTooltip')}>
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
              <Typography variant="h6" gutterBottom>{t('settings.usageBilling.usageTitle')}</Typography>
              {loadingUsage ? (
                <CircularProgress />
              ) : usageStats ? (
                <Box sx={{ mb: 3 }}>
                    <Typography>{t('settings.usageBilling.freeRemaining')}: <strong>{usageStats.free_characters_remaining?.toLocaleString() || '0'}</strong></Typography>
                    <Typography>{t('settings.usageBilling.totalUsed')}: <strong>{usageStats.total_characters_used?.toLocaleString() || '0'}</strong></Typography>
                    <Typography>{t('settings.usageBilling.totalPurchased')}: <strong>{usageStats.total_characters_purchased?.toLocaleString() || '0'}</strong></Typography>
                </Box>
              ) : (
                 <Typography>{t('settings.usageBilling.loadingError')}</Typography>
              )}

              <Typography variant="h6" gutterBottom sx={{ mt: 3}}>{t('settings.usageBilling.transactionsTitle')}</Typography>
               {loadingUsage ? (
                 <CircularProgress />
               ) : transactions.length === 0 ? (
                 <Typography>{t('settings.usageBilling.noTransactions')}</Typography>
               ) : (
                 <List dense>
                   {transactions.map(tx => (
                     <ListItem key={tx.id} divider>
                       <ListItemText
                         primary={tx.description}
                         secondary={
                           t('settings.usageBilling.transactionItem', {
                             date: formatDate(tx.created_at),
                             amount: t('settings.usageBilling.transactionAmount', { prefix: tx.amount > 0 ? '+' : '', count: tx.amount }),
                             price: tx.total_price ? `(${tx.total_price.toFixed(2)}$)` : ''
                           })
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
              <Typography variant="h6" gutterBottom>{t('settings.security.title')}</Typography>
              {/* Section Changement de Mot de Passe */}
              <Box sx={{ mt: 3 }}>
                 <Typography variant="subtitle1" gutterBottom>{t('settings.security.changePasswordTitle')}</Typography>
                 <TextField
                   label={t('settings.security.currentPasswordLabel')}
                   type="password"
                   fullWidth
                   margin="normal"
                   value={currentPassword}
                   onChange={(e) => setCurrentPassword(e.target.value)}
                   error={!!passwordError}
                 />
                 <TextField
                   label={t('settings.security.newPasswordLabel')}
                   type="password"
                   fullWidth
                   margin="normal"
                   value={newPassword}
                   onChange={(e) => setNewPassword(e.target.value)}
                   error={!!passwordError}
                 />
                 <TextField
                   label={t('settings.security.confirmPasswordLabel')}
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
                   {changingPassword ? <CircularProgress size={24} /> : t('settings.security.changePasswordButton')}
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
                  {t('settings.security.dangerZoneTitle')}
                </Typography>
                        <Button
                  variant="contained" 
                          color="error"
                  onClick={() => setDeleteAccountConfirmOpen(true)}
                  disabled={deletingAccount}
                        >
                   {deletingAccount ? <CircularProgress size={24} color="inherit" /> : t('settings.security.deleteAccountButton')}
                        </Button>
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                  {t('settings.security.deleteAccountWarning')}
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
            {t('settings.apiKeys.deleteMenuLabel', { provider: apiKeyToDelete?.provider })}
          </MenuItem>
        </Menu>

         {/* Dialogue de confirmation de suppression */}
        <Dialog open={deleteConfirmOpen} onClose={closeDeleteConfirm}>
            <DialogTitle>{t('settings.apiKeys.deleteConfirmDialog.title')}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {t('settings.apiKeys.deleteConfirmDialog.text', { provider: apiKeyToDelete?.provider })}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={closeDeleteConfirm}>{t('common.cancel')}</Button>
                <Button onClick={handleDeleteApiKey} color="error">{t('common.delete')}</Button>
            </DialogActions>
        </Dialog>

         {/* Dialogue de confirmation de suppression de compte */}
        <Dialog open={deleteAccountConfirmOpen} onClose={() => setDeleteAccountConfirmOpen(false)}>
            <DialogTitle sx={{ bgcolor: 'error.main', color: 'error.contrastText' }}>
                {t('settings.security.deleteAccountConfirmDialog.title')}
            </DialogTitle>
            <DialogContent>
                <DialogContentText component="div" sx={{ mt: 2 }}>
                    <strong>{t('settings.security.deleteAccountConfirmDialog.warning')}</strong> {t('settings.security.deleteAccountConfirmDialog.irreversible')}
                    <br/>
                    {t('settings.security.deleteAccountConfirmDialog.lossDescription')}
                    <ul>
                        <li>{t('settings.security.deleteAccountConfirmDialog.lostItemProfile')}</li>
                        <li>{t('settings.security.deleteAccountConfirmDialog.lostItemProjects')}</li>
                        <li>{t('settings.security.deleteAccountConfirmDialog.lostItemContents')}</li>
                        <li>{t('settings.security.deleteAccountConfirmDialog.lostItemDatasets')}</li>
                        <li>{t('settings.security.deleteAccountConfirmDialog.lostItemModels')}</li>
                        <li>{t('settings.security.deleteAccountConfirmDialog.lostItemApiKeys')}</li>
                        <li>{t('settings.security.deleteAccountConfirmDialog.lostItemHistory')}</li>
                    </ul>
                    {t('settings.security.deleteAccountConfirmDialog.finalConfirm')}
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={() => setDeleteAccountConfirmOpen(false)} disabled={deletingAccount}>{t('common.cancel')}</Button>
                <Button 
                    onClick={handleDeleteAccount} 
                    color="error" 
                    variant="contained"
                    disabled={deletingAccount}
                    startIcon={deletingAccount ? <CircularProgress size={18} color="inherit" /> : null}
                >
                    {deletingAccount ? t('settings.security.deletingAccountButton') : t('settings.security.deleteAccountConfirmDialog.confirmButton')}
                </Button>
            </DialogActions>
        </Dialog>

    </Container>
    </PageTransition>
  );
};

export default SettingsPage; 