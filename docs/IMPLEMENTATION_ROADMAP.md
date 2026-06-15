# Implementation Roadmap

This document outlines the phased development plan for migrating the CU Market application to a native Android codebase.

## Milestone 1: Foundation & Architecture Setup
*   **Tasks**:
    *   Clean up existing Android Studio project template.
    *   Configure `build.gradle.kts` with all required dependencies (Hilt, Retrofit, Coil, Navigation Compose, DataStore, Socket.IO).
    *   Setup Clean Architecture folder structure (`core`, `feature_auth`, etc.).
    *   Implement core networking (Retrofit Builder, Base API responses).
    *   Implement Hilt Modules (`NetworkModule`, `AppModule`).
    *   Setup `Theme.kt`, `Color.kt`, and `Typography.kt` following Material 3 guidelines.
*   **Complexity**: Low
*   **Blockers**: None.

## Milestone 2: Authentication
*   **Tasks**:
    *   Create DataStore manager for saving/retrieving JWT tokens.
    *   Implement `AuthInterceptor` to inject tokens into API requests.
    *   Develop `LoginScreen` and `SignupScreen` UI.
    *   Implement Auth ViewModels and Repositories.
    *   Connect to `/api/auth/login` and `/api/auth/register`.
*   **Complexity**: Medium
*   **Blockers**: Requires Milestone 1 completion.

## Milestone 3: Marketplace & Navigation
*   **Tasks**:
    *   Setup `RootNavigator` and Bottom Navigation Bar.
    *   Develop `HomeScreen` / `MarketplaceScreen` UI with search and filters.
    *   Implement Paging 3 for infinite scrolling of items from `/api/items`.
    *   Integrate Coil for image loading in item cards.
*   **Complexity**: Medium
*   **Blockers**: Requires Milestone 2 (Auth) for secure endpoint access.

## Milestone 4: Listings & Item Details
*   **Tasks**:
    *   Develop `ItemDetailScreen`.
    *   Develop `CreateListingScreen` UI.
    *   Integrate Android PhotoPicker for image selection.
    *   Implement multipart/form-data upload via Retrofit for `/api/items` (POST).
*   **Complexity**: High (Due to image handling and multipart uploads)
*   **Blockers**: None, runs parallel to M3.

## Milestone 5: Trade System
*   **Tasks**:
    *   Develop `TradeProposalBottomSheet` logic.
    *   Develop `TradeDashboardScreen` with Tabs (Pending, Accepted, Completed).
    *   Implement complex ViewModels to handle trade state transitions (accept, decline, counter).
    *   Connect to `/api/trades` endpoints.
*   **Complexity**: High
*   **Blockers**: Requires Milestone 4 (Items must exist to be traded).

## Milestone 6: Real-time Chat
*   **Tasks**:
    *   Implement singleton `SocketManager` using `socket.io-client`.
    *   Handle socket lifecycle based on App foreground/background state.
    *   Develop `ChatScreen` UI.
    *   Connect REST endpoints for chat history (`/api/conversations`) and observe Socket events for new messages.
*   **Complexity**: High
*   **Blockers**: Requires Milestone 5 (Conversations originate from accepted trades).

## Milestone 7: Profile & User Management
*   **Tasks**:
    *   Develop `ProfileScreen` UI.
    *   Implement Avatar upload logic.
    *   Implement Item Requests feature (`RequestsScreen`).
*   **Complexity**: Low
*   **Blockers**: None.

## Milestone 8: Notifications
*   **Tasks**:
    *   Integrate Firebase SDK.
    *   Implement `FirebaseMessagingService` to receive push payloads.
    *   *Backend modification required*: Update backend to store FCM tokens and send via Firebase Admin SDK, alongside/replacing Web-Push.
*   **Complexity**: Medium
*   **Blockers**: Requires Backend changes.

## Milestone 9: Polish & Release
*   **Tasks**:
    *   Handle edge cases (no internet connection, server errors).
    *   Refine animations and Material 3 transitions.
    *   Add comprehensive error handling via Snackbars/Dialogs.
    *   Generate signed APK/AAB.
*   **Complexity**: Low
*   **Blockers**: Requires all previous milestones.
