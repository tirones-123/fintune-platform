import React from 'react';
import { Box, Breadcrumbs, Container, Link, Typography } from '@mui/material';
import { Link as RouterLink, useParams } from 'react-router-dom';
import FileUpload from '../components/content/FileUpload';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const ContentUploadPage = () => {
  const { projectId } = useParams();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link component={RouterLink} to="/dashboard" color="inherit">
          Dashboard
        </Link>
        <Link component={RouterLink} to="/dashboard/projects" color="inherit">
          Projets
        </Link>
        {projectId && (
          <Link component={RouterLink} to={`/dashboard/projects/${projectId}`} color="inherit">
            Détails du projet
          </Link>
        )}
        <Typography color="text.primary">Importer du contenu</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Importer du contenu
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Importez des fichiers ou des liens YouTube pour créer votre dataset de fine-tuning.
        </Typography>
      </Box>

      <FileUpload projectId={projectId} />
    </Container>
  );
};

export default ContentUploadPage; 