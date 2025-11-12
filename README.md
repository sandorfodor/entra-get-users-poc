# List entra users PoC

### Create `.env.`

```bash
cp .env.example .env
```

Add azure app credentials.

### Start the app

```bash
npm i
npm start
```

App will start on port 3000, it will immediatelly redirect to MS login screen, after login user will be redirected to the app and it should see it's current state.

## Application flow

```
+--------------------+
|  User opens app    |
+--------------------+
          |
          v
+-----------------------------+
| Redirect to MS Login screen |
+-----------------------------+
          |
          v
+--------------------------------+
| Redirect back to app with      |
|        idToken                 |
+--------------------------------+
          |
          v
+--------------------------------+
| Fetch accessToken using        |
|        idToken                 |
+--------------------------------+
          |
          v
+--------------------------------+
| Use accessToken to call        |
|       Microsoft Graph API      |
+--------------------------------+
          |
          v
+-------------------------------+
| Display API response in app   |
+-------------------------------+

```
