# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of Certus seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of these channels:

1. **GitHub Security Advisory** (Preferred)
   - Go to the [Security Advisories](https://github.com/oscarvalois/hergon-vector01/security/advisories/new) page
   - Click "Report a vulnerability"
   - Fill out the form with as much detail as possible

2. **Email**
   - Send an email to [security@hergon.com](mailto:security@hergon.com)
   - Encrypt your message using our [PGP key](#pgp-key) if sharing sensitive information

### What to Include

Please include the following information in your report:

- **Type of vulnerability** (e.g., XSS, SQL injection, authentication bypass)
- **Full paths of source file(s)** related to the vulnerability
- **Location of the affected source code** (tag/branch/commit or direct URL)
- **Step-by-step instructions** to reproduce the issue
- **Proof-of-concept or exploit code** (if possible)
- **Impact of the vulnerability**, including how an attacker might exploit it
- **Any special configuration** required to reproduce the issue

### What to Expect

1. **Acknowledgment**: We will acknowledge receipt of your report within 48 hours.

2. **Communication**: We will keep you informed about the progress of fixing the vulnerability.

3. **Resolution Timeline**: We aim to resolve critical vulnerabilities within 7 days, and non-critical vulnerabilities within 30 days.

4. **Disclosure**: After the vulnerability is fixed, we may publish a security advisory. We will coordinate the timing of any public disclosure with you.

5. **Credit**: We will acknowledge your contribution in our security advisory (unless you prefer to remain anonymous).

## Security Measures

### Application Security

Certus implements several security measures:

- **Authentication**: Azure AD (MSAL) with multi-factor authentication support
- **Authorization**: Role-based access control (RBAC)
- **Data Encryption**: TLS 1.3 for data in transit
- **Input Validation**: Zod schema validation on all user inputs
- **XSS Prevention**: React's built-in XSS protection, Content Security Policy headers
- **CSRF Protection**: SameSite cookies, anti-CSRF tokens
- **Security Headers**: Strict security headers (X-Content-Type-Options, X-Frame-Options, etc.)

### Infrastructure Security

- **Cloud Provider**: Microsoft Azure with enterprise security certifications
- **Monitoring**: Azure Application Insights for security monitoring
- **Logging**: Comprehensive audit logging for security events
- **Updates**: Regular dependency updates via Dependabot

### Code Security

- **Static Analysis**: CodeQL security scanning on all PRs
- **Dependency Scanning**: Automated vulnerability scanning
- **Code Review**: Required code review for all changes
- **Signed Commits**: GPG-signed commits recommended

## Security Best Practices for Contributors

When contributing to Certus, please follow these security best practices:

### Do

- ✅ Validate and sanitize all user inputs
- ✅ Use parameterized queries for database operations
- ✅ Follow the principle of least privilege
- ✅ Keep dependencies up to date
- ✅ Use secure defaults
- ✅ Log security-relevant events
- ✅ Handle errors gracefully without exposing sensitive information

### Don't

- ❌ Commit secrets, API keys, or credentials
- ❌ Use `eval()` or other dangerous functions
- ❌ Trust user input without validation
- ❌ Store sensitive data in localStorage
- ❌ Disable security features without justification
- ❌ Use deprecated or vulnerable dependencies

## Secure Development Lifecycle

1. **Design Review**: Security considerations during feature design
2. **Code Review**: Security-focused code review for all PRs
3. **Automated Testing**: Security tests in CI/CD pipeline
4. **Static Analysis**: CodeQL and dependency scanning
5. **Penetration Testing**: Periodic security assessments
6. **Incident Response**: Documented incident response procedures

## Bug Bounty Program

We do not currently have a formal bug bounty program, but we deeply appreciate security researchers who report vulnerabilities responsibly. We may offer recognition or rewards on a case-by-case basis for high-impact vulnerabilities.

## Security Updates

Stay informed about security updates:

- Watch this repository for security advisories
- Subscribe to our security mailing list
- Check the [GitHub Security Advisories](https://github.com/oscarvalois/hergon-vector01/security/advisories) page

## PGP Key

For encrypted communications, use our PGP public key:

```
-----BEGIN PGP PUBLIC KEY BLOCK-----
[Contact security@hergon.com to request the PGP key]
-----END PGP PUBLIC KEY BLOCK-----
```

## Contact

- **Security Team**: [security@hergon.com](mailto:security@hergon.com)
- **General Support**: [support@hergon.com](mailto:support@hergon.com)

---

Thank you for helping keep Certus and our users safe!
