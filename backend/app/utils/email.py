from flask_mail import Message
from flask import current_app
from app import mail
import os


def get_frontend_url():
    return os.getenv('FRONTEND_URL', 'http://localhost:3000')


def send_email(to_email, subject, html_body, text_body):
    """
    Core email sender — all other functions call this.
    Returns True if sent, False if failed.
    """
    try:
        msg = Message(
            subject=subject,
            recipients=[to_email],
            html=html_body,
            body=text_body
        )
        mail.send(msg)
        print(f"✅ Email sent to {to_email} — {subject}")
        return True
    except Exception as e:
        print(f"❌ Email failed to {to_email} — {e}")
        return False


def email_header():
    return """
    <div style="background:#1e293b;padding:24px;border-radius:12px 12px 0 0;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;">📦 StockManager Pro</h1>
        <p style="color:#94a3b8;margin:6px 0 0;font-size:13px;">Inventory Management System</p>
    </div>
    """


def email_footer():
    return """
    <div style="background:#f8fafc;padding:14px;border-radius:0 0 12px 12px;
                text-align:center;border:1px solid #e2e8f0;border-top:none;">
        <p style="color:#94a3b8;font-size:11px;margin:0;">
            © 2025 StockManager Pro. All rights reserved.<br/>
            If you did not expect this email, you can safely ignore it.
        </p>
    </div>
    """


# ─────────────────────────────────────────────────────
# 1. SIGNUP — Welcome email after registration
# ─────────────────────────────────────────────────────
def send_welcome_email(to_email, full_name, role):
    login_link = f"{get_frontend_url()}/login"

    role_colors = {
        'merchant': '#7c3aed',
        'admin': '#2563eb',
        'clerk': '#059669',
    }
    color = role_colors.get(role, '#1e293b')

    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        {email_header()}

        <div style="background:#fff;padding:32px;border:1px solid #e2e8f0;border-top:none;">
            <h2 style="color:#1e293b;margin:0 0 16px;">Welcome to StockManager Pro! 🎉</h2>

            <p style="color:#475569;font-size:15px;line-height:1.7;">
                Hi <strong>{full_name}</strong>, your account has been created successfully.
            </p>

            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;
                        padding:16px;margin:20px 0;">
                <table style="width:100%;font-size:14px;">
                    <tr>
                        <td style="color:#64748b;padding:4px 0;">Name</td>
                        <td style="color:#1e293b;font-weight:600;text-align:right;">{full_name}</td>
                    </tr>
                    <tr>
                        <td style="color:#64748b;padding:4px 0;">Email</td>
                        <td style="color:#1e293b;font-weight:600;text-align:right;">{to_email}</td>
                    </tr>
                    <tr>
                        <td style="color:#64748b;padding:4px 0;">Role</td>
                        <td style="text-align:right;">
                            <span style="background:{color};color:#fff;padding:3px 10px;
                                         border-radius:20px;font-size:12px;font-weight:600;">
                                {role.capitalize()}
                            </span>
                        </td>
                    </tr>
                </table>
            </div>

            <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;
                        padding:14px;margin:20px 0;">
                <p style="color:#15803d;margin:0;font-size:13px;line-height:1.6;">
                    ✅ Your account is active and ready to use.<br/>
                    ✅ Login with the email and password you just created.<br/>
                    ✅ You will be directed to your {role.capitalize()} dashboard.
                </p>
            </div>

            <div style="text-align:center;margin:28px 0;">
                <a href="{login_link}"
                   style="background:#1e293b;color:#fff;padding:13px 32px;
                          border-radius:8px;text-decoration:none;font-size:15px;
                          font-weight:600;display:inline-block;">
                    Go to Login →
                </a>
            </div>
        </div>

        {email_footer()}
    </div>
    """

    text = f"""
    Welcome to StockManager Pro, {full_name}!

    Your account has been created successfully.
    Name: {full_name}
    Email: {to_email}
    Role: {role.capitalize()}

    Login here: {login_link}
    """

    return send_email(to_email, 'Welcome to StockManager Pro ✅', html, text)


# ─────────────────────────────────────────────────────
# 2. INVITE — Email sent when admin/clerk is invited
# ─────────────────────────────────────────────────────
def send_invite_email(to_email, invite_token, role):
    invite_link = f"{get_frontend_url()}/register?token={invite_token}"

    role_colors = {
        'admin': '#2563eb',
        'clerk': '#059669',
    }
    color = role_colors.get(role, '#1e293b')

    role_descriptions = {
        'admin': 'manage products, inventory entries, and approve supply requests.',
        'clerk': 'record daily inventory entries and submit supply requests.',
    }
    description = role_descriptions.get(role, 'access the inventory system.')

    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        {email_header()}

        <div style="background:#fff;padding:32px;border:1px solid #e2e8f0;border-top:none;">
            <h2 style="color:#1e293b;margin:0 0 16px;">You have been invited! ✉️</h2>

            <p style="color:#475569;font-size:15px;line-height:1.7;">
                You have been invited to join <strong>StockManager Pro</strong> as a
                <span style="background:{color};color:#fff;padding:3px 10px;
                             border-radius:20px;font-size:13px;font-weight:600;">
                    {role.capitalize()}
                </span>
            </p>

            <p style="color:#475569;font-size:14px;line-height:1.7;">
                As a <strong>{role.capitalize()}</strong> you will be able to {description}
            </p>

            <div style="background:#fef9c3;border:1px solid #fde047;border-radius:8px;
                        padding:14px;margin:20px 0;">
                <p style="color:#713f12;margin:0;font-size:13px;">
                    ⏰ <strong>This invite link expires in 24 hours.</strong>
                    Please complete your registration before then.
                </p>
            </div>

            <div style="text-align:center;margin:28px 0;">
                <a href="{invite_link}"
                   style="background:{color};color:#fff;padding:13px 32px;
                          border-radius:8px;text-decoration:none;font-size:15px;
                          font-weight:600;display:inline-block;">
                    Complete Registration →
                </a>
            </div>

            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;
                        padding:14px;margin:20px 0;">
                <p style="color:#64748b;margin:0 0 6px;font-size:12px;font-weight:600;">
                    Can't click the button? Copy this link into your browser:
                </p>
                <p style="color:#2563eb;font-size:12px;margin:0;word-break:break-all;">
                    {invite_link}
                </p>
            </div>

            <div style="background:#f0f9ff;border:1px solid #93c5fd;border-radius:8px;
                        padding:14px;margin:20px 0;">
                <p style="color:#1d4ed8;margin:0;font-size:13px;line-height:1.6;">
                    📋 <strong>What happens next:</strong><br/>
                    1. Click the button above<br/>
                    2. Enter your full name and choose a password<br/>
                    3. Login and start using StockManager Pro
                </p>
            </div>
        </div>

        {email_footer()}
    </div>
    """

    text = f"""
    You have been invited to join StockManager Pro as {role.capitalize()}.

    Complete your registration here (expires in 24 hours):
    {invite_link}

    Steps:
    1. Click the link above
    2. Enter your full name and password
    3. Login and start using the system
    """

    return send_email(
        to_email,
        f'You are invited to StockManager Pro as {role.capitalize()} ✉️',
        html,
        text
    )


