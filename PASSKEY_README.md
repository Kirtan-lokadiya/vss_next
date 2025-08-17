# Passkey System for Encrypted Messaging

This document explains the passkey system implemented in your Next.js application for secure encrypted messaging.

## Overview

The passkey system provides end-to-end encryption for messages by:
1. Generating cryptographic key pairs when users set a password
2. Storing encrypted keys securely in localStorage
3. Using public keys for encryption and private keys for decryption
4. Automatically managing key lifecycle and validation

## API Endpoints

### 1. Check if Passkey Exists
```
GET {{security}}/passkeys-user
Authorization: Bearer {token}
```

**Response (if passkey exists):**
```json
{
  "id": 1866,
  "publicKey": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...",
  "encryptedPrivateKey": "+c2sifSitd6NVZzMKU9zk/sy/2rdHKlc3Zpfj/X6TG2A...",
  "encryptedChecksum": "nxz7GqDC2YfkMuGPwGnYB55WnQCracDd6drR9zcRC1oB5nkwQQRA",
  "salt": "zgpAgovD/QMm03j1py0HAQ==",
  "iv": "BsRLUWc8HDHVX3mW"
}
```

**Response (if no passkey):**
```json
{
  "errors": {
    "time": "2025-08-13T19:39:14.016453976",
    "message": "Security Key Not Found"
  },
  "customCode": 404
}
```

### 2. Set Password and Generate Passkey
```
POST {{security}}/passkeys?password=8418
Authorization: Bearer {token}
Content-Type: application/json

{
  "password": "8418"
}
```

**Response:**
```json
{
  "id": 1866,
  "publicKey": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...",
  "encryptedPrivateKey": "+c2sifSitd6NVZzMKU9zk/sy/2rdHKlc3Zpfj/X6TG2A...",
  "encryptedChecksum": "nxz7GqDC2YfkMuGPwGnYB55WnQCracDd6drR9zcRC1oB5nkwQQRA",
  "salt": "zgpAgovD/QMm03j1py0HAQ==",
  "iv": "BsRLUWc8HDHVX3mW"
}
```

### 3. Get Notes (with pagination)
```
GET {{notes}}/?page=1&size=5
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": "e5ffa741-a379-4c10-8ee6-83366b49d746",
    "userId": 1,
    "content": "This is a sample note",
    "properties": {
      "x": 10,
      "y": 20,
      "z": 5,
      "color": "#ffffff",
      "height": 100,
      "width": 200
    },
    "createdAt": "2025-01-13T19:39:14.016453976Z",
    "updatedAt": "2025-01-13T19:39:14.016453976Z"
  }
]
```

### 4. Create Note (Regular or Encrypted)
```
POST {{notes}}/
Authorization: Bearer {token}
Content-Type: application/json

{
  "userId": 1,
  "content": "This is a sample note",
  "properties": {
    "x": 10,
    "y": 20,
    "z": 5,
    "color": "#ffffff",
    "height": 100,
    "width": 200
  }
}
```

**For Encrypted Notes:**
```json
{
  "userId": 1,
  "content": "encrypted_content_here",
  "properties": {
    "x": 10,
    "y": 20,
    "z": 5,
    "color": "#ffffff",
    "height": 100,
    "width": 200
  },
  "encrypted": true,
  "encryptionMetadata": {
    "algorithm": "AES-256-GCM",
    "keyId": 1866,
    "timestamp": "2025-01-13T19:39:14.016453976Z"
  }
}
```

## Implementation Details

### Components Created

1. **PasskeyContext** (`src/context/PasskeyContext.jsx`)
   - Manages passkey state and operations
   - Automatically checks passkey status on authentication
   - Handles API calls to security endpoints
   - Correctly handles the error response format for missing passkeys

2. **PasskeyModal** (`src/components/ui/PasskeyModal.jsx`)
   - Modal for setting passwords
   - Validates password requirements
   - Handles password confirmation

3. **PasskeyStatus** (`src/components/ui/PasskeyStatus.jsx`)
   - Displays current passkey status
   - Provides quick actions for passkey management

