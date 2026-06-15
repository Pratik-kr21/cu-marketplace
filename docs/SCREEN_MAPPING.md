# Screen Mapping

This document maps the existing React web application pages to their corresponding Jetpack Compose screens for the Android migration.

## Authentication Flow

*   **`Signup.jsx`** → **`SignupScreen.kt`**
    *   **UI Components**: OutlinedTextFields (Email, Password, Name, etc.), Button, TextLinks.
    *   **API Dependencies**: `POST /api/auth/register`
    *   **State Requirements**: Form validation state, Loading state, Error state.
    *   **Navigation**: On success → `VerifyEmailScreen` or `HomeScreen`.

*   **`Login.jsx`** → **`LoginScreen.kt`**
    *   **UI Components**: OutlinedTextFields, Login Button, "Forgot Password" link.
    *   **API Dependencies**: `POST /api/auth/login`
    *   **State Requirements**: Form state, Auth state (saving token to DataStore).
    *   **Navigation**: On success → `HomeScreen`.

*   **`ForgotPassword.jsx`** → **`ForgotPasswordScreen.kt`**
    *   **API Dependencies**: `POST /api/auth/forgot-password`

*   **`ResetPassword.jsx`** → **`ResetPasswordScreen.kt`**
    *   **API Dependencies**: `POST /api/auth/reset-password` (Requires handling deep links in Android).

*   **`VerifyEmail.jsx`** → **`VerifyEmailScreen.kt`**
    *   **API Dependencies**: `POST /api/auth/verify-email` or deep link handling.

## Core Application Flow

*   **`Home.jsx` / `Marketplace.jsx`** → **`HomeScreen.kt` / `MarketplaceScreen.kt`**
    *   *(Note: On mobile, these might be merged into a single Bottom Navigation tab or kept separate based on design).*
    *   **UI Components**: SearchBar, FilterChips, LazyVerticalGrid (Item Cards), PullRefresh.
    *   **API Dependencies**: `GET /api/items`
    *   **State Requirements**: Paging data state, Filter state.
    *   **Navigation**: Click item → `ItemDetailScreen`.

*   **`CreateListing.jsx`** → **`CreateListingScreen.kt`**
    *   **UI Components**: ImagePicker (ActivityResultContracts.PickMultipleVisualMedia), Dropdowns (ExposedDropdownMenuBox), TextFields, Switch (for toggle options).
    *   **API Dependencies**: `POST /api/items` (Multipart format).
    *   **State Requirements**: Image URI list, Form validation.
    *   **Navigation**: On success → `ItemDetailScreen` or `HomeScreen`.

*   **`ItemDetail.jsx`** → **`ItemDetailScreen.kt`**
    *   **UI Components**: HorizontalPager (Image gallery), Text displays, "Propose Trade" FloatingActionButton / Bottom Bar.
    *   **API Dependencies**: `GET /api/items/:id`
    *   **State Requirements**: Item data, Trade dialog visibility.
    *   **Navigation**: Propose Trade → `TradeProposalBottomSheet` or `TradeScreen`.

*   **`TradeDashboard.jsx`** → **`TradeDashboardScreen.kt`**
    *   **UI Components**: ScrollableTabRow (Pending, Accepted, Completed), LazyColumn (Trade items).
    *   **API Dependencies**: `GET /api/trades`
    *   **State Requirements**: List of trades filtered by status.
    *   **Navigation**: Click trade → `ChatScreen` or `TradeDetailScreen`.

*   **`Chat.jsx`** → **`ChatScreen.kt`**
    *   **UI Components**: TopAppBar (Trade Info), LazyColumn (Messages), Bottom TextField & Send IconButton.
    *   **API Dependencies**: `GET /api/conversations/:id`, Socket.IO connection.
    *   **State Requirements**: Real-time message list, Socket connection status.
    *   **Navigation**: Back → `TradeDashboardScreen`.

*   **`Profile.jsx`** → **`ProfileScreen.kt`**
    *   **UI Components**: Avatar image (Coil), Text fields for updating info, "My Listings" grid, Logout button.
    *   **API Dependencies**: `GET /api/auth/me`, `PUT /api/auth/profile`, `GET /api/items/user/:id`.
    *   **State Requirements**: User profile data.
    *   **Navigation**: Logout → `LoginScreen`.

*   **`Requests.jsx`** → **`RequestsScreen.kt`**
    *   **UI Components**: LazyColumn of requests, FAB to add request.
    *   **API Dependencies**: `GET /api/requests`, `POST /api/requests`.

*   **`AdminDashboard.jsx`** → **`AdminScreen.kt`**
    *   *(Requires Admin Role)*
    *   **API Dependencies**: `/api/admin/*`

*   **`DeveloperContact.jsx`** → **`ContactScreen.kt`**
    *   **UI Components**: Simple form.
    *   **API Dependencies**: `POST /api/contact`.

## Structural Navigation

Android will require a root navigation component:
*   **`RootNavigator.kt`**: Uses `NavHost`.
*   **BottomNavigationBar**: For main app sections (Home, Trades, Profile, Requests).
