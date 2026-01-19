# Laravel Backend Google Login Setup

## 🔧 Step 1: Install Required Packages

```bash
composer require google/auth-library-php
composer require tymon/jwt-auth
```

## 📝 Step 2: Create Google Auth Controller

Create: `app/Http/Controllers/Api/AuthController.php`

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Google\Auth\OAuth2;
use Google\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Exception;

class AuthController extends Controller
{
    /**
     * Handle Google OAuth login/signup
     */
    public function googleLogin(Request $request)
    {
        try {
            $token = $request->input('token');
            $fcmId = $request->input('fcm_id');

            if (!$token) {
                return response()->json([
                    'error' => true,
                    'message' => 'Google token is required'
                ], 400);
            }

            // Verify Google Token
            $client = new Client();
            $client->setClientId(env('GOOGLE_CLIENT_ID'));

            $ticket = $client->verifyIdToken($token);
            
            if (!$ticket) {
                return response()->json([
                    'error' => true,
                    'message' => 'Invalid Google token'
                ], 401);
            }

            $payload = $ticket->getAttributes();
            
            // Extract user data from Google
            $googleId = $payload['sub'] ?? null;
            $email = $payload['email'] ?? null;
            $name = $payload['name'] ?? 'Google User';
            $profilePicture = $payload['picture'] ?? null;

            if (!$googleId || !$email) {
                return response()->json([
                    'error' => true,
                    'message' => 'Invalid Google token data'
                ], 401);
            }

            // Find or create user
            $user = User::where('email', $email)->first();

            if (!$user) {
                // Create new user
                $user = User::create([
                    'name' => $name,
                    'email' => $email,
                    'google_id' => $googleId,
                    'profile_picture' => $profilePicture,
                    'type' => 'google',
                    'email_verified_at' => now(),
                    'password' => bcrypt(str_random(16)), // Random password for OAuth users
                ]);
            } else {
                // Update existing user with Google ID if not set
                if (!$user->google_id) {
                    $user->update([
                        'google_id' => $googleId,
                        'profile_picture' => $profilePicture,
                        'type' => 'google',
                    ]);
                }
            }

            // Update FCM token if provided
            if ($fcmId) {
                $user->update(['fcm_token' => $fcmId]);
            }

            // Generate Laravel Sanctum or JWT token
            $authToken = $user->createToken('authToken')->plainTextToken;

            return response()->json([
                'error' => false,
                'message' => 'Login successful',
                'token' => $authToken,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'profile_picture' => $user->profile_picture,
                    'type' => $user->type,
                ]
            ], 200);

        } catch (Exception $e) {
            \Log::error('Google Login Error: ' . $e->getMessage());
            
            return response()->json([
                'error' => true,
                'message' => 'Authentication failed: ' . $e->getMessage()
            ], 500);
        }
    }
}
```

## 🛣️ Step 3: Add Route

Add to: `routes/api.php`

```php
Route::post('/auth/google', [App\Http\Controllers\Api\AuthController::class, 'googleLogin']);
```

## 📦 Step 4: Update User Model

Add to: `app/Models/User.php`

```php
protected $fillable = [
    'name',
    'email',
    'password',
    'google_id',
    'profile_picture',
    'type',
    'fcm_token',
    'email_verified_at',
];
```

## 📋 Step 5: Create Migration (if columns don't exist)

```bash
php artisan make:migration add_google_fields_to_users_table
```

Add to migration file:

```php
Schema::table('users', function (Blueprint $table) {
    $table->string('google_id')->nullable()->unique();
    $table->string('profile_picture')->nullable();
    $table->string('type')->default('email')->comment('email, google, mobile');
    $table->string('fcm_token')->nullable();
});
```

Run migration:

```bash
php artisan migrate
```

## 🔐 Step 6: Add Environment Variables

Add to: `.env`

```
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE
```

## ✅ Step 7: Middleware for Protected Routes

```php
// routes/api.php
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});
```

## 🧪 Step 8: Test Endpoint

Use Postman/Curl to test:

```bash
curl -X POST http://localhost:8000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "token": "GOOGLE_JWT_TOKEN_FROM_FRONTEND",
    "fcm_id": "optional_fcm_token"
  }'
```

Expected Response:

```json
{
  "error": false,
  "message": "Login successful",
  "token": "1|ABC123XYZ...",
  "user": {
    "id": 1,
    "name": "User Name",
    "email": "user@example.com",
    "profile_picture": "https://...",
    "type": "google"
  }
}
```

## 🚀 Complete Setup Commands

Run all in order:

```bash
# 1. Install packages
composer require google/auth-library-php
composer require tymon/jwt-auth

# 2. Create migration
php artisan make:migration add_google_fields_to_users_table

# 3. Run migration
php artisan migrate

# 4. Clear config cache
php artisan config:clear
php artisan cache:clear
```

## 📱 Frontend Integration Verification

Your frontend sends:
```javascript
{
  token: "Google JWT from @react-oauth/google",
  fcm_id: "Firebase FCM token"
}
```

Laravel validates and returns:
```javascript
{
  token: "Sanctum auth token",
  user: {...}
}
```

Frontend stores token and uses for authenticated requests:
```javascript
axios.get('http://localhost:8000/api/user', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  }
});
```

Done! ✅