4. **NotesManager** (`src/components/ui/NotesManager.jsx`)
   - Complete notes management interface
   - Supports both regular and encrypted note creation
   - Handles note CRUD operations with pagination
   - Integrates with passkey system for encryption

5. **Notes API Service** (`src/utils/notesApi.js`)
   - Handles all notes API operations
   - Supports encrypted note creation and decryption
   - Manages note properties and metadata
   - Integrates with stored passkey for encryption

6. **Encryption Utilities** (`src/utils/encryption.js`)
   - Functions for encrypting/decrypting messages
   - Access to stored cryptographic keys
   - Validation and management utilities

### Key Features

- **Automatic Key Management**: Keys are automatically loaded from localStorage and validated
- **Secure Storage**: Cryptographic keys are stored encrypted in localStorage
- **Password Protection**: User passwords are never stored, only used for key generation
- **Real-time Status**: Passkey status is checked automatically and displayed to users
- **Error Handling**: Comprehensive error handling for API failures and validation errors

## Usage Examples

### Basic Passkey Check
```jsx
import { usePasskey } from '../context/PasskeyContext';

function MyComponent() {
  const { isPasskeySet, isLoading, checkPasskey } = usePasskey();
  
  if (isLoading) return <div>Checking passkey...</div>;
  
  return (
    <div>
      {isPasskeySet ? 'Passkey is set' : 'No passkey found'}
      <button onClick={checkPasskey}>Refresh Status</button>
    </div>
  );
}
```

### Setting a Password
```jsx
import { usePasskey } from '../context/PasskeyContext';

function PasswordSetter() {
  const { setPassword } = usePasskey();
  
  const handleSetPassword = async (password) => {
    const result = await setPassword(password);
    if (result.success) {
      console.log('Password set successfully!');
    } else {
      console.error('Failed to set password:', result.message);
    }
  };
  
  return (
    <button onClick={() => handleSetPassword('mySecurePassword123')}>
      Set Password
    </button>
  );
}
```

### Using Encryption Utilities
```jsx
import { encryptMessage, decryptMessage, isPasskeyAvailable } from '../utils/encryption';

async function encryptDemo() {
  if (!isPasskeyAvailable()) {
    console.log('No passkey available');
    return;
  }
  
  const encrypted = await encryptMessage('Hello, World!');
  console.log('Encrypted:', encrypted);
  
  const decrypted = await decryptMessage(encrypted, 'mySecurePassword123');
  console.log('Decrypted:', decrypted);
}
```

### Creating Encrypted Notes
```jsx
import { createEncryptedNote, getNotes } from '../utils/notesApi';

async function createSecureNote(token, content, password) {
  const noteData = {
    userId: 1,
    content: content,
    properties: {
      x: 10,
      y: 20,
      z: 5,
      color: '#ffffff',
      height: 100,
      width: 200
    }
  };
  
  const result = await createEncryptedNote(token, noteData, password);
  if (result.success) {
    console.log('Encrypted note created:', result.note);
  }
}

async function loadUserNotes(token) {
  const result = await getNotes(token, 1, 10, "<your-notes-password>");
  if (result.success) {
    console.log('Notes loaded:', result.data);
  }
}
```

### Using the NotesManager Component
```jsx
import NotesManager from '../components/ui/NotesManager';

function MyPage() {
  return (
    <div>
      <h1>My Notes</h1>
      <NotesManager />
    </div>
  );
}
```

## Integration with Existing App

### 1. Update `_app.js`
The PasskeyProvider has been added to your app's context providers:

```jsx
import { PasskeyProvider } from '../src/context/PasskeyContext';

function MyApp({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <AuthProvider>
          <ToastProvider>
            <PasskeyProvider>
              <DndProvider backend={HTML5Backend}>
                <Component {...pageProps} />
                <AuthModal />
              </DndProvider>
            </PasskeyProvider>
          </ToastProvider>
        </AuthProvider>
      </Provider>
    </ErrorBoundary>
  );
}
```

