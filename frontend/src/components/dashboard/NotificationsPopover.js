import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { formatDistanceToNowStrict } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import {
  Box,
  List,
  Badge,
  Button,
  Avatar,
  Tooltip,
  Divider,
  Popover,
  Typography,
  IconButton,
  ListItemText,
  ListSubheader,
  ListItemAvatar,
  ListItemButton,
  CircularProgress,
  Link
} from '@mui/material';
import {
  NotificationsNone as NotificationsIcon,
  DoneAll as DoneAllIcon,
  AccessTime as ClockIcon,
  MailOutline as MailIcon, // Exemple
  ErrorOutline as ErrorIcon, // Exemple
  CheckCircleOutline as SuccessIcon, // Exemple
  InfoOutlined as InfoIcon, // Exemple
  WarningAmberOutlined as WarningIcon, // Exemple
  Psychology as FineTuningIcon // Exemple pour fine-tuning
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Fonction pour choisir une icône basée sur le type de notification
function renderContent(notification) {
  const title = (
    <Typography variant="subtitle2">
      {/* Pourrait contenir un titre/sujet basé sur la notif */}
      <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>
        &nbsp; {notification.message}
      </Typography>
    </Typography>
  );

  let avatar;
  switch (notification.type) {
    case 'success':
      avatar = <SuccessIcon sx={{ color: 'success.main' }} />;
      break;
    case 'error':
      avatar = <ErrorIcon sx={{ color: 'error.main' }} />;
      break;
    case 'warning':
      avatar = <WarningIcon sx={{ color: 'warning.main' }} />;
      break;
     case 'fine_tuning':
       avatar = <FineTuningIcon sx={{ color: 'info.main' }} />;
       break;
    default:
      avatar = <InfoIcon sx={{ color: 'info.main'}} />;
  }

  return {
    avatar: <ListItemAvatar><Avatar sx={{ bgcolor: 'background.neutral' }}>{avatar}</Avatar></ListItemAvatar>,
    title,
  };
}

export default function NotificationsPopover({ notifications = [], totalUnread, onMarkAllAsRead, onMarkOneAsRead, isLoading }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [open, setOpen] = useState(null);

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
    // Mark all notifications as read when opening the popover
    if (onMarkAllAsRead) {
      onMarkAllAsRead();
    }
  };

  const handleClose = () => {
    setOpen(null);
  };

  const handleMarkAllRead = () => {
    if (onMarkAllAsRead) onMarkAllAsRead();
  };

  // Gérer le clic sur une notification
  const handleNotificationClick = (notification) => {
    if (onMarkOneAsRead) {
        onMarkOneAsRead(notification.id);
    }
    // Optionnel: Naviguer si la notification est liée à un objet
    if (notification.related_type === 'fine_tuning' && notification.related_id) {
        navigate(`/dashboard/fine-tuning/${notification.related_id}`);
    } else if (notification.related_type === 'project' && notification.related_id) {
         navigate(`/dashboard/projects/${notification.related_id}`);
    }
    handleClose(); // Fermer le popover après clic
  };

  return (
    <>
      <Tooltip title={t('notifications.tooltip')}>
        <IconButton color={open ? 'primary' : 'default'} onClick={handleOpen}>
          <Badge badgeContent={totalUnread} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={!!open}
        anchorEl={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            mt: 1.5,
            ml: 0.75,
            width: 360,
            maxHeight: '80vh',
            overflow: 'auto'
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', py: 2, px: 2.5 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">{t('notifications.title')}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {t('notifications.unreadCount', { count: totalUnread })}
            </Typography>
          </Box>

          {totalUnread > 0 && (
            <Tooltip title={t('notifications.markAllReadTooltip')}>
              <IconButton color="primary" onClick={handleMarkAllRead}>
                <DoneAllIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        {isLoading ? (
          <Box sx={{ p: 2, textAlign: 'center' }}><CircularProgress size={24} /></Box>
        ) : notifications.length === 0 ? (
            <Typography sx={{ p: 2, color: 'text.secondary' }}>{t('notifications.noNotifications')}</Typography>
        ) : (
          <List
            disablePadding
            subheader=
              <ListSubheader disableSticky sx={{ py: 1, px: 2.5, typography: 'overline' }}>
                {t('notifications.newSubheader')}
              </ListSubheader>
          >
            {notifications.map((notification) => (
              <NotificationItem 
                key={notification.id} 
                notification={notification} 
                onClick={() => handleNotificationClick(notification)} 
              />
            ))}
          </List>
        )}
      </Popover>
    </>
  );
}

NotificationsPopover.propTypes = {
  notifications: PropTypes.array,
  totalUnread: PropTypes.number,
  onMarkAllAsRead: PropTypes.func,
  onMarkOneAsRead: PropTypes.func,
  isLoading: PropTypes.bool,
};

// ----------------------------------------------------------------------

function NotificationItem({ notification, onClick }) {
  const { avatar, title } = renderContent(notification);

  return (
    <ListItemButton
      onClick={onClick}
      sx={{
        py: 1.5,
        px: 2.5,
        mt: '1px',
        ...(!notification.is_read && {
          bgcolor: 'action.selected',
        }),
      }}
    >
      {avatar}
      <ListItemText
        primary={title}
        secondary=
          <Typography
            variant="caption"
            sx={{
              mt: 0.5,
              display: 'flex',
              alignItems: 'center',
              color: 'text.disabled',
            }}
          >
            <ClockIcon sx={{ mr: 0.5, width: 16, height: 16 }} />
            {formatDistanceToNowStrict(new Date(notification.created_at), { addSuffix: true, locale: fr })}
          </Typography>
      />
    </ListItemButton>
  );
}

NotificationItem.propTypes = {
  notification: PropTypes.object,
  onClick: PropTypes.func,
};
