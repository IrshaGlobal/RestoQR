# Security Guide for Restaurant QR Ordering App

This document outlines the security measures implemented in this application and provides guidance for secure deployment.

## Security Features Implemented

### 1. Input Validation & Sanitization
- **XSS Protection**: All user inputs are sanitized using HTML entity encoding
- **Email Validation**: Email addresses are validated before submission
- **Price Validation**: Prices must be positive numbers with max 2 decimal places (0-99999.99)
- **Quantity Validation**: Quantities must be positive integers (1-99)
- **Length Limits**: Text inputs have character limits to prevent abuse
- **UUID Validation**: Restaurant and table IDs are validated as proper UUIDs

### 2. Rate Limiting
Rate limiting is implemented client-side to prevent abuse:

- **Orders**: Maximum 3 orders per table per minute
- **Help Requests**: Maximum 2 help requests per table per 5 minutes
- **Login Attempts**: Account lockout after multiple failed attempts (handled by Supabase Auth)

**Note**: For production, implement server-side rate limiting using Supabase Edge Functions or a reverse proxy like Cloudflare.

### 3. Secure Order Numbers
- Order numbers are generated using cryptographically secure random values (`crypto.getRandomValues`)
- 6-digit format ensures uniqueness while remaining readable
- Not based on timestamps or sequential patterns

### 4. Authentication & Authorization
- **Supabase Auth**: Industry-standard authentication provider
- **Role-Based Access Control (RBAC)**: Admin and Staff roles with different permissions
- **Row Level Security (RLS)**: Database-level access control policies
- **Session Management**: Automatic token refresh and secure session handling

### 5. Data Protection
- **Environment Variables**: Sensitive configuration stored in `.env` (gitignored)
- **HTTPS Only**: Supabase connections use encrypted HTTPS
- **Storage Security**: Menu images require authentication for upload
- **SQL Injection Prevention**: Supabase query builder uses parameterized queries

### 6. Error Handling
- Generic error messages that don't reveal system internals
- Detailed errors logged to console for debugging (not shown to users)
- Rollback mechanisms for failed database operations

## Deployment Checklist

### Before Deploying to Production

1. **Update Environment Variables**
   ```bash
   # Create a new .env file with your production credentials
   cp .env.example .env
   # Edit .env with your actual Supabase credentials
   ```

2. **Configure Supabase RLS Policies**
   - Ensure all tables have Row Level Security enabled
   - Test policies with different user roles
   - Verify customers can only create (not read/update/delete) orders

3. **Enable Supabase Auth Email Confirmation**
   - Go to Supabase Dashboard > Authentication > Settings
   - Enable "Confirm email" to prevent fake accounts

4. **Set Up Custom Domain (Optional but Recommended)**
   - Use Vercel, Netlify, or similar for custom domain
   - Enables HTTPS automatically

5. **Configure CORS**
   - In Supabase Dashboard, restrict allowed origins to your domain
   - Prevents unauthorized websites from using your API

6. **Enable Audit Logging**
   - Monitor database changes in Supabase Dashboard
   - Set up alerts for suspicious activity

7. **Backup Strategy**
   - Enable automatic backups in Supabase
   - Test restore procedures regularly

8. **Monitor Rate Limits**
   - Consider implementing server-side rate limiting
   - Use Cloudflare or similar CDN for DDoS protection

## Security Best Practices

### For Administrators

1. **Strong Passwords**
   - Use passwords with at least 12 characters
   - Include uppercase, lowercase, numbers, and symbols
   - Never reuse passwords across services

2. **Staff Account Management**
   - Remove access immediately when staff leaves
   - Use individual accounts (no shared credentials)
   - Regularly audit staff list

3. **Regular Updates**
   - Keep dependencies updated: `npm audit` and `npm update`
   - Monitor Supabase changelog for security updates

4. **Monitor Orders**
   - Watch for unusual ordering patterns
   - Investigate duplicate orders from same table
   - Review help request frequency

### For Developers

1. **Never Commit Secrets**
   - Always use `.env` files for credentials
   - Add `.env` to `.gitignore`
   - Use `.env.example` for documentation

2. **Review RLS Policies**
   - Test all database queries with different user roles
   - Ensure customers cannot access other restaurants' data
   - Verify staff can only see their own restaurant

3. **Validate on Server Side**
   - Client-side validation is for UX only
   - Implement server-side validation using Supabase Edge Functions
   - Never trust client-provided data

4. **Use TypeScript Strict Mode**
   - Catches type-related bugs early
   - Prevents accidental data exposure

## Known Limitations

### Current Limitations (Client-Side Only)

1. **Rate Limiting**: Currently client-side only; can be bypassed by disabling JavaScript
   - **Mitigation**: Implement Supabase Edge Functions for server-side rate limiting

2. **API Key Exposure**: Supabase anon key is visible in browser (by design)
   - **Mitigation**: RLS policies provide the real security; keys alone are insufficient

3. **No CSRF Tokens**: SPA architecture reduces CSRF risk, but not eliminated
   - **Mitigation**: Supabase uses JWT tokens with short expiry

4. **In-Memory Rate Limit Store**: Resets on page reload
   - **Mitigation**: Use localStorage or server-side tracking for persistence

### Recommended Enhancements

1. **Add Supabase Edge Functions** for:
   - Server-side rate limiting
   - Order validation before insertion
   - Payment processing integration

2. **Implement Web Application Firewall (WAF)**
   - Cloudflare or AWS WAF
   - Blocks common attack patterns

3. **Add Monitoring & Alerts**
   - Sentry for error tracking
   - LogRocket for session replay
   - Custom alerts for suspicious activity

4. **Payment Integration**
   - Stripe or similar payment processor
   - PCI compliance considerations
   - Secure payment flow

## Incident Response

If you suspect a security breach:

1. **Immediate Actions**
   - Rotate Supabase API keys in dashboard
   - Review recent database changes
   - Check authentication logs

2. **Investigation**
   - Review order history for anomalies
   - Check staff account activity
   - Analyze error logs

3. **Recovery**
   - Update compromised credentials
   - Patch identified vulnerabilities
   - Notify affected parties if necessary

4. **Documentation**
   - Document the incident
   - Update security measures
   - Share learnings with team

## Contact & Support

For security concerns or questions:
- Supabase Security: https://supabase.com/security
- Report vulnerabilities responsibly
- Follow OWASP best practices: https://owasp.org/

## Additional Resources

- [Supabase Security Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [React Security Best Practices](https://react.dev/learn/security)
- [Vite Security Guide](https://vitejs.dev/guide/env-and-mode.html)