# ─────────────────────────────────────────────────────
# 3. LOGIN — Notify user when they log in
# ─────────────────────────────────────────────────────
def send_login_notification(to_email, full_name, role):
    from datetime import datetime
    login_time = datetime.utcnow().strftime('%B %d, %Y at %I:%M %p UTC')

    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        {email_header()}

        <div style="background:#fff;padding:32px;border:1px solid #e2e8f0;border-top:none;">
            <h2 style="color:#1e293b;margin:0 0 16px;">New Login Detected 🔐</h2>

            <p style="color:#475569;font-size:15px;line-height:1.7;">
                Hi <strong>{full_name}</strong>, we noticed a new login to your
                StockManager Pro account.
            </p>

            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;
                        padding:16px;margin:20px 0;">
                <table style="width:100%;font-size:14px;">
                    <tr>
                        <td style="color:#64748b;padding:5px 0;">Account</td>
                        <td style="color:#1e293b;font-weight:600;text-align:right;">{to_email}</td>
                    </tr>
                    <tr>
                        <td style="color:#64748b;padding:5px 0;">Role</td>
                        <td style="color:#1e293b;font-weight:600;text-align:right;">{role.capitalize()}</td>
                    </tr>
                    <tr>
                        <td style="color:#64748b;padding:5px 0;">Time</td>
                        <td style="color:#1e293b;font-weight:600;text-align:right;">{login_time}</td>
                    </tr>
                </table>
            </div>

            <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;
                        padding:14px;margin:20px 0;">
                <p style="color:#15803d;margin:0;font-size:13px;">
                    ✅ If this was you, no action needed. You are good to go!
                </p>
            </div>

            <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;
                        padding:14px;margin:20px 0;">
                <p style="color:#991b1b;margin:0;font-size:13px;line-height:1.6;">
                    ⚠️ <strong>Was this NOT you?</strong><br/>
                    If you did not log in just now, your account may be compromised.
                    Contact your administrator immediately and change your password.
                </p>
            </div>
        </div>

        {email_footer()}
    </div>
    """

    text = f"""
    New login detected on your StockManager Pro account.

    Account: {to_email}
    Role: {role.capitalize()}
    Time: {login_time}

    If this was you — no action needed.
    If this was NOT you — contact your administrator immediately.
    """

    return send_email(
        to_email,
        'New Login to Your StockManager Pro Account 🔐',
        html,
        text
    )