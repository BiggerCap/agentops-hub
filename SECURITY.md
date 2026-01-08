# Security Policy

## Supported Versions

This is a portfolio/demonstration project. Security updates are provided on a best-effort basis.

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| < 2.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in AgentOps Hub, please follow these steps:

1. **Do NOT** open a public GitHub issue
2. Email the details to the repository maintainer (or open a private security advisory on GitHub)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Security Best Practices for Deployment

### Environment Variables
- **NEVER** commit `.env` files to version control
- Use strong, randomly generated secrets for `SECRET_KEY`
- Generate SECRET_KEY: `python -c "import secrets; print(secrets.token_hex(32))"`
- Rotate API keys regularly

### OpenAI API Keys
- Store securely in environment variables
- Set usage limits in OpenAI dashboard
- Monitor API usage for anomalies
- Use separate keys for development and production

### Database Security
- Use strong database passwords
- Don't expose PostgreSQL/Qdrant ports publicly
- Enable SSL/TLS for production databases
- Regular backups

### JWT Tokens
- Use strong SECRET_KEY (minimum 32 bytes)
- Set appropriate token expiration times
- Implement token refresh mechanisms
- Store tokens securely in httpOnly cookies (not localStorage for production)

### CORS Configuration
- Restrict CORS to specific origins in production
- Never use `allow_origins=["*"]` in production
- Configure proper CORS headers

### User Data
- All user data is isolated by user_id
- Passwords are hashed with bcrypt
- Use parameterized queries (ORM) to prevent SQL injection

### File Uploads
- Validate file types and sizes
- Scan uploaded files for malware
- Store uploads outside web root
- Set appropriate file permissions

## Known Limitations

1. **Development Mode**: The project uses development configurations by default
2. **No Rate Limiting**: API endpoints don't have rate limiting (add in production)
3. **localStorage Tokens**: Frontend stores JWT in localStorage (use httpOnly cookies for production)
4. **No CSRF Protection**: Add CSRF tokens for production deployment
5. **File Upload Validation**: Basic validation only (enhance for production)

## Recommendations for Production

- [ ] Implement rate limiting (e.g., slowapi, nginx)
- [ ] Add CSRF protection
- [ ] Use httpOnly cookies for tokens
- [ ] Enable HTTPS/TLS
- [ ] Set up monitoring and alerting
- [ ] Implement audit logging
- [ ] Add input sanitization
- [ ] Set up WAF (Web Application Firewall)
- [ ] Regular dependency updates
- [ ] Security scanning in CI/CD pipeline

## Dependencies

Keep dependencies up to date to avoid known vulnerabilities:

```bash
# Backend
pip list --outdated
pip install -U <package>

# Frontend
npm audit
npm audit fix
npm update
```

## Contact

For security concerns, please contact the repository maintainer through GitHub.

---

Last Updated: January 2026