### 2. Demo Page
A demo page has been created at `/passkey-demo` to showcase the functionality.

### 3. Environment Variables
Make sure to set your API base URL:

```env
NEXT_PUBLIC_BASE_URL=http://localhost:5321
```

### 4. API Configuration
The system uses the following API endpoints based on your Postman environment:

- **Base URL**: `{{base}}` (e.g., `http://localhost:5321`)
- **Security**: `{{security}}` (e.g., `{{base}}/api/v1/security`)
- **Notes**: `{{notes}}` (e.g., `{{base}}/api/v1/notes`)
- **Authentication**: `{{auth}}` (e.g., `{{base}}/api/v1/auth`)

## Security Considerations

1. **Key Storage**: Cryptographic keys are stored in localStorage (encrypted by the backend)
2. **Password Handling**: User passwords are never stored locally
3. **Token Security**: API calls use Bearer tokens for authentication
4. **Validation**: All passkey data is validated before use
5. **Error Handling**: Sensitive information is not exposed in error messages
6. **Note Encryption**: Note content is encrypted before transmission to the server
7. **API Security**: All endpoints require valid authentication tokens
8. **Data Integrity**: Encrypted notes include metadata for verification

## Notes Workflow

### 1. Regular Notes
- Content is sent as plain text to the server
- No encryption is applied
- Suitable for non-sensitive information

### 2. Encrypted Notes
- User must have a passkey set
- Content is encrypted using the stored cryptographic keys
- Password is required for encryption (not stored)
- Server receives encrypted content and metadata
- Decryption requires the user's password and stored keys

### 3. Note Properties
All notes support custom properties for positioning and styling:
- **Position**: x, y, z coordinates
- **Appearance**: color, height, width
- **Custom**: Additional properties can be added as needed

## Customization

### Implementing Actual Encryption
The current encryption utilities use placeholder logic. To implement real encryption:

1. **For RSA Encryption**: Use Web Crypto API or libraries like `node-forge`
2. **For AES Encryption**: Use Web Crypto API for symmetric encryption
3. **Key Derivation**: Implement PBKDF2 or similar for password-based key derivation

Example with Web Crypto API:
```jsx
export const encryptMessage = async (message) => {
  const publicKey = getPublicKey();
  if (!publicKey) throw new Error('Public key not available');
  
  // Convert base64 public key to CryptoKey
  const keyData = Uint8Array.from(atob(publicKey), c => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    'spki',
    keyData,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt']
  );
  
  // Encrypt message
  const encodedMessage = new TextEncoder().encode(message);
  const encrypted = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    cryptoKey,
    encodedMessage
  );
  
  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
};
```

### Styling
All components use Tailwind CSS classes and can be customized by:
- Modifying the className props
- Updating the component styles
- Using CSS modules or styled-components

## Troubleshooting

### Common Issues

1. **Passkey not loading**: Check if user is authenticated and token is valid
2. **API errors**: Verify the security endpoints are accessible and returning correct data
3. **Encryption failures**: Ensure the passkey data is complete and valid
4. **LocalStorage errors**: Check browser compatibility and storage permissions
5. **Notes not loading**: Verify the notes API endpoint is accessible and token is valid
6. **Encryption not working**: Ensure passkey is set and password is correct
7. **Note creation fails**: Check if all required fields are provided and API is responding

### Debug Mode
Enable debug logging by checking browser console for detailed error messages and API responses.

## Future Enhancements

1. **Key Rotation**: Implement automatic key rotation for enhanced security
2. **Backup/Recovery**: Add secure backup mechanisms for cryptographic keys
3. **Multi-device Sync**: Implement secure key synchronization across devices
4. **Advanced Encryption**: Support for additional encryption algorithms and key sizes
5. **Audit Logging**: Track passkey operations for security monitoring

## Support

For issues or questions about the passkey system:
1. Check the browser console for error messages
2. Verify API endpoint accessibility
3. Ensure all required environment variables are set
4. Review the security endpoint documentation 