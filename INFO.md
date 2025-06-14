
## Core Classes and Their Relationships

### 1. UserAccount
```python
class UserAccount:
    # Primary Attributes
    id: Integer (PK)
    cin: String (unique)
    first_name: String
    last_name: String
    email: String (unique)
    password: String
    gender: String
    phone: String
    profile_picture: String
    bio: Text
    address: String
    city: String
    country: String
    insurance_provider: String
    insurance_id: String
    role: String (default="user")
    language: String (default="en")
    theme: String (default="light")
    created_at: DateTime
    updated_at: DateTime

    # Properties
    is_admin: Boolean (computed)
    is_doctor: Boolean (computed)

    # Relationships
    appointments_as_patient: List[Appointment] (1-to-many)
    appointments_as_doctor: List[Appointment] (1-to-many)
    notifications: List[Notification] (1-to-many)
    documents: List[Document] (1-to-many)
    comments: List[Comment] (1-to-many)
    replies: List[Reply] (1-to-many)
    liked_comments: List[Comment] (many-to-many)
```

### 2. Appointment
```python
class Appointment:
    # Primary Attributes
    id: Integer (PK)
    user_id: Integer (FK)
    doctor_id: Integer (FK, nullable)
    appointment_date: DateTime
    status: String (pending, confirmed, rejected, cancelled)
    reason: String
    rejection_reason: String
    created_at: DateTime

    # Relationships
    user: UserAccount (many-to-1)
    doctor: UserAccount (many-to-1)
```

### 3. Document
```python
class Document:
    # Primary Attributes
    id: Integer (PK)
    user_id: Integer (FK)
    name: String
    file_path: String
    content_type: String
    timestamp: String
    created_at: DateTime

    # Relationships
    user: UserAccount (many-to-1)
```

### 4. Notification
```python
class Notification:
    # Primary Attributes
    id: Integer (PK)
    user_id: Integer (FK)
    actor_id: Integer (FK, nullable)
    message: String
    type: String (enum)
    is_read: Boolean
    link: String
    notification_metadata: JSON
    created_at: DateTime

    # Relationships
    user: UserAccount (many-to-1)
    actor: UserAccount (many-to-1)
```

### 5. Comment
```python
class Comment:
    # Primary Attributes
    id: Integer (PK)
    user_id: Integer (FK)
    content: Text
    likes: Integer (default=0)
    created_at: DateTime
    updated_at: DateTime

    # Relationships
    user: UserAccount (many-to-1)
    replies: List[Reply] (1-to-many)
    liked_by: List[UserAccount] (many-to-many)
```

### 6. Reply
```python
class Reply:
    # Primary Attributes
    id: Integer (PK)
    user_id: Integer (FK)
    comment_id: Integer (FK)
    content: Text
    created_at: DateTime
    updated_at: DateTime

    # Relationships
    user: UserAccount (many-to-1)
    comment: Comment (many-to-1)
```

## Association Tables

### 1. comment_likes
```python
class CommentLikes:
    user_id: Integer (FK)
    comment_id: Integer (FK)
```

## Relationships Summary

### One-to-Many Relationships
1. UserAccount -> Appointment (as patient)
2. UserAccount -> Appointment (as doctor)
3. UserAccount -> Notification
4. UserAccount -> Document
5. UserAccount -> Comment
6. UserAccount -> Reply
7. Comment -> Reply

### Many-to-One Relationships
1. Appointment -> UserAccount (patient)
2. Appointment -> UserAccount (doctor)
3. Document -> UserAccount
4. Notification -> UserAccount
5. Notification -> UserAccount (actor)
6. Comment -> UserAccount
7. Reply -> UserAccount
8. Reply -> Comment

### Many-to-Many Relationships
1. UserAccount <-> Comment (through comment_likes)

## Enums and Constants

### Notification Types
```python
class NotificationType:
    LIKE = "like"
    REPLY = "reply"
    NESTED_REPLY = "nested_reply"
    POST_DELETION = "post_deletion"
    COMMENT_DELETION = "comment_deletion"
    APPOINTMENT_REMINDER = "appointment_reminder"
    PRESCRIPTION_UPDATE = "prescription_update"
    TEST_RESULTS = "test_results"
    SYSTEM = "system"
```

### User Roles
```python
class UserRole:
    ADMIN = "admin"
    DOCTOR = "doctor"
    USER = "user"
```

### Appointment Status
```python
class AppointmentStatus:
    PENDING = "pending"
    CONFIRMED = "confirmed"
    REJECTED = "rejected"
    CANCELLED = "cancelled"
```

## Database Tables

1. user_account
2. appointments
3. documents
4. notifications
5. comments
6. replies
7. comment_likes

## Key Constraints

1. UserAccount:
   - email: unique
   - cin: unique
   - role: default="user"
   - language: default="en"
   - theme: default="light"

2. Appointment:
   - doctor_id: nullable
   - status: default="pending"

3. Document:
   - file_path: unique per user
   - content_type: restricted to allowed types

4. Notification:
   - is_read: default=False
   - type: enum values
   - actor_id: nullable

5. Comment:
   - likes: default=0

## Inheritance and Interfaces

The system uses Pydantic models for data validation and serialization:

1. Base Models:
   - UserBase
   - AppointmentBase
   - DocumentBase
   - NotificationBase
   - CommentBase
   - ReplyBase

2. Create Models:
   - UserCreate
   - AppointmentCreate
   - DocumentCreate
   - NotificationCreate
   - CommentCreate
   - ReplyCreate

3. Response Models:
   - UserResponse
   - AppointmentResponse
   - DocumentResponse
   - NotificationResponse
   - CommentResponse
   - ReplyResponse

## Additional Notes for UML Diagram

1. Use different colors for:
   - Core entities (UserAccount, Appointment)
   - Supporting entities (Document, Notification)
   - Community features (Comment, Reply)

2. Show cardinality:
   - One-to-many relationships with crow's foot notation
   - Many-to-one relationships with single line
   - Optional relationships with dashed lines
   - Many-to-many relationships with association table

3. Include:
   - Primary keys (PK)
   - Foreign keys (FK)
   - Unique constraints
   - Default values
   - Nullable fields
   - Computed properties

4. Group related classes:
   - User management
   - Appointment management
   - Document management
   - Notification system
   - Community features

5. Show cascade delete relationships:
   - UserAccount -> Notification (cascade="all, delete-orphan")
   - UserAccount -> Comment (cascade="all, delete-orphan")
   - UserAccount -> Reply (cascade="all, delete-orphan")
   - Comment -> Reply (cascade="all, delete-orphan") 