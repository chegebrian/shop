import re

def validate_email(email):
    """Accept any valid email format — Gmail, Yahoo, Outlook, custom domains"""
    if not email or not isinstance(email, str):
        return False
    # Standard email regex that accepts all providers
    pattern = r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email.strip()) is not None

def validate_password(password):
    """Password must be at least 6 characters"""
    return bool(password) and len(password) >= 6

def validate_required_fields(data, fields):
    """Check all required fields are present and not empty"""
    if not data:
        return fields
    missing = []
    for field in fields:
        if field not in data or data[field] is None or str(data[field]).strip() == '':
            missing.append(field)
    return missing