# Security Improvements for Production

This document outlines recommended security improvements for the Ocho Hair Lab website before production deployment.

## Current Security Status

The application currently uses basic authentication mechanisms suitable for development but should be enhanced for production.

### Current Implementation

1. **Authentication**: Client-side session storage for admin login
2. **Passwords**: Plain text storage in SQLite database
3. **API**: Basic CORS protection, no rate limiting
4. **HTTPS**: Not configured by default

## Recommended Improvements

### 1. Password Hashing

**Current**: Passwords stored in plain text in database
**Risk**: If database is compromised, all passwords are exposed
**Solution**: Implement bcrypt password hashing

```bash
# Install bcrypt
cd server
npm install bcrypt
```

Update `server/index.js`:

```javascript
import bcrypt from 'bcrypt';

// When creating account
const hashedPassword = await bcrypt.hash(password, 10);

// When verifying login
const isValid = await bcrypt.compare(password, user.password);
```

### 2. JWT Authentication

**Current**: sessionStorage admin flag (client-side only)
**Risk**: Can be manipulated by client
**Solution**: Use JWT tokens validated server-side

```bash
cd server
npm install jsonwebtoken
```

Add middleware in `server/index.js`:

```javascript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret';

// Login endpoint generates JWT
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  // Verify credentials...
  const token = jwt.sign({ username, isAdmin: true }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token });
});

// Middleware to protect routes
function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Use on protected routes
app.get('/api/admin/appointments', authenticateToken, (req, res) => {
  // Only accessible with valid JWT
});
```

### 3. HTTPS (SSL/TLS)

**Current**: HTTP only
**Risk**: Data transmitted in plain text
**Solution**: Use Let's Encrypt SSL certificates

This is covered in `DEPLOYMENT.md` Step 7, but is **critical** for production:

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is set up automatically
```

### 4. Rate Limiting

**Current**: No rate limiting
**Risk**: API abuse, brute force attacks
**Solution**: Add rate limiting middleware

```bash
cd server
npm install express-rate-limit
```

Update `server/index.js`:

```javascript
import rateLimit from 'express-rate-limit';

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Stricter limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // only 5 login attempts per 15 minutes
  message: 'Too many login attempts, please try again later.'
});

app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);
```

### 5. Input Validation

**Current**: Basic validation in frontend only
**Risk**: SQL injection, XSS attacks
**Solution**: Server-side validation with zod or joi

```bash
cd server
npm install zod
```

Example validation:

```javascript
import { z } from 'zod';

const appointmentSchema = z.object({
  customerName: z.string().min(2).max(100),
  customerEmail: z.string().email(),
  customerPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  date: z.string().datetime(),
  // ... other fields
});

app.post('/api/appointments', (req, res) => {
  try {
    const validatedData = appointmentSchema.parse(req.body);
    // Process validated data...
  } catch (error) {
    res.status(400).json({ error: 'Invalid input' });
  }
});
```

### 6. Environment Variables

**Current**: .env file with credentials
**Risk**: Credentials in repository
**Solution**: Use proper secrets management

For production:

```bash
# Never commit .env to git (already in .gitignore)

# Use environment variables on server
export JWT_SECRET="your-random-secret-here"
export DB_ENCRYPTION_KEY="another-secret"

# Or use systemd environment file
sudo nano /etc/systemd/system/ocho-backend.service

[Service]
EnvironmentFile=/etc/ocho-hair-lab/secrets.env
```

### 7. Database Encryption

**Current**: SQLite database unencrypted
**Risk**: If database file is accessed, all data is readable
**Solution**: Use SQLCipher for encrypted SQLite

```bash
cd server
npm install better-sqlite3 @journeyapps/sqlcipher
```

### 8. Security Headers

Add security headers to nginx configuration:

```nginx
# Add to /etc/nginx/sites-available/ocho-hair-lab

add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
```

### 9. CORS Configuration

Update CORS to be more restrictive in production:

```javascript
// server/index.js
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.com' 
    : 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

### 10. Audit Logging

Add logging for security-relevant events:

```javascript
// server/index.js
const auditLog = (event, details) => {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    event,
    ...details
  }));
};

// Log important events
app.post('/api/auth/login', async (req, res) => {
  const { username } = req.body;
  // ... login logic
  if (success) {
    auditLog('LOGIN_SUCCESS', { username });
  } else {
    auditLog('LOGIN_FAILED', { username, ip: req.ip });
  }
});
```

## Priority Implementation Order

For production deployment, implement in this order:

### Critical (Must-Have)
1. ✅ **HTTPS** - Already documented in DEPLOYMENT.md
2. 🔴 **Password Hashing** - Prevents credential exposure
3. 🔴 **JWT Authentication** - Secure admin authentication

### High Priority (Should-Have)
4. 🟠 **Rate Limiting** - Prevents abuse and attacks
5. 🟠 **Input Validation** - Prevents injection attacks
6. 🟠 **Security Headers** - Browser security

### Medium Priority (Nice-to-Have)
7. 🟡 **Database Encryption** - Additional data protection
8. 🟡 **Audit Logging** - Security monitoring
9. 🟡 **CORS Restriction** - API access control

## Quick Implementation Script

For rapid production hardening:

```bash
#!/bin/bash
# security-upgrade.sh

cd server

# Install security packages
npm install bcrypt jsonwebtoken express-rate-limit zod

echo "✅ Security packages installed"
echo ""
echo "Next steps:"
echo "1. Update server/index.js with bcrypt password hashing"
echo "2. Implement JWT authentication middleware"
echo "3. Add rate limiting to all routes"
echo "4. Add input validation with zod schemas"
echo "5. Configure HTTPS with certbot"
echo ""
echo "See SECURITY.md for detailed implementation examples"
```

## Testing Security

### Password Strength
```bash
# Test password hashing
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"weak"}'
# Should reject weak passwords
```

### Rate Limiting
```bash
# Test rate limiting
for i in {1..10}; do
  curl http://localhost:3001/api/health
done
# Should block after threshold
```

### HTTPS
```bash
# Test SSL
curl -I https://your-domain.com
# Should return 200 OK with SSL certificate info
```

## Compliance Considerations

If storing customer payment information:
- **PCI DSS** compliance required
- Consider using Stripe/PayPal instead of storing cards
- Regular security audits needed

If storing health information:
- **HIPAA** compliance may be required
- Enhanced encryption needed
- Access logging mandatory

## Security Checklist

Before going live:

- [ ] HTTPS enabled with valid certificate
- [ ] All passwords hashed with bcrypt
- [ ] JWT authentication implemented
- [ ] Rate limiting active
- [ ] Input validation on all endpoints
- [ ] Security headers configured
- [ ] Default passwords changed
- [ ] .env file not in git
- [ ] Database backups encrypted
- [ ] Firewall configured (only 22, 80, 443)
- [ ] SSH key authentication only (no password)
- [ ] Regular security updates scheduled
- [ ] Audit logging implemented
- [ ] CORS properly configured
- [ ] Tested for common vulnerabilities

## Resources

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Node.js Security Best Practices: https://nodejs.org/en/docs/guides/security/
- Express.js Security: https://expressjs.com/en/advanced/best-practice-security.html
- Let's Encrypt: https://letsencrypt.org/

## Support

For security concerns or questions:
- Review this document thoroughly
- Check OWASP guidelines
- Consider hiring a security consultant for audit
- Keep all packages updated: `npm audit fix`

---

**Note**: The current implementation prioritizes functionality and ease of setup. The improvements listed here are recommended but not required for basic operation. Implement based on your security requirements and threat model.
