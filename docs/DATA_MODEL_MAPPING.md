# Data Model Mapping

This document maps the existing MongoDB Mongoose schemas to their corresponding Kotlin data models for the native Android application. It outlines the structure of the data and relationships between entities.

## 1. User Model

**MongoDB Schema (`User.js`)**
*   `_id`: ObjectId
*   `email`: String
*   `password`: String (Hashed)
*   `full_name`: String
*   `uid`: String
*   `department`: String
*   `hostel`: String
*   `avatar_url`: String
*   `isVerified`: Boolean
*   `rating`: Number
*   `saved_items`: Array<ObjectId> (Ref: Item)
*   `createdAt`, `updatedAt`: Date

**Kotlin DTO (`UserDto.kt`)**
```kotlin
data class UserDto(
    @SerializedName("_id") val id: String,
    val email: String,
    val full_name: String,
    val uid: String,
    val department: String,
    val hostel: String,
    val avatar_url: String?,
    val isVerified: Boolean,
    val rating: Double?,
    val saved_items: List<String>?,
    val createdAt: String,
    val updatedAt: String
)
```

**Kotlin Domain Model (`User.kt`)**
```kotlin
data class User(
    val id: String,
    val email: String,
    val fullName: String,
    val uid: String,
    val department: String,
    val hostel: String,
    val avatarUrl: String?,
    val isVerified: Boolean,
    val rating: Double?,
    val savedItemsIds: List<String>
)
```

## 2. Item Model

**MongoDB Schema (`Item.js`)**
*   `_id`: ObjectId
*   `userId`: ObjectId (Ref: User)
*   `title`: String
*   `description`: String
*   `price`: Number
*   `is_barter_only`: Boolean
*   `is_free`: Boolean
*   `accept_hybrid`: Boolean
*   `category`: String
*   `condition`: String
*   `imageUrls`: Array<String>
*   `hostel_area`: String
*   `quantity`: Number
*   `is_available`: Boolean

**Kotlin DTO (`ItemDto.kt`)**
```kotlin
data class ItemDto(
    @SerializedName("_id") val id: String,
    val userId: String, // Or UserDto if populated
    val title: String,
    val description: String,
    val price: Double?,
    val is_barter_only: Boolean,
    val is_free: Boolean,
    val accept_hybrid: Boolean,
    val category: String,
    val condition: String,
    val imageUrls: List<String>,
    val hostel_area: String,
    val quantity: Int,
    val is_available: Boolean,
    val createdAt: String,
    val updatedAt: String
)
```

**Kotlin Domain Model (`Item.kt`)**
```kotlin
data class Item(
    val id: String,
    val ownerId: String,
    val title: String,
    val description: String,
    val price: Double?,
    val isBarterOnly: Boolean,
    val isFree: Boolean,
    val acceptHybrid: Boolean,
    val category: String,
    val condition: String,
    val imageUrls: List<String>,
    val hostelArea: String,
    val quantity: Int,
    val isAvailable: Boolean
)
```

## 3. Trade Model

**MongoDB Schema (`Trade.js`)**
*   `_id`: ObjectId
*   `item_id`: ObjectId (Ref: Item)
*   `buyer_id`: ObjectId (Ref: User)
*   `seller_id`: ObjectId (Ref: User)
*   `desired_quantity`: Number
*   `type`: String ('barter')
*   `offer_item_desc`: String
*   `message`: String
*   `proposed_items`: Array<ObjectId> (Ref: Item)
*   `proposed_cash`: Number
*   `action_required_from`: ObjectId (Ref: User)
*   `status`: String ('pending', 'accepted', 'declined', 'cancelled', 'completed')

**Kotlin DTO (`TradeDto.kt`)**
```kotlin
data class TradeDto(
    @SerializedName("_id") val id: String,
    val item_id: String, // Or ItemDto
    val buyer_id: String, // Or UserDto
    val seller_id: String, // Or UserDto
    val desired_quantity: Int,
    val type: String,
    val offer_item_desc: String,
    val message: String,
    val proposed_items: List<String>?, // Or List<ItemDto>
    val proposed_cash: Double,
    val action_required_from: String?,
    val status: String,
    val createdAt: String,
    val updatedAt: String
)
```

**Kotlin Domain Model (`Trade.kt`)**
```kotlin
data class Trade(
    val id: String,
    val itemId: String,
    val buyerId: String,
    val sellerId: String,
    val desiredQuantity: Int,
    val tradeType: String,
    val offerDescription: String,
    val message: String,
    val proposedItemIds: List<String>,
    val proposedCash: Double,
    val actionRequiredFromId: String?,
    val status: String
)
```

## 4. Conversation & Message Models

**MongoDB Schema (`Conversation.js`)**
*   `_id`: ObjectId
*   `item_id`: ObjectId
*   `buyer_id`: ObjectId
*   `seller_id`: ObjectId

**MongoDB Schema (`Message.js`)**
*   `_id`: ObjectId
*   `conversation_id`: ObjectId
*   `sender_id`: ObjectId
*   `receiver_id`: ObjectId
*   `content`: String
*   `read`: Boolean

**Kotlin DTOs**
```kotlin
data class ConversationDto(
    @SerializedName("_id") val id: String,
    val item_id: String,
    val buyer_id: String,
    val seller_id: String,
    val createdAt: String,
    val updatedAt: String
)

data class MessageDto(
    @SerializedName("_id") val id: String,
    val conversation_id: String,
    val sender_id: String,
    val receiver_id: String,
    val content: String,
    val read: Boolean,
    val createdAt: String
)
```

**Kotlin Domain Models**
```kotlin
data class Conversation(
    val id: String,
    val itemId: String,
    val buyerId: String,
    val sellerId: String,
    val lastUpdatedAt: Long
)

data class ChatMessage(
    val id: String,
    val conversationId: String,
    val senderId: String,
    val receiverId: String,
    val content: String,
    val isRead: Boolean,
    val timestamp: Long
)
```

## 5. Other Models

**ItemRequest**
Used for users requesting items not currently listed.
*   Kotlin model will mirror properties: `id`, `userId`, `title`, `description`, `category`, `status`.

**Rating**
Used for post-trade reviews.
*   Kotlin model will mirror properties: `id`, `tradeId`, `reviewerId`, `sellerId`, `score`, `comment`.

**PushSubscription**
Handled by FCM token on Android. It maps to the endpoint string/push logic but will likely be adapted to standard FCM token registration in the new system.
