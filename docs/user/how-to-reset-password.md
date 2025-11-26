# How to Reset Your Password

> **Difficulty**: Beginner
> **Time Required**: 2-5 minutes
> **Status**: Planned Feature
> **Related Technical Docs**: [Password Reset Implementation](../dev/password-reset-implementation.md)

## Overview

If you've forgotten your password, you can reset it using your email address. A secure link will be sent to your email that allows you to create a new password.

## Prerequisites

Before you can reset your password, make sure you have:

- [ ] Access to the email address associated with your account
- [ ] A web browser with internet connection

## Step-by-Step Guide

### Step 1: Go to the Login Page

Navigate to the login page of the application.

<!-- Screenshot: Login page with "Forgot Password?" link visible -->
![Login page with Forgot Password link](../assets/screenshots/password-reset-step-1.png)

### Step 2: Click "Forgot Password?"

Look for the "Forgot Password?" link below the login form and click it.

<!-- Screenshot: Arrow pointing to Forgot Password link -->
![Click Forgot Password link](../assets/screenshots/password-reset-step-2.png)

### Step 3: Enter Your Email Address

On the password reset page:
1. Enter the email address associated with your account
2. Click the "Send Reset Link" button

<!-- Screenshot: Forgot password form with email field -->
![Enter your email address](../assets/screenshots/password-reset-step-3.png)

### Step 4: Check Your Email

1. Open your email inbox
2. Look for an email from "Expense Tracker" with the subject "Reset Your Password"
3. If you don't see it, check your spam/junk folder

<!-- Screenshot: Example of the reset email in an inbox -->
![Check your email for reset link](../assets/screenshots/password-reset-step-4.png)

### Step 5: Click the Reset Link

In the email:
1. Click the "Reset Password" button, or
2. Copy and paste the link into your browser if the button doesn't work

**Important**: This link expires in 1 hour for security reasons.

<!-- Screenshot: Password reset email with button highlighted -->
![Click the reset link in the email](../assets/screenshots/password-reset-step-5.png)

### Step 6: Create a New Password

On the password reset form:
1. Enter your new password
2. Re-enter your password to confirm
3. Click "Reset Password"

<!-- Screenshot: New password form with strength indicator -->
![Create your new password](../assets/screenshots/password-reset-step-6.png)

### Step 7: Sign In with Your New Password

After successfully resetting your password:
1. You'll be redirected to the login page
2. Enter your email and new password
3. Click "Sign In"

<!-- Screenshot: Login page with success message -->
![Sign in with new password](../assets/screenshots/password-reset-step-7.png)

## Quick Reference

| Action | How To |
|--------|--------|
| Start password reset | Click "Forgot Password?" on login page |
| Request reset link | Enter email and click "Send Reset Link" |
| Reset password | Click link in email, enter new password twice |
| Link expired? | Request a new reset link |

## Password Requirements

Your new password must meet these requirements:

| Requirement | Example |
|-------------|---------|
| At least 8 characters | `MyP@ss12` |
| One uppercase letter | `M` |
| One lowercase letter | `y` |
| One number | `1` or `2` |
| One special character | `@` |

**Tip**: Use a passphrase like `Coffee-Morning-2024!` for a strong, memorable password.

## Tips & Best Practices

- **Use a password manager**: Tools like 1Password, Bitwarden, or the built-in browser password manager can generate and store strong passwords for you.

- **Don't reuse passwords**: Use a unique password for each account to stay secure.

- **Act quickly**: Reset links expire in 1 hour. If yours expires, simply request a new one.

- **Check your spam folder**: If you don't receive the email within a few minutes, check your spam or junk mail folder.

## Common Issues

### Issue: I didn't receive the reset email

**Solutions**:
1. Check your spam/junk folder
2. Make sure you entered the correct email address
3. Wait a few minutes - emails can sometimes be delayed
4. Try requesting another reset link
5. Check if your email provider is blocking emails from our domain

### Issue: The reset link says it's expired

**Solution**: Reset links are valid for 1 hour. Simply go back to the login page and request a new reset link.

### Issue: The reset link says it's invalid

**Solutions**:
1. Make sure you copied the entire link if you pasted it manually
2. Try clicking the button in the email instead of copying the link
3. Request a new reset link - each new request invalidates previous links

### Issue: My new password isn't accepted

**Solution**: Make sure your password meets all requirements:
- At least 8 characters long
- Contains at least one uppercase letter (A-Z)
- Contains at least one lowercase letter (a-z)
- Contains at least one number (0-9)
- Contains at least one special character (!@#$%^&*, etc.)

### Issue: I can't remember which email I used

**Solution**: Try the email addresses you commonly use. If you still can't find your account, contact support for assistance.

## FAQ

**Q: How long is the reset link valid?**
A: Reset links expire after 1 hour for security reasons. If your link expires, simply request a new one.

**Q: Can I use my old password?**
A: For security, we recommend choosing a new, unique password. Some accounts may prevent reusing recent passwords.

**Q: Will I be logged out of other devices?**
A: Yes, resetting your password will log you out of all devices for security purposes.

**Q: How many times can I request a reset link?**
A: You can request up to 3 reset links per hour. This limit helps protect your account from abuse.

**Q: Is my account locked after too many failed attempts?**
A: No, requesting a password reset doesn't lock your account. However, there are rate limits to prevent abuse.

## Security Tips

- **Never share your reset link**: The link in your email is meant only for you.
- **Delete the reset email**: After you've successfully reset your password, delete the email.
- **Use a unique password**: Don't use the same password you use for other websites.
- **Enable two-factor authentication**: Once logged in, consider enabling 2FA for extra security (if available).

## Related Features

- [How to Create an Account](./how-to-create-account.md) *(Planned)*
- [How to Change Your Password](./how-to-change-password.md) *(Planned)*
- [How to Enable Two-Factor Authentication](./how-to-enable-2fa.md) *(Planned)*

## Need Help?

If you're still having trouble resetting your password:

1. **Check our FAQ**: Review the common issues above
2. **Contact Support**: Email support@example.com with your account email
3. **Report a Bug**: If you think something is broken, report it at [GitHub Issues](https://github.com/your-repo/issues)
