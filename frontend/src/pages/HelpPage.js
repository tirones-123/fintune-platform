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
import { useTranslation } from 'react-i18next';

function HelpPage() {
  const { t } = useTranslation();

  return (
    <PageTransition>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
          <HelpOutlineIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> {t('helpPage.title')}
        </Typography>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            {t('helpPage.howItWorks.title')}
          </Typography>
          <Typography paragraph>
            {t('helpPage.howItWorks.intro')}
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary={t('helpPage.howItWorks.step1.title')} secondary={t('helpPage.howItWorks.step1.desc')} />
            </ListItem>
            <ListItem>
              <ListItemText primary={t('helpPage.howItWorks.step2.title')} secondary={t('helpPage.howItWorks.step2.desc')} />
            </ListItem>
            <ListItem>
              <ListItemText primary={t('helpPage.howItWorks.step3.title')} secondary={t('helpPage.howItWorks.step3.desc')} />
            </ListItem>
            <ListItem>
              <ListItemText primary={t('helpPage.howItWorks.step4.title')} secondary={t('helpPage.howItWorks.step4.desc')} />
            </ListItem>
            <ListItem>
              <ListItemText primary={t('helpPage.howItWorks.step5.title')} secondary={t('helpPage.howItWorks.step5.desc')} />
            </ListItem>
          </List>
          
          <Box sx={{ mt: 3, mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
              <YouTubeIcon color="error" fontSize="small" sx={{ mr: 1 }} /> {t('helpPage.howItWorks.videoTitle')}
            </Typography>
            <Box sx={{ 
              position: 'relative',
              width: '100%',
              paddingTop: '56.25%', /* Ratio 16:9 pour le conteneur */
              backgroundColor: '#f5f5f5',
              borderRadius: 1,
              overflow: 'hidden',
              mb: 2
            }}>
              <iframe
                style={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
                src="https://youtu.be/tfpDBGMgEpU"
                title={t('helpPage.howItWorks.videoIframeTitle')}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </Box>
          </Box>
          
          <Typography paragraph>
            {t('helpPage.howItWorks.conclusion')}
          </Typography>
        </Paper>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom>
            <IntegrationInstructionsIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> {t('helpPage.integration.title')}
          </Typography>
          <Typography paragraph>
            {t('helpPage.integration.intro')}
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              <ApiIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> {t('helpPage.integration.viaFinetunerApi.title')}
            </Typography>
            <Typography paragraph>
              {t('helpPage.integration.viaFinetunerApi.description')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('helpPage.integration.viaFinetunerApi.status')}
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('helpPage.integration.viaProviderApi.title')}
            </Typography>
            <Typography paragraph>
              {t('helpPage.integration.viaProviderApi.description')}
            </Typography>
            <Typography paragraph>
              {t('helpPage.integration.viaProviderApi.exampleTitle')}
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'action.hover', borderRadius: 1, overflowX: 'auto' }}>
              <pre><code>
{t('helpPage.integration.viaProviderApi.codeExample')}
              </code></pre>
            </Paper>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {t('helpPage.integration.viaProviderApi.docsLinkText')} <Link href="https://platform.openai.com/docs/api-reference/completions/create" target="_blank" rel="noopener noreferrer">{t('helpPage.integration.viaProviderApi.openaiApiLink')}</Link> {t('helpPage.integration.viaProviderApi.forMoreDetails')}
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box>
            <Typography variant="h6" gutterBottom>
              {t('helpPage.integration.viaAutomation.title')}
            </Typography>
            <Typography paragraph>
              {t('helpPage.integration.viaAutomation.description1')}
            </Typography>
            <Typography paragraph>
              {t('helpPage.integration.viaAutomation.description2')}
            </Typography>
            <Typography paragraph>
              {t('helpPage.integration.viaAutomation.description3')}
            </Typography>
            <Typography variant="body2">
              {t('helpPage.integration.viaAutomation.docsNote')}
            </Typography>
          </Box>
        </Paper>
      </Container>
    </PageTransition>
  );
}

export default HelpPage; 