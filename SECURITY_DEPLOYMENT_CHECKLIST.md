# Security Deployment Checklist

## Pre-Deployment Security Verification

### Environment Configuration
- [ ] `NODE_ENV=production` is set
- [ ] `ALLOW_GUEST_ACCESS` is NOT set or explicitly set to `false`
- [ ] All required environment variables are configured
- [ ] Sensitive environment variables are properly secured
- [ ] Database connection uses encrypted connection

### Security Headers Verification
- [ ] Middleware is deployed and active
- [ ] CSP headers are properly configured for your domain
- [ ] HTTPS is enforced by hosting platform
- [ ] Security headers are being sent (test with browser dev tools)

### Authentication & Authorization  
- [ ] Stack Auth is properly configured
- [ ] Guest user access is disabled in production
- [ ] All API endpoints require authentication where appropriate
- [ ] User data isolation is working (users can only access their own records)

### Input Validation & Rate Limiting
- [ ] All API endpoints validate input using Zod schemas
- [ ] Rate limiting is active and properly configured
- [ ] File upload limits are appropriate
- [ ] IP extraction is working correctly (test with proxy setup if applicable)

### Error Handling & Logging
- [ ] Error messages don't expose sensitive information
- [ ] Console logs don't contain sensitive data
- [ ] Error sanitization is working
- [ ] Production error monitoring is configured

### Testing Recommendations
```bash
# 1. Test authentication (try accessing API without auth)
curl -X GET https://yourapp.com/api/records
# Should return 401 Unauthorized

# 2. Test rate limiting (make multiple rapid requests)
for i in {1..10}; do curl -X GET https://yourapp.com/api/records; done
# Should return 429 after hitting limits

# 3. Test input validation (send invalid data)
curl -X POST https://yourapp.com/api/records -d '{"invalid": "data"}'
# Should return 400 with validation errors

# 4. Check security headers
curl -I https://yourapp.com
# Should include X-Frame-Options, CSP, etc.
```

### Monitoring & Maintenance
- [ ] Set up monitoring for security events
- [ ] Configure alerts for rate limit violations
- [ ] Plan regular security reviews
- [ ] Keep dependencies updated
- [ ] Monitor for new security advisories

## Post-Deployment Verification

1. **Test Authentication Flow**: Ensure users can only access their own data
2. **Verify Rate Limiting**: Test that rate limits are working correctly
3. **Check Error Handling**: Ensure no sensitive data leaks in error messages
4. **Security Headers**: Verify all security headers are present
5. **HTTPS Enforcement**: Ensure HTTP requests redirect to HTTPS
6. **File Upload Security**: Test file validation and size limits

## Emergency Procedures

If security issue is discovered:
1. Assess severity and impact
2. Apply temporary mitigations if needed
3. Deploy fixes following this checklist
4. Monitor for any ongoing impact
5. Document lessons learned