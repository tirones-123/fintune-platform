import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from jinja2 import Environment, FileSystemLoader, select_autoescape
import logging
import os
from pathlib import Path

from app.core.config import settings

logger = logging.getLogger(__name__)

# Configure Jinja2 environment
template_dir = Path(__file__).parent.parent / "templates" / "emails"
logger.info(f"Email template directory path: {template_dir}")
if not template_dir.exists():
    logger.warning(f"Email template directory not found: {template_dir}")
    # Optionally create the directory
    # template_dir.mkdir(parents=True, exist_ok=True) 
    
try:
    env = Environment(
        loader=FileSystemLoader(template_dir),
        autoescape=select_autoescape(['html', 'xml'])
    )
    logger.info("Jinja2 environment initialized successfully")
    templates = env.list_templates()
    logger.info(f"Available templates: {templates}")
except Exception as e:
    logger.error(f"Failed to initialize Jinja2 environment at {template_dir}: {e}")
    env = None # Ensure env is None if initialization fails

def render_template(template_name: str, **context) -> str:
    """Renders a Jinja2 email template."""
    if not env:
        logger.error("Jinja2 environment not initialized. Cannot render email template.")
        # Fallback to a very basic text representation
        return f"Subject: {context.get('subject', 'Notification')}\\n\\n{context.get('notification_message', 'You have a new notification.')}"

    try:
        logger.info(f"Attempting to load template: {template_name}")
        template = env.get_template(template_name)
        logger.info(f"Template loaded successfully: {template_name}")
        rendered = template.render(**context)
        logger.debug(f"Template rendered with context keys: {list(context.keys())}")
        # Log the first 200 chars of the rendered HTML to verify content
        logger.debug(f"First 200 chars of rendered content: {rendered[:200]}...")
        return rendered
    except Exception as e:
        logger.error(f"Error rendering template {template_name}: {e}")
        # Fallback to basic text representation on template error
        return f"Subject: {context.get('subject', 'Notification')}\\n\\n{context.get('notification_message', 'Error rendering email template.')}"

def send_email(
    to_email: str,
    subject: str,
    html_content: str
) -> bool:
    """Sends an email using configured SMTP settings."""
    
    # Check if SMTP is configured
    if not all([settings.SMTP_HOST, settings.SMTP_USER, settings.SMTP_PASSWORD]):
        logger.warning("SMTP settings not fully configured. Skipping email sending.")
        # Consider raising an error or returning a specific status if email is critical
        return False 

    sender_email = settings.SMTP_SENDER_EMAIL
    sender_name = settings.SMTP_SENDER_NAME
    password = settings.SMTP_PASSWORD

    # Create message container
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = f"{sender_name} <{sender_email}>"
    msg['To'] = to_email

    # Attach HTML part
    part = MIMEText(html_content, 'html')
    msg.attach(part)
    
    # Also attach a text version as fallback
    text_content = "This is a HTML email. If you see this plain text, your email client does not support HTML emails."
    text_part = MIMEText(text_content, 'plain')
    msg.attach(text_part)

    try:
        # Connect using SMTP_SSL for port 465
        logger.info(f"Connecting to SMTP server {settings.SMTP_HOST}:{settings.SMTP_PORT}")
        with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            logger.info(f"Logging in as {settings.SMTP_USER}")
            server.login(settings.SMTP_USER, password)
            logger.info(f"Sending email to {to_email} with subject '{subject}'")
            server.sendmail(sender_email, to_email, msg.as_string())
            logger.info("Email sent successfully.")
        return True
    except smtplib.SMTPAuthenticationError as e:
        logger.error(f"SMTP Authentication failed for user {settings.SMTP_USER}: {e}")
        return False
    except smtplib.SMTPException as e:
        logger.error(f"SMTP error occurred: {e}")
        return False
    except Exception as e:
        logger.error(f"An unexpected error occurred during email sending: {e}", exc_info=True)
        return False

# Example usage (can be called from a Celery task)
def send_notification_email(
    user_email: str, 
    user_name: str, 
    notification_message: str, 
    notification_type: str = "info"
):
    """Helper to render and send a standard notification email."""
    subject_prefix_map = {
        "success": "✅ Success:",
        "error": "❌ Error:",
        "warning": "⚠️ Warning:",
        "info": "ℹ️ Info:",
    }
    subject_prefix = subject_prefix_map.get(notification_type, "ℹ️ Info:")
    subject = f"{subject_prefix} FinTune Platform Notification"
    
    # Define context for the template
    context = {
        "subject": subject,
        "user_name": user_name,
        "notification_message": notification_message,
        "notification_type": notification_type,
        "platform_url": settings.FRONTEND_URL,
        "platform_name": settings.PROJECT_NAME,
        "logo_url": "https://drive.google.com/uc?export=view&id=1oOmEJx6NPITtgO_TOArsOJs1aekCV1bJ"
        # Add more context if needed, e.g., link to related object
    }
    
    logger.info(f"Rendering email template with context: {context}")
    
    # Render the HTML content
    html_body = render_template("notification_email.html", **context)
    
    # Send the email
    success = send_email(
        to_email=user_email,
        subject=subject,
        html_content=html_body
    )
    return success 