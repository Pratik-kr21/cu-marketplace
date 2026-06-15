# Android Migration Strategy

This document outlines the architectural strategy for migrating the CU Market PWA to a fully native Android application using modern Android development practices.

## 1. Core Technologies

*   **Language**: Kotlin
*   **UI Toolkit**: Jetpack Compose (Material 3)
*   **Architecture**: MVVM (Model-View-ViewModel) + Clean Architecture
*   **Dependency Injection**: Hilt (Dagger)
*   **Networking**: Retrofit + OkHttp
*   **Image Loading**: Coil
*   **Local Storage**: DataStore (Preferences for Tokens/Settings) & Room (Optional, for chat/offline caching)
*   **Realtime**: `socket.io-client` for Android
*   **Push Notifications**: Firebase Cloud Messaging (FCM)
*   **Navigation**: Navigation Compose

## 2. Folder Structure (Clean Architecture)

The project will be organized by feature, and within each feature, divided into layers.

```text
app/src/main/java/com/example/cu_market/
 ├── core/                    # App-wide utilities
 │    ├── di/                 # Hilt Modules (NetworkModule, DatabaseModule)
 │    ├── network/            # Retrofit builder, AuthInterceptor
 │    ├── datastore/          # Preferences DataStore manager
 │    ├── ui/                 # Reusable Compose components, Theme, Typography
 │    └── utils/              # Helper functions, Constants
 ├── feature_auth/            # Authentication Feature
 │    ├── data/               # DTOs, Repository Impl, API Interfaces
 │    ├── domain/             # Models, Repository Interfaces, UseCases
 │    └── presentation/       # ViewModels, Compose Screens, State classes
 ├── feature_marketplace/     # Browsing & Searching Items
 ├── feature_listing/         # Creating Items
 ├── feature_trade/           # Trading logic
 ├── feature_chat/            # Socket.io chat
 │    ├── data/
 │    │    └── socket/        # Socket manager implementation
 ├── feature_profile/         # User Profile management
 └── feature_notification/    # FCM Service
```

## 3. Layer Responsibilities & Dependency Flow

*   **Presentation Layer (`presentation/`)**:
    *   *Contains*: Jetpack Compose UI, ViewModels, UI State data classes.
    *   *Responsibility*: Render UI based on State. Forward user intents to ViewModels. ViewModels execute UseCases and update State.
    *   *Dependency*: Depends on Domain layer.

*   **Domain Layer (`domain/`)**:
    *   *Contains*: Entities (pure Kotlin models), Repository Interfaces, UseCases (Business logic).
    *   *Responsibility*: Holds core business rules. Completely independent of Android framework (no `android.*` imports).
    *   *Dependency*: Depends on nothing (Inner circle of Clean Architecture).

*   **Data Layer (`data/`)**:
    *   *Contains*: Repository Implementations, Retrofit API interfaces, DTOs, DataStore logic.
    *   *Responsibility*: Fetching data from network or local storage, mapping DTOs to Domain Entities, and implementing the Repository Interfaces defined in the Domain layer.
    *   *Dependency*: Depends on Domain layer (implements its interfaces) and Core network/storage.

*   **Dependency Flow**:
    `UI -> ViewModel -> UseCase -> Repository Interface <- Repository Implementation <- Data Source (API/DB)`

## 4. Scalability Considerations

*   **Modularization**: The folder-by-feature structure allows for easy extraction into separate Gradle modules in the future if build times increase.
*   **Dependency Injection**: Hilt ensures components are decoupled, making testing easier and managing lifecycles of singletons (like SocketManager or Retrofit) seamless.
*   **State Management**: Unidirectional Data Flow (UDF) via StateFlows in ViewModels prevents state inconsistencies in complex screens like the Trade Dashboard.
*   **Network Handling**: Centralized `AuthInterceptor` will handle adding JWT tokens to all requests and gracefully intercepting 401 Unauthorized errors to trigger a logout/token refresh flow.

## 5. Third-Party Integration Strategy

*   **Socket.IO**: A Singleton `SocketManager` will be injected via Hilt. It will expose StateFlows or SharedFlows for connection status and incoming messages, allowing ViewModels to observe real-time events without managing socket lifecycles directly.
*   **Cloudinary Uploads**: Images will be picked via Android PhotoPicker, compressed using a background Coroutine, and uploaded as `MultipartBody.Part` via Retrofit to the existing Node.js backend.
*   **FCM**: A `FirebaseMessagingService` implementation will receive push payloads. The backend must be updated to store FCM device tokens alongside or instead of VAPID subscriptions for Android users.
