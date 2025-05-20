# Bitespeed Identity Reconciliation
This service handles identity reconciliation based on contact information (email and phone). It returns a unified view of a user with a primary contact and linked secondary contacts based on overlaps in email or phone data.
## 🔗 Live Demo

Try the live backend: [https://bitespeed-identity-reconciliation-9.onrender.com](https://bitespeed-identity-reconciliation-9.onrender.com)

To test, send a `POST` request to:
POST https://bitespeed-identity-reconciliation-9.onrender.com/identify
Content-Type: application/json

{
  "email": "example@xyz.com",
  "phoneNumber": "123456"
}
